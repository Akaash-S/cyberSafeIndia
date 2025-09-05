import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Download, 
  Shield, 
  AlertTriangle, 
  XCircle,
  CheckCircle,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';
import type { ScanHistory } from '../../types/api';

// Type for VirusTotal data structure
interface VirusTotalData {
  positives?: number;
  total?: number;
  confidence?: number;
}

// Type for AbuseIPDB data structure
interface AbuseIPDBData {
  abuseConfidence?: number;
  abuseConfidencePercentage?: number;
  countryCode?: string;
  totalReports?: number;
}

// Use ScanHistory from apiService instead of local interface

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanHistory[]>([]);
  const [filteredScans, setFilteredScans] = useState<ScanHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'suspicious' | 'malicious'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Load scan history from API
  const loadScanHistory = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await apiService.getScanHistory(user, {
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy: 'scan_date',
        sortOrder: 'desc'
      });

      if (response.success && response.data) {
        setScans(response.data.scans);
        setFilteredScans(response.data.scans);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        console.error('Failed to load scan history:', response.error);
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, statusFilter]);

  useEffect(() => {
    loadScanHistory();
  }, [user, currentPage, statusFilter, loadScanHistory]);

  // Filter and search logic
  useEffect(() => {
    let filtered = scans;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(scan =>
        scan.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(scan => scan.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(scan => 
        new Date(scan.scanDate) >= filterDate
      );
    }

    setFilteredScans(filtered);
    setCurrentPage(1);
  }, [scans, searchTerm, statusFilter, dateFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'suspicious':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />;
      case 'malicious':
        return <XCircle className="w-5 h-5 text-danger-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'status-safe';
      case 'suspicious':
        return 'status-suspicious';
      case 'malicious':
        return 'status-malicious';
      default:
        return '';
    }
  };

  const getStats = () => {
    const total = scans.length;
    const safe = scans.filter(s => s.status === 'safe').length;
    const suspicious = scans.filter(s => s.status === 'suspicious').length;
    const malicious = scans.filter(s => s.status === 'malicious').length;

    return { total, safe, suspicious, malicious };
  };

  const exportToCSV = () => {
    const csvContent = [
      ['URL', 'Status', 'Timestamp', 'VirusTotal Positives', 'AbuseIPDB Confidence'],
      ...filteredScans.map(scan => [
        scan.url,
        scan.status,
        new Date(scan.scanDate).toLocaleString(),
        (scan.details.virustotal as VirusTotalData)?.positives?.toString() || '0',
        (scan.details.abuseipdb as AbuseIPDBData)?.abuseConfidence?.toString() || '0'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybersafe-scans-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = getStats();
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentScans = filteredScans.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
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
            Scan Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and analyze your URL security scans
          </p>
        </div>
        <motion.button
          onClick={exportToCSV}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Download className="w-5 h-5" />
          <span>Export CSV</span>
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Safe URLs</p>
              <p className="text-2xl font-bold text-success-600">{stats.safe}</p>
            </div>
            <Shield className="w-8 h-8 text-success-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspicious</p>
              <p className="text-2xl font-bold text-warning-600">{stats.suspicious}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-warning-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Malicious</p>
              <p className="text-2xl font-bold text-danger-600">{stats.malicious}</p>
            </div>
            <XCircle className="w-8 h-8 text-danger-600" />
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search URLs
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Search by URL..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'safe' | 'suspicious' | 'malicious')}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="safe">Safe</option>
              <option value="suspicious">Suspicious</option>
              <option value="malicious">Malicious</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Date
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
              className="input-field"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Scan Results Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentScans.map((scan, index) => (
                <motion.tr
                  key={scan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {getStatusIcon(scan.status)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                          {scan.url}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {(scan.details.virustotal as VirusTotalData)?.positives || 0}/{(scan.details.virustotal as VirusTotalData)?.total || 0} detections
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(scan.status)}`}>
                      {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(scan.scanDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.open(scan.url, '_blank')}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredScans.length)} of {filteredScans.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
