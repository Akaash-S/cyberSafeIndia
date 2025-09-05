import * as XLSX from 'xlsx';
import type { AnalyticsData } from '../types/api';

export interface ScanHistoryExport {
  url: string;
  status: string;
  confidence: number;
  scanDate: string;
  threatType?: string;
  severity?: string;
  domain?: string;
}

export interface ThreatReportExport {
  url: string;
  threatType: string;
  severity: string;
  reason?: string;
  domain?: string;
  reportDate: string;
  status: string;
}

export interface AnalyticsExport {
  metric: string;
  value: number;
  category: string;
  date?: string;
}

// Export scan history to Excel
export const exportScanHistoryToExcel = (scanHistory: ScanHistoryExport[], filename?: string) => {
  const worksheet = XLSX.utils.json_to_sheet(scanHistory);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Scan History');
  
  // Auto-size columns
  const colWidths = [
    { wch: 50 }, // URL
    { wch: 15 }, // Status
    { wch: 12 }, // Confidence
    { wch: 20 }, // Scan Date
    { wch: 15 }, // Threat Type
    { wch: 10 }, // Severity
    { wch: 30 }  // Domain
  ];
  worksheet['!cols'] = colWidths;
  
  const fileName = filename || `scan-history-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Export threat reports to Excel
export const exportThreatReportsToExcel = (threatReports: ThreatReportExport[], filename?: string) => {
  const worksheet = XLSX.utils.json_to_sheet(threatReports);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Threat Reports');
  
  // Auto-size columns
  const colWidths = [
    { wch: 50 }, // URL
    { wch: 15 }, // Threat Type
    { wch: 10 }, // Severity
    { wch: 30 }, // Reason
    { wch: 30 }, // Domain
    { wch: 20 }, // Report Date
    { wch: 12 }  // Status
  ];
  worksheet['!cols'] = colWidths;
  
  const fileName = filename || `threat-reports-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Export analytics data to Excel
export const exportAnalyticsToExcel = (analyticsData: AnalyticsData, filename?: string) => {
  const workbook = XLSX.utils.book_new();
  
  // Create multiple sheets for different analytics data
  
  // 1. Overview Sheet
  if (analyticsData.overview) {
    const overviewData = [
      { Metric: 'Total Scans', Value: analyticsData.overview.totalScans || 0 },
      { Metric: 'Safe Scans', Value: analyticsData.overview.safeScans || 0 },
      { Metric: 'Suspicious Scans', Value: analyticsData.overview.suspiciousScans || 0 },
      { Metric: 'Malicious Scans', Value: analyticsData.overview.maliciousScans || 0 }
    ];
    const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');
  }
  
  // 2. Threat Distribution Sheet
  if (analyticsData.threatDistribution) {
    const threatDistSheet = XLSX.utils.json_to_sheet(analyticsData.threatDistribution);
    XLSX.utils.book_append_sheet(workbook, threatDistSheet, 'Threat Distribution');
  }
  
  // 3. Scan Trends Sheet
  if (analyticsData.scanTrends) {
    const trendsSheet = XLSX.utils.json_to_sheet(analyticsData.scanTrends);
    XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Scan Trends');
  }
  
  // 4. Top Domains Sheet
  if (analyticsData.topDomains) {
    const domainsSheet = XLSX.utils.json_to_sheet(analyticsData.topDomains);
    XLSX.utils.book_append_sheet(workbook, domainsSheet, 'Top Domains');
  }
  
  // 5. Community Reputation Sheet
  if (analyticsData.reputationData) {
    const reputationData = [
      { Metric: 'Total Safe URLs', Value: analyticsData.reputationData.communityStats?.totalSafeUrls || 0 },
      { Metric: 'Total Threat URLs', Value: analyticsData.reputationData.communityStats?.totalThreatUrls || 0 },
      { Metric: 'Total Reputation Records', Value: analyticsData.reputationData.communityStats?.totalReputationRecords || 0 },
      { Metric: 'Your Threat Reports', Value: analyticsData.reputationData.userContribution?.threatReports || 0 },
      { Metric: 'Your Safe Reports', Value: analyticsData.reputationData.userContribution?.safeReports || 0 }
    ];
    const reputationSheet = XLSX.utils.json_to_sheet(reputationData);
    XLSX.utils.book_append_sheet(workbook, reputationSheet, 'Community Reputation');
  }
  
  // 6. Threat Reports Analytics Sheet
  if (analyticsData.threatReportsData) {
    const threatReportsData = [
      { Metric: 'Total Reports', Value: analyticsData.threatReportsData.userStats?.totalReports || 0 },
      { Metric: 'Approved Reports', Value: analyticsData.threatReportsData.userStats?.approvedReports || 0 },
      { Metric: 'Pending Reports', Value: analyticsData.threatReportsData.userStats?.pendingReports || 0 },
      { Metric: 'Rejected Reports', Value: analyticsData.threatReportsData.userStats?.rejectedReports || 0 }
    ];
    const threatReportsSheet = XLSX.utils.json_to_sheet(threatReportsData);
    XLSX.utils.book_append_sheet(workbook, threatReportsSheet, 'Threat Reports Analytics');
  }
  
  const fileName = filename || `analytics-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Export comprehensive security report
export const exportComprehensiveReport = (
  scanHistory: ScanHistoryExport[],
  threatReports: ThreatReportExport[],
  analyticsData: Record<string, unknown>,
  filename?: string
) => {
  const workbook = XLSX.utils.book_new();
  
  // 1. Executive Summary
  const summaryData = [
    { Metric: 'Total URLs Scanned', Value: scanHistory.length },
    { Metric: 'Threat Reports Submitted', Value: threatReports.length },
    { Metric: 'Malicious URLs Detected', Value: scanHistory.filter(s => s.status === 'malicious').length },
    { Metric: 'Suspicious URLs Detected', Value: scanHistory.filter(s => s.status === 'suspicious').length },
    { Metric: 'Safe URLs Confirmed', Value: scanHistory.filter(s => s.status === 'safe').length },
    { Metric: 'Approved Threat Reports', Value: threatReports.filter(t => t.status === 'approved').length }
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');
  
  // 2. Scan History
  if (scanHistory.length > 0) {
    const scanSheet = XLSX.utils.json_to_sheet(scanHistory);
    XLSX.utils.book_append_sheet(workbook, scanSheet, 'Scan History');
  }
  
  // 3. Threat Reports
  if (threatReports.length > 0) {
    const threatSheet = XLSX.utils.json_to_sheet(threatReports);
    XLSX.utils.book_append_sheet(workbook, threatSheet, 'Threat Reports');
  }
  
  // 4. Analytics Overview
  if (analyticsData) {
    const analyticsOverview = [
      { Category: 'Scanning Activity', Metric: 'Total Scans', Value: analyticsData.totalScans || 0 },
      { Category: 'Scanning Activity', Metric: 'Malicious Detections', Value: analyticsData.maliciousScans || 0 },
      { Category: 'Scanning Activity', Metric: 'Suspicious Detections', Value: analyticsData.suspiciousScans || 0 },
      { Category: 'Scanning Activity', Metric: 'Safe Confirmations', Value: analyticsData.safeScans || 0 }
    ];
    const analyticsSheet = XLSX.utils.json_to_sheet(analyticsOverview);
    XLSX.utils.book_append_sheet(workbook, analyticsSheet, 'Analytics Overview');
  }
  
  const fileName = filename || `security-report-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
