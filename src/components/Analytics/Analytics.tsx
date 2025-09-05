import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle, 
  XCircle,
  Users,
  Flag,
  CheckCircle,
  Globe,
  BarChart3,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';
import { 
  exportScanHistoryToExcel, 
  exportThreatReportsToExcel, 
  exportComprehensiveReport,
  type ScanHistoryExport,
  type ThreatReportExport
} from '../../utils/excelExport';
import type { ScanHistoryItem, ThreatReportItem } from '../../types/api';

interface AnalyticsData {
  threatDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  weeklyScans: {
    date: string;
    scans: number;
    safe: number;
    suspicious: number;
    malicious: number;
  }[];
  topDomains: {
    domain: string;
    count: number;
    status: 'safe' | 'suspicious' | 'malicious';
  }[];
  threatTrends: {
    month: string;
    safe: number;
    suspicious: number;
    malicious: number;
  }[];
  totalScans: number;
  safeScans: number;
  suspiciousScans: number;
  maliciousScans: number;
}

interface Trend {
  period: string;
  totalScans: number;
  safeScans: number;
  suspiciousScans: number;
  maliciousScans: number;
}

interface Domain {
  domain: string;
  totalScans: number;
  maliciousScans: number;
}

interface ReputationData {
  userContribution: {
    threatReports: number;
    safeReports: number;
    totalReports: number;
  };
  communityStats: {
    totalSafeUrls: number;
    totalThreatUrls: number;
    totalReputationRecords: number;
    totalSafeReports: number;
    totalThreatReports: number;
  };
  threatTypeBreakdown: {
    type: string;
    count: number;
    totalReports: number;
    avgConfidence: number;
  }[];
  reputationTrends: {
    date: string;
    safeAdditions: number;
    threatAdditions: number;
  }[];
  topReportedDomains: {
    domain: string;
    totalReports: number;
    safeReports: number;
    threatReports: number;
  }[];
}

interface ThreatReportsData {
  userStats: {
    totalReports: number;
    approvedReports: number;
    pendingReports: number;
    rejectedReports: number;
  };
  threatTypeBreakdown: {
    type: string;
    count: number;
    approvedCount: number;
  }[];
  severityBreakdown: {
    severity: string;
    count: number;
  }[];
  recentReports: {
    date: string;
    count: number;
    approvedCount: number;
  }[];
  topReportedDomains: {
    domain: string;
    count: number;
    approvedCount: number;
  }[];
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [reputationData, setReputationData] = useState<ReputationData | null>(null);
  const [threatReportsData, setThreatReportsData] = useState<ThreatReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [exporting, setExporting] = useState(false);

  // Load analytics data from API
  const loadAnalyticsData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load overview data
      const overviewResponse = await apiService.getAnalyticsOverview(user);
      
      // Load trends data
      const trendsResponse = await apiService.getAnalyticsTrends(user, {
        period: timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'year'
      });

      // Load reputation data
      const reputationResponse = await apiService.getReputationAnalytics(user);
      
      // Load threat reports data
      const threatReportsResponse = await apiService.getThreatReportsAnalytics(user);

      if (overviewResponse.success && overviewResponse.data && trendsResponse.success && trendsResponse.data) {
        const overview = overviewResponse.data;
        const trends = trendsResponse.data;

        const analyticsData: AnalyticsData = {
          threatDistribution: [
            { 
              name: 'Safe', 
              value: overview.statusBreakdown.safe || 0, 
              color: '#22c55e' 
            },
            { 
              name: 'Suspicious', 
              value: overview.statusBreakdown.suspicious || 0, 
              color: '#f59e0b' 
            },
            { 
              name: 'Malicious', 
              value: overview.statusBreakdown.malicious || 0, 
              color: '#ef4444' 
            }
          ],
          weeklyScans: trends.trends && trends.trends.length > 0 ? trends.trends.map((trend: Trend) => ({
            date: new Date(trend.period).toISOString().split('T')[0],
            scans: trend.totalScans,
            safe: trend.safeScans,
            suspicious: trend.suspiciousScans,
            malicious: trend.maliciousScans
          })) : [],
          topDomains: overview.topDomains && overview.topDomains.length > 0 ? overview.topDomains.map((domain: Domain) => ({
            domain: domain.domain,
            count: domain.totalScans,
            status: domain.maliciousScans > 0 ? 'malicious' : 'safe'
          })) : [],
          threatTrends: trends.trends && trends.trends.length > 0 ? trends.trends.map((trend: Trend) => ({
            month: new Date(trend.period).toLocaleDateString('en-US', { month: 'short' }),
            safe: trend.safeScans,
            suspicious: trend.suspiciousScans,
            malicious: trend.maliciousScans
          })) : [],
          totalScans: overview.statusBreakdown.safe + overview.statusBreakdown.suspicious + overview.statusBreakdown.malicious,
          safeScans: overview.statusBreakdown.safe,
          suspiciousScans: overview.statusBreakdown.suspicious,
          maliciousScans: overview.statusBreakdown.malicious
        };

        setData(analyticsData);
        
        // Set reputation data if available
        if (reputationResponse.success && reputationResponse.data) {
          setReputationData(reputationResponse.data);
        }
        
        // Set threat reports data if available
        if (threatReportsResponse.success && threatReportsResponse.data) {
          setThreatReportsData(threatReportsResponse.data);
        }
      } else {
        console.error('Failed to load analytics data:', overviewResponse.error || trendsResponse.error);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, timeRange]);

  // Export functions
  const handleExportScanHistory = async () => {
    if (!user) return;
    
    setExporting(true);
    try {
      const response = await apiService.getScanHistory(user);
      if (response.success && response.data) {
        const scanHistory: ScanHistoryExport[] = (response.data.scans as ScanHistoryItem[]).map((scan: ScanHistoryItem) => ({
          url: scan.url,
          status: scan.status,
          confidence: scan.confidence || 0,
          scanDate: scan.scanDate,
          domain: scan.url ? new URL(scan.url).hostname : '',
          threatType: scan.details?.community?.threatType || '',
          severity: scan.details?.community?.severity || ''
        }));
        exportScanHistoryToExcel(scanHistory);
      }
    } catch (error) {
      console.error('Export scan history error:', error);
      alert('Failed to export scan history');
    } finally {
      setExporting(false);
    }
  };

  const handleExportThreatReports = async () => {
    if (!user) return;
    
    setExporting(true);
    try {
      const response = await apiService.getUserThreatReports(user);
      if (response.success && response.data) {
        const threatReports: ThreatReportExport[] = (response.data as ThreatReportItem[]).map((report: ThreatReportItem) => ({
          url: report.url,
          threatType: report.threatType,
          severity: report.severity,
          reason: report.reason,
          domain: report.domain,
          reportDate: report.reportDate,
          status: report.status
        }));
        exportThreatReportsToExcel(threatReports);
      }
    } catch (error) {
      console.error('Export threat reports error:', error);
      alert('Failed to export threat reports');
    } finally {
      setExporting(false);
    }
  };

  // const handleExportAnalytics = () => {
  //   if (!data) return;
  //   
  //   const analyticsData = {
  //     overview: {
  //       totalScans: data.totalScans,
  //       safeScans: data.safeScans,
  //       suspiciousScans: data.suspiciousScans,
  //       maliciousScans: data.maliciousScans
  //     },
  //     threatDistribution: data.threatDistribution,
  //     scanTrends: data.weeklyScans,
  //     topDomains: data.topDomains,
  //     reputationData: reputationData,
  //     threatReportsData: threatReportsData
  //   };
  //   
  //   exportAnalyticsToExcel(analyticsData);
  // };

  const handleExportComprehensiveReport = async () => {
    if (!user || !data) return;
    
    setExporting(true);
    try {
      // Get scan history
      const scanHistoryResponse = await apiService.getScanHistory(user);
      const scanHistory: ScanHistoryExport[] = scanHistoryResponse.success && scanHistoryResponse.data 
        ? (scanHistoryResponse.data.scans as ScanHistoryItem[]).map((scan: ScanHistoryItem) => ({
            url: scan.url,
            status: scan.status,
            confidence: scan.confidence || 0,
            scanDate: scan.scanDate,
            domain: scan.url ? new URL(scan.url).hostname : '',
            threatType: scan.details?.community?.threatType || '',
            severity: scan.details?.community?.severity || ''
          }))
        : [];

      // Get threat reports
      const threatReportsResponse = await apiService.getUserThreatReports(user);
      const threatReports: ThreatReportExport[] = threatReportsResponse.success && threatReportsResponse.data
        ? (threatReportsResponse.data as ThreatReportItem[]).map((report: ThreatReportItem) => ({
            url: report.url,
            threatType: report.threatType,
            severity: report.severity,
            reason: report.reason,
            domain: report.domain,
            reportDate: report.reportDate,
            status: report.status
          }))
        : [];

      // Prepare analytics data
      const analyticsData = {
        totalScans: data.totalScans,
        maliciousScans: data.maliciousScans,
        suspiciousScans: data.suspiciousScans,
        safeScans: data.safeScans
      };

      exportComprehensiveReport(scanHistory, threatReports, analyticsData);
    } catch (error) {
      console.error('Export comprehensive report error:', error);
      alert('Failed to export comprehensive report');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [user, timeRange, loadAnalyticsData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <Shield className="w-4 h-4 text-success-600" />;
      case 'suspicious':
        return <AlertTriangle className="w-4 h-4 text-warning-600" />;
      case 'malicious':
        return <XCircle className="w-4 h-4 text-danger-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'text-success-600';
      case 'suspicious':
        return 'text-warning-600';
      case 'malicious':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Analytics Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Start scanning URLs to see your analytics data here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Security Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Insights and trends from your security scans
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="input-field"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
          
          {/* Export Buttons */}
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={handleExportScanHistory}
              disabled={exporting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              title="Export Scan History"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Scan History</span>
            </motion.button>
            
            <motion.button
              onClick={handleExportThreatReports}
              disabled={exporting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              title="Export Threat Reports"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Threat Reports</span>
            </motion.button>
            
            <motion.button
              onClick={handleExportComprehensiveReport}
              disabled={exporting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              title="Export Comprehensive Report"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Full Report</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Scans</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data ? data.threatDistribution.reduce((sum, item) => sum + item.value, 0) : 0}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-success-600 mr-1" />
                <span className="text-sm text-success-600">+12.5%</span>
              </div>
            </div>
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Threats Blocked</p>
              <p className="text-2xl font-bold text-danger-600">
                {data ? data.threatDistribution.find(item => item.name === 'Malicious')?.value || 0 : 0}
              </p>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-4 h-4 text-success-600 mr-1" />
                <span className="text-sm text-success-600">-5.2%</span>
              </div>
            </div>
            <XCircle className="w-8 h-8 text-danger-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Safe Rate</p>
              <p className="text-2xl font-bold text-success-600">
                {data ? Math.round((data.threatDistribution.find(item => item.name === 'Safe')?.value || 0) / 
                  Math.max(data.threatDistribution.reduce((sum, item) => sum + item.value, 0), 1) * 100) : 0}%
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-success-600 mr-1" />
                <span className="text-sm text-success-600">+2.1%</span>
              </div>
            </div>
            <Shield className="w-8 h-8 text-success-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Community Reports</p>
              <p className="text-2xl font-bold text-primary-600">
                {reputationData ? reputationData.userContribution.totalReports : 0}
              </p>
              <div className="flex items-center mt-1">
                <Users className="w-4 h-4 text-primary-600 mr-1" />
                <span className="text-sm text-primary-600">Your contribution</span>
              </div>
            </div>
            <Flag className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Threat Distribution Pie Chart */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="card"
         >
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
             Threat Distribution
           </h3>
           <div className="h-64">
             {data.threatDistribution.some(item => item.value > 0) ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={data.threatDistribution}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={100}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {data.threatDistribution.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip content={<CustomTooltip />} />
                   <Legend />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                 No data available
               </div>
             )}
           </div>
         </motion.div>

                 {/* Weekly Scans Bar Chart */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="card"
         >
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
             Weekly Scan Activity
           </h3>
           <div className="h-64">
             {data.weeklyScans.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data.weeklyScans}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="date" />
                   <YAxis />
                   <Tooltip content={<CustomTooltip />} />
                   <Legend />
                   <Bar dataKey="safe" stackId="a" fill="#22c55e" name="Safe" />
                   <Bar dataKey="suspicious" stackId="a" fill="#f59e0b" name="Suspicious" />
                   <Bar dataKey="malicious" stackId="a" fill="#ef4444" name="Malicious" />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                 No data available
               </div>
             )}
           </div>
         </motion.div>
      </div>

             {/* Threat Trends Line Chart */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.4 }}
         className="card"
       >
         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
           Threat Trends Over Time
         </h3>
         <div className="h-64">
           {data.threatTrends.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={data.threatTrends}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="month" />
                 <YAxis />
                 <Tooltip content={<CustomTooltip />} />
                 <Legend />
                 <Line type="monotone" dataKey="safe" stroke="#22c55e" strokeWidth={2} name="Safe" />
                 <Line type="monotone" dataKey="suspicious" stroke="#f59e0b" strokeWidth={2} name="Suspicious" />
                 <Line type="monotone" dataKey="malicious" stroke="#ef4444" strokeWidth={2} name="Malicious" />
               </LineChart>
             </ResponsiveContainer>
           ) : (
             <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
               No data available
             </div>
           )}
         </div>
       </motion.div>

             {/* Top Domains */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.5 }}
         className="card"
       >
         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
           Most Scanned Domains
         </h3>
         <div className="space-y-3">
           {data.topDomains.length > 0 ? (
             data.topDomains.map((domain, index) => (
               <motion.div
                 key={domain.domain}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: index * 0.1 }}
                 className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
               >
                 <div className="flex items-center space-x-3">
                   <div className="flex-shrink-0">
                     {getStatusIcon(domain.status)}
                   </div>
                   <div>
                     <p className="font-medium text-gray-900 dark:text-white">
                       {domain.domain}
                     </p>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       {domain.count} scans
                     </p>
                   </div>
                 </div>
                 <div className="flex items-center space-x-2">
                   <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(domain.status)}`}>
                     {domain.status}
                   </span>
                   <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                     <div
                       className="bg-primary-600 h-2 rounded-full"
                       style={{ width: `${(domain.count / Math.max(...data.topDomains.map(d => d.count))) * 100}%` }}
                     ></div>
                   </div>
                 </div>
               </motion.div>
             ))
           ) : (
             <div className="text-center py-8 text-gray-500 dark:text-gray-400">
               No domain data available
             </div>
           )}
         </div>
       </motion.div>

       {/* Community Reputation Analytics */}
       {reputationData && (
         <>
           {/* Community Stats */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6 }}
             className="card"
           >
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
               <Users className="w-5 h-5 mr-2 text-primary-600" />
               Community Reputation
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                 <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                 <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                   {reputationData.communityStats.totalSafeUrls}
                 </p>
                 <p className="text-sm text-gray-600 dark:text-gray-400">Safe URLs</p>
               </div>
               <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                 <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                 <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                   {reputationData.communityStats.totalThreatUrls}
                 </p>
                 <p className="text-sm text-gray-600 dark:text-gray-400">Threat URLs</p>
               </div>
               <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                 <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                 <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                   {reputationData.communityStats.totalReputationRecords}
                 </p>
                 <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
               </div>
             </div>
           </motion.div>

           {/* Threat Type Breakdown */}
           {reputationData.threatTypeBreakdown.length > 0 && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.7 }}
               className="card"
             >
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                 <Flag className="w-5 h-5 mr-2 text-danger-600" />
                 Threat Type Breakdown
               </h3>
               <div className="space-y-3">
                 {reputationData.threatTypeBreakdown.map((threat, index) => (
                   <motion.div
                     key={threat.type}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.1 }}
                     className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                   >
                     <div className="flex items-center space-x-3">
                       <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                       <div>
                         <p className="font-medium text-gray-900 dark:text-white capitalize">
                           {threat.type.replace('_', ' ')}
                         </p>
                         <p className="text-sm text-gray-600 dark:text-gray-400">
                           {threat.totalReports} reports • {Math.round(threat.avgConfidence)}% confidence
                         </p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-lg font-bold text-gray-900 dark:text-white">
                         {threat.count}
                       </p>
                       <p className="text-sm text-gray-600 dark:text-gray-400">URLs</p>
                     </div>
                   </motion.div>
                 ))}
               </div>
             </motion.div>
           )}

           {/* Reputation Trends Chart */}
           {reputationData.reputationTrends.length > 0 && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.8 }}
               className="card"
             >
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                 <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                 Community Reputation Trends
               </h3>
               <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={reputationData.reputationTrends}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="date" />
                     <YAxis />
                     <Tooltip content={<CustomTooltip />} />
                     <Legend />
                     <Line 
                       type="monotone" 
                       dataKey="safeAdditions" 
                       stroke="#22c55e" 
                       strokeWidth={2} 
                       name="Safe URLs Added" 
                     />
                     <Line 
                       type="monotone" 
                       dataKey="threatAdditions" 
                       stroke="#ef4444" 
                       strokeWidth={2} 
                       name="Threat URLs Added" 
                     />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             </motion.div>
           )}

           {/* Most Reported Domains */}
           {reputationData.topReportedDomains.length > 0 && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.9 }}
               className="card"
             >
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                 <Globe className="w-5 h-5 mr-2 text-primary-600" />
                 Most Reported Domains
               </h3>
               <div className="space-y-3">
                 {reputationData.topReportedDomains.map((domain, index) => (
                   <motion.div
                     key={domain.domain}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.1 }}
                     className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                   >
                     <div className="flex items-center space-x-3">
                       <Globe className="w-5 h-5 text-gray-400" />
                       <div>
                         <p className="font-medium text-gray-900 dark:text-white">
                           {domain.domain}
                         </p>
                         <p className="text-sm text-gray-600 dark:text-gray-400">
                           {domain.safeReports} safe • {domain.threatReports} threats
                         </p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-lg font-bold text-gray-900 dark:text-white">
                         {domain.totalReports}
                       </p>
                       <p className="text-sm text-gray-600 dark:text-gray-400">Total reports</p>
                     </div>
                   </motion.div>
                 ))}
               </div>
             </motion.div>
           )}
         </>
       )}

       {/* Threat Reports Analytics */}
       {threatReportsData && (
         <>
           {/* Threat Reports Stats */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1.0 }}
             className="card"
           >
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
               <Flag className="w-5 h-5 mr-2 text-red-600" />
               Your Threat Reports
             </h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                 <div className="flex items-center">
                   <Flag className="w-8 h-8 text-red-600" />
                   <div className="ml-3">
                     <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Reports</p>
                     <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                       {threatReportsData.userStats.totalReports}
                     </p>
                   </div>
                 </div>
               </div>
               <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                 <div className="flex items-center">
                   <CheckCircle className="w-8 h-8 text-green-600" />
                   <div className="ml-3">
                     <p className="text-sm font-medium text-green-600 dark:text-green-400">Approved</p>
                     <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                       {threatReportsData.userStats.approvedReports}
                     </p>
                   </div>
                 </div>
               </div>
               <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                 <div className="flex items-center">
                   <Clock className="w-8 h-8 text-yellow-600" />
                   <div className="ml-3">
                     <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
                     <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                       {threatReportsData.userStats.pendingReports}
                     </p>
                   </div>
                 </div>
               </div>
               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                 <div className="flex items-center">
                   <XCircle className="w-8 h-8 text-gray-600" />
                   <div className="ml-3">
                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                       {threatReportsData.userStats.rejectedReports}
                     </p>
                   </div>
                 </div>
               </div>
             </div>
           </motion.div>

           {/* Threat Type Breakdown */}
           {threatReportsData.threatTypeBreakdown.length > 0 && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1.1 }}
               className="card"
             >
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                 <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
                 Threat Types You've Reported
               </h3>
               <div className="space-y-3">
                 {threatReportsData.threatTypeBreakdown.map((threat, index) => (
                   <motion.div
                     key={threat.type}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.1 }}
                     className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                   >
                     <div className="flex items-center space-x-3">
                       <Flag className="w-5 h-5 text-red-500" />
                       <div>
                         <p className="font-medium text-gray-900 dark:text-white capitalize">
                           {threat.type.replace('_', ' ')}
                         </p>
                         <p className="text-sm text-gray-600 dark:text-gray-400">
                           {threat.approvedCount} approved out of {threat.count} reports
                         </p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-lg font-bold text-gray-900 dark:text-white">
                         {threat.count}
                       </p>
                       <p className="text-sm text-gray-600 dark:text-gray-400">Reports</p>
                     </div>
                   </motion.div>
                 ))}
               </div>
             </motion.div>
           )}

           {/* Severity Breakdown */}
           {threatReportsData.severityBreakdown.length > 0 && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1.2 }}
               className="card"
             >
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                 <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                 Severity Breakdown
               </h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {threatReportsData.severityBreakdown.map((severity, index) => {
                   const colors = {
                     low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                     medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                     high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
                     critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                   };
                   return (
                     <motion.div
                       key={severity.severity}
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: index * 0.1 }}
                       className={`p-4 rounded-lg ${colors[severity.severity as keyof typeof colors]}`}
                     >
                       <p className="text-sm font-medium capitalize">{severity.severity}</p>
                       <p className="text-2xl font-bold">{severity.count}</p>
                     </motion.div>
                   );
                 })}
               </div>
             </motion.div>
           )}

           {/* Recent Reports Chart */}
           {threatReportsData.recentReports.length > 0 && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1.3 }}
               className="card"
             >
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                 <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
                 Recent Reports Trend
               </h3>
               <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={threatReportsData.recentReports}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis 
                       dataKey="date" 
                       tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                     />
                     <YAxis />
                     <Tooltip 
                       labelFormatter={(value) => new Date(value).toLocaleDateString()}
                       formatter={(value, name) => [value, name === 'count' ? 'Total Reports' : 'Approved Reports']}
                     />
                     <Legend />
                     <Line 
                       type="monotone" 
                       dataKey="count" 
                       stroke="#ef4444" 
                       strokeWidth={2}
                       name="Total Reports"
                     />
                     <Line 
                       type="monotone" 
                       dataKey="approvedCount" 
                       stroke="#22c55e" 
                       strokeWidth={2}
                       name="Approved Reports"
                     />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             </motion.div>
           )}

           {/* Your Most Reported Domains */}
           {threatReportsData.topReportedDomains.length > 0 && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1.4 }}
               className="card"
             >
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                 <Globe className="w-5 h-5 mr-2 text-primary-600" />
                 Your Most Reported Domains
               </h3>
               <div className="space-y-3">
                 {threatReportsData.topReportedDomains.map((domain, index) => (
                   <motion.div
                     key={domain.domain}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.1 }}
                     className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                   >
                     <div className="flex items-center space-x-3">
                       <Globe className="w-5 h-5 text-gray-400" />
                       <div>
                         <p className="font-medium text-gray-900 dark:text-white">
                           {domain.domain}
                         </p>
                         <p className="text-sm text-gray-600 dark:text-gray-400">
                           {domain.approvedCount} approved out of {domain.count} reports
                         </p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-lg font-bold text-gray-900 dark:text-white">
                         {domain.count}
                       </p>
                       <p className="text-sm text-gray-600 dark:text-gray-400">Reports</p>
                     </div>
                   </motion.div>
                 ))}
               </div>
             </motion.div>
           )}
         </>
       )}
    </div>
  );
};

export default Analytics;
