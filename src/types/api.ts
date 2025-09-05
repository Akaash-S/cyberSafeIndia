// Simple API types - no complex imports/exports
export interface ScanResult {
  url: string;
  status: 'safe' | 'suspicious' | 'malicious' | 'unknown';
  confidence: number;
  details: {
    virustotal?: Record<string, unknown>;
    abuseipdb?: Record<string, unknown>;
    community?: {
      threatType?: string;
      severity?: string;
      reportCount?: number;
      reputation?: string;
      source?: string;
    };
  };
  scanDate: string;
  cached: boolean;
}

export interface ScanHistory {
  id: number;
  url: string;
  status: string;
  confidence?: number;
  scanDate: string;
  domain?: string;
  threatType?: string;
  severity?: string;
  details: {
    virustotal?: Record<string, unknown>;
    abuseipdb?: Record<string, unknown>;
    community?: {
      threatType?: string;
      severity?: string;
      reportCount?: number;
      reputation?: string;
      source?: string;
    };
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Analytics types
export interface AnalyticsOverview {
  statusBreakdown?: {
    safe?: number;
    suspicious?: number;
    malicious?: number;
  };
  topDomains?: Array<{
    domain: string;
    count: number;
  }>;
}

export interface AnalyticsTrends {
  trends?: Array<{
    period: string;
    totalScans: number;
    safeScans: number;
    suspiciousScans: number;
    maliciousScans: number;
  }>;
}

export interface ReputationData {
  userContribution?: {
    threatReports?: number;
    safeReports?: number;
    totalReports?: number;
  };
  communityStats?: {
    totalSafeUrls?: number;
    totalThreatUrls?: number;
    totalReputationRecords?: number;
  };
  threatTypeBreakdown?: Array<{
    type: string;
    count: number;
    totalReports: number;
    avgConfidence: number;
  }>;
  reputationTrends?: Array<{
    date: string;
    safeAdditions: number;
    threatAdditions: number;
  }>;
  topReportedDomains?: Array<{
    domain: string;
    totalReports: number;
    safeReports: number;
    threatReports: number;
  }>;
}

export interface ThreatReportsData {
  userStats?: {
    totalReports?: number;
    approvedReports?: number;
    pendingReports?: number;
    rejectedReports?: number;
  };
  threatTypeBreakdown?: Array<{
    type: string;
    count: number;
    approvedCount: number;
  }>;
  severityBreakdown?: Array<{
    severity: string;
    count: number;
  }>;
  recentReports?: Array<{
    date: string;
    count: number;
    approvedCount: number;
  }>;
  topReportedDomains?: Array<{
    domain: string;
    count: number;
    approvedCount: number;
  }>;
}

// Scan history response
export interface ScanHistoryResponse {
  scans: ScanHistory[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
  };
}

// User profile response
export interface UserProfile {
  displayName: string;
  email: string;
}

// Notification settings
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  security: boolean;
  weekly: boolean;
  threatAlerts: boolean;
  scanComplete: boolean;
  reportUpdates: boolean;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Analytics data interface for Excel export
export interface AnalyticsData {
  overview?: {
    totalScans?: number;
    safeScans?: number;
    suspiciousScans?: number;
    maliciousScans?: number;
  };
  threatDistribution?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  scanTrends?: Array<{
    date: string;
    scans: number;
    safe: number;
    suspicious: number;
    malicious: number;
  }>;
  topDomains?: Array<{
    domain: string;
    count: number;
    status: 'safe' | 'suspicious' | 'malicious';
  }>;
  reputationData?: ReputationData;
  threatReportsData?: ThreatReportsData;
}

// API response types for better type safety
export interface ScanStatsResponse {
  totalScans?: number;
  statusBreakdown?: {
    safe?: number;
    suspicious?: number;
    malicious?: number;
  };
}

export interface ThreatReportItem {
  url: string;
  threatType: string;
  severity: string;
  reason?: string;
  domain: string;
  reportDate: string;
  status: string;
}

export interface ScanHistoryItem {
  url: string;
  status: string;
  confidence?: number;
  scanDate: string;
  details?: {
    virustotal?: Record<string, unknown>;
    abuseipdb?: Record<string, unknown>;
    community?: {
      threatType?: string;
      severity?: string;
      reportCount?: number;
      reputation?: string;
      source?: string;
    };
  };
}
