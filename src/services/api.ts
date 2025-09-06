// Simple API service - clean and straightforward
import type { 
  ApiResponse, 
  User, 
  AnalyticsOverview,
  AnalyticsTrends,
  ReputationData,
  ThreatReportsData,
  ScanHistoryResponse,
  UserProfile,
  NotificationSettings
} from '../types/api';
import { requestLimiter } from '../utils/throttle';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to create auth header
const createAuthHeader = (user: User): string => {
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    admin: false
  };
  
  const encodedData = btoa(JSON.stringify(userData));
  return `Bearer ${encodedData}`;
};

// Helper function to make API calls with error handling and rate limiting
const makeApiCall = async (
  url: string, 
  options: RequestInit, 
  user: User,
  endpoint: string
): Promise<ApiResponse> => {
  try {
    // Validate inputs
    if (!url) {
      console.error('makeApiCall: URL is required');
      return {
        success: false,
        error: 'Invalid API endpoint'
      };
    }

    if (!user || !user.uid) {
      console.error('makeApiCall: User is required');
      return {
        success: false,
        error: 'User authentication required'
      };
    }

    // Check rate limiting
    if (!requestLimiter.canMakeRequest(`${user.uid}-${endpoint}`)) {
      const waitTime = requestLimiter.getWaitTime(`${user.uid}-${endpoint}`);
      return {
        success: false,
        error: `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`
      };
    }

    const response = await fetch(url, options);

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      return {
        success: false,
        error: 'Invalid response format from server'
      };
    }

    // Handle specific HTTP status codes
    if (response.status === 409) {
      return {
        success: false,
        error: result.message || 'User already exists',
        data: result.data // Include data for 409 responses
      };
    } else if (response.status === 404) {
      return {
        success: false,
        error: result.message || 'Resource not found'
      };
    } else if (response.status === 429) {
      return {
        success: false,
        error: result.message || 'Too many requests. Please wait before trying again.'
      };
    } else if (response.status >= 400) {
      return {
        success: false,
        error: result.message || result.error || `Request failed with status ${response.status}`
      };
    }

    return result;
  } catch (error) {
    console.error(`API call error for ${endpoint}:`, error);
    
    // Handle specific error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
};

// API service class
class ApiService {
  // Scan URL
  async scanUrl(url: string, user: User): Promise<ApiResponse> {
    return makeApiCall(
      `${API_BASE_URL}/scan`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': createAuthHeader(user)
        },
        body: JSON.stringify({ url })
      },
      user,
      'scan'
    );
  }

  // Get scan history
  async getScanHistory(user: User, params: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<ApiResponse<ScanHistoryResponse>> {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();

    return makeApiCall(
      `${API_BASE_URL}/history?${queryString}`,
      {
        headers: { 'Authorization': createAuthHeader(user) }
      },
      user,
      'history'
    ) as Promise<ApiResponse<ScanHistoryResponse>>;
  }

  // Get scan statistics
  async getScanStats(user: User): Promise<ApiResponse> {
    return makeApiCall(
      `${API_BASE_URL}/history/stats`,
      {
        headers: { 'Authorization': createAuthHeader(user) }
      },
      user,
      'stats'
    );
  }

  // Submit report
  async submitReport(url: string, reason: string, user: User): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': createAuthHeader(user)
        },
        body: JSON.stringify({ url, reason })
      });
      return await response.json();
    } catch (error) {
      console.error('Submit report error:', error);
      return { success: false, error: 'Failed to submit report' };
    }
  }

  // Report URL (alias for submitReport)
  async reportUrl(url: string, reason: string, user: User): Promise<ApiResponse> {
    return this.submitReport(url, reason, user);
  }

  // Check URL reputation
  async checkUrlReputation(url: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/reputation/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      return await response.json();
    } catch (error) {
      console.error('Check URL reputation error:', error);
      return { success: false, error: 'Failed to check URL reputation' };
    }
  }

  // Get analytics overview
  async getAnalyticsOverview(user: User): Promise<ApiResponse<AnalyticsOverview>> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
        headers: { 'Authorization': createAuthHeader(user) }
      });
      return await response.json();
    } catch (error) {
      console.error('Get analytics overview error:', error);
      return { success: false, error: 'Failed to fetch analytics overview' };
    }
  }

  // Get analytics trends
  async getAnalyticsTrends(user: User, params: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<AnalyticsTrends>> {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();

      const response = await fetch(`${API_BASE_URL}/analytics/trends?${queryString}`, {
        headers: { 'Authorization': createAuthHeader(user) }
      });
      return await response.json();
    } catch (error) {
      console.error('Get analytics trends error:', error);
      return { success: false, error: 'Failed to fetch analytics trends' };
    }
  }

  // Get user profile
  async getUserProfile(user: User): Promise<ApiResponse<UserProfile>> {
    return makeApiCall(
      `${API_BASE_URL}/user/profile`,
      {
        headers: { 'Authorization': createAuthHeader(user) }
      },
      user,
      'profile'
    ) as Promise<ApiResponse<UserProfile>>;
  }

  // Update user profile
  async updateUserProfile(displayName: string, user: User): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': createAuthHeader(user)
        },
        body: JSON.stringify({ displayName })
      });
      return await response.json();
    } catch (error) {
      console.error('Update user profile error:', error);
      return { success: false, error: 'Failed to update user profile' };
    }
  }

  // Delete scan
  async deleteScan(scanId: number, user: User): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/history/${scanId}`, {
        method: 'DELETE',
        headers: { 'Authorization': createAuthHeader(user) }
      });
      return await response.json();
    } catch (error) {
      console.error('Delete scan error:', error);
      return { success: false, error: 'Failed to delete scan' };
    }
  }

  // Export scan history
  async exportScanHistory(user: User): Promise<Blob | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/history/export`, {
        headers: { 'Authorization': createAuthHeader(user) }
      });

      if (response.ok) {
        return await response.blob();
      } else {
        console.error('Export failed:', await response.text());
        return null;
      }
    } catch (error) {
      console.error('Export scan history error:', error);
      return null;
    }
  }

  // Get reputation analytics
  async getReputationAnalytics(user: User): Promise<ApiResponse<ReputationData>> {
    return makeApiCall(
      `${API_BASE_URL}/analytics/reputation`,
      {
        headers: { 'Authorization': createAuthHeader(user) }
      },
      user,
      'reputation'
    ) as Promise<ApiResponse<ReputationData>>;
  }

  // Get threat reports analytics
  async getThreatReportsAnalytics(user: User): Promise<ApiResponse<ThreatReportsData>> {
    return makeApiCall(
      `${API_BASE_URL}/reports/analytics`,
      {
        headers: { 'Authorization': createAuthHeader(user) }
      },
      user,
      'reports'
    ) as Promise<ApiResponse<ThreatReportsData>>;
  }

  // Get user's threat reports for export
  async getUserThreatReports(user: User): Promise<ApiResponse> {
    return makeApiCall(
      `${API_BASE_URL}/reports/my`,
      {
        headers: { 'Authorization': createAuthHeader(user) }
      },
      user,
      'reports'
    );
  }

  // Get notification preferences
  async getNotificationPreferences(user: User): Promise<ApiResponse<NotificationSettings>> {
    return makeApiCall(
      `${API_BASE_URL}/notifications/preferences`,
      {
        headers: { 'Authorization': createAuthHeader(user) }
      },
      user,
      'notifications'
    ) as Promise<ApiResponse<NotificationSettings>>;
  }

  // Update notification preferences
  async updateNotificationPreferences(user: User, preferences: Record<string, unknown>): Promise<ApiResponse> {
    return makeApiCall(
      `${API_BASE_URL}/notifications/preferences`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': createAuthHeader(user)
        },
        body: JSON.stringify(preferences)
      },
      user,
      'notifications'
    );
  }

  // Test notification
  async testNotification(user: User, type: string, message: string): Promise<ApiResponse> {
    return makeApiCall(
      `${API_BASE_URL}/notifications/test`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': createAuthHeader(user)
        },
        body: JSON.stringify({ type, message })
      },
      user,
      'notifications'
    );
  }

  // Delete user account
  async deleteUserAccount(user: User): Promise<ApiResponse> {
    return makeApiCall(
      `${API_BASE_URL}/user/profile`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': createAuthHeader(user)
        }
      },
      user,
      'profile'
    );
  }
}

export default new ApiService();
