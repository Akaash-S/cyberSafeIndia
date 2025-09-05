// Simple API types - no complex imports/exports
export interface ScanResult {
  url: string;
  status: 'safe' | 'suspicious' | 'malicious' | 'unknown';
  confidence: number;
  details: {
    virustotal: any;
    abuseipdb: any;
  };
  scanDate: string;
  cached: boolean;
}

export interface ScanHistory {
  id: number;
  url: string;
  status: string;
  scanDate: string;
  details: {
    virustotal: any;
    abuseipdb: any;
  };
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
