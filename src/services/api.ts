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

const API_BASE_URL = 'http://localhost:5000/api';

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

// API service class
class ApiService {
  // Scan URL
  async scanUrl(url: string, user: User): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': createAuthHeader(user)
        },
        body: JSON.stringify({ url })
      });
      return await response.json();
    } catch (error) {
      console.error('Scan URL error:', error);
      return { success: false, error: 'Failed to scan URL' };
    }
  }

  // Get scan history
  async getScanHistory(user: User, params: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<ApiResponse<ScanHistoryResponse>> {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();

      const response = await fetch(`${API_BASE_URL}/history?${queryString}`, {
        headers: { 'Authorization': createAuthHeader(user) }
      });
      return await response.json();
    } catch (error) {
      console.error('Get scan history error:', error);
      return { success: false, error: 'Failed to fetch scan history' };
    }
  }

  // Get scan statistics
  async getScanStats(user: User): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/history/stats`, {
        headers: { 'Authorization': createAuthHeader(user) }
      });
      return await response.json();
    } catch (error) {
      console.error('Get scan stats error:', error);
      return { success: false, error: 'Failed to fetch scan statistics' };
    }
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
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: { 'Authorization': createAuthHeader(user) }
      });
      return await response.json();
    } catch (error) {
      console.error('Get user profile error:', error);
      return { success: false, error: 'Failed to fetch user profile' };
    }
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
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/reputation`, {
        headers: { 'Authorization': createAuthHeader(user) }
      });
      return await response.json();
    } catch (error) {
      console.error('Get reputation analytics error:', error);
      return { success: false, error: 'Failed to fetch reputation analytics' };
    }
  }

  // Get threat reports analytics
  async getThreatReportsAnalytics(user: User): Promise<ApiResponse<ThreatReportsData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/analytics`, {
        headers: { 'Authorization': createAuthHeader(user) }
      });
      return await response.json();
    } catch (error) {
      console.error('Get threat reports analytics error:', error);
      return { success: false, error: 'Failed to fetch threat reports analytics' };
    }
  }

  // Get user's threat reports for export
  async getUserThreatReports(user: User): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/my`, {
        headers: { 'Authorization': createAuthHeader(user) }
      });
      return await response.json();
    } catch (error) {
      console.error('Get user threat reports error:', error);
      return { success: false, error: 'Failed to fetch threat reports' };
    }
  }

  // Get notification preferences
  async getNotificationPreferences(user: User): Promise<ApiResponse<NotificationSettings>> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        headers: { 'Authorization': createAuthHeader(user) }
      });
      return await response.json();
    } catch (error) {
      console.error('Get notification preferences error:', error);
      return { success: false, error: 'Failed to fetch notification preferences' };
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(user: User, preferences: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': createAuthHeader(user)
        },
        body: JSON.stringify(preferences)
      });
      return await response.json();
    } catch (error) {
      console.error('Update notification preferences error:', error);
      return { success: false, error: 'Failed to update notification preferences' };
    }
  }

  // Test notification
  async testNotification(user: User, type: string, message: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': createAuthHeader(user)
        },
        body: JSON.stringify({ type, message })
      });
      return await response.json();
    } catch (error) {
      console.error('Test notification error:', error);
      return { success: false, error: 'Failed to send test notification' };
    }
  }

  // Delete user account
  async deleteUserAccount(user: User): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': createAuthHeader(user)
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Delete user account error:', error);
      return { success: false, error: 'Failed to delete user account' };
    }
  }
}

export default new ApiService();
