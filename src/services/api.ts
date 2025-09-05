// Simple API service - clean and straightforward
import type { ApiResponse, User } from '../types/api';

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
  } = {}): Promise<ApiResponse> {
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

  // Get analytics overview
  async getAnalyticsOverview(user: User): Promise<ApiResponse> {
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
  } = {}): Promise<ApiResponse> {
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
  async getUserProfile(user: User): Promise<ApiResponse> {
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
}

export default new ApiService();
