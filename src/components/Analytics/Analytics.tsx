import React, { useState, useEffect } from 'react';
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
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

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
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockData: AnalyticsData = {
      threatDistribution: [
        { name: 'Safe', value: 75, color: '#22c55e' },
        { name: 'Suspicious', value: 20, color: '#f59e0b' },
        { name: 'Malicious', value: 5, color: '#ef4444' }
      ],
      weeklyScans: [
        { date: '2024-01-01', scans: 45, safe: 35, suspicious: 8, malicious: 2 },
        { date: '2024-01-02', scans: 52, safe: 40, suspicious: 10, malicious: 2 },
        { date: '2024-01-03', scans: 38, safe: 28, suspicious: 8, malicious: 2 },
        { date: '2024-01-04', scans: 61, safe: 45, suspicious: 12, malicious: 4 },
        { date: '2024-01-05', scans: 48, safe: 36, suspicious: 9, malicious: 3 },
        { date: '2024-01-06', scans: 55, safe: 42, suspicious: 10, malicious: 3 },
        { date: '2024-01-07', scans: 43, safe: 32, suspicious: 8, malicious: 3 }
      ],
      topDomains: [
        { domain: 'example.com', count: 25, status: 'safe' },
        { domain: 'google.com', count: 18, status: 'safe' },
        { domain: 'suspicious-site.com', count: 12, status: 'suspicious' },
        { domain: 'malicious-site.com', count: 8, status: 'malicious' },
        { domain: 'github.com', count: 15, status: 'safe' },
        { domain: 'stackoverflow.com', count: 10, status: 'safe' }
      ],
      threatTrends: [
        { month: 'Jan', safe: 120, suspicious: 30, malicious: 8 },
        { month: 'Feb', safe: 135, suspicious: 35, malicious: 10 },
        { month: 'Mar', safe: 150, suspicious: 40, malicious: 12 },
        { month: 'Apr', safe: 140, suspicious: 38, malicious: 11 },
        { month: 'May', safe: 160, suspicious: 45, malicious: 15 },
        { month: 'Jun', safe: 175, suspicious: 50, malicious: 18 }
      ]
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
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

  if (!data) return null;

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
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="input-field"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
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
              <p className="text-2xl font-bold text-danger-600">89</p>
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
              <p className="text-2xl font-bold text-success-600">94.2%</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
              <p className="text-2xl font-bold text-primary-600">1.2s</p>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-4 h-4 text-success-600 mr-1" />
                <span className="text-sm text-success-600">-0.3s</span>
              </div>
            </div>
            <RefreshCw className="w-8 h-8 text-primary-600" />
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
          {data.topDomains.map((domain, index) => (
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
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
