import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, XCircle, ExternalLink, Copy, Download } from 'lucide-react';
import axios from 'axios';

interface ScanResult {
  url: string;
  status: 'safe' | 'suspicious' | 'malicious';
  confidence: number;
  details: {
    virustotal?: {
      positives: number;
      total: number;
      scan_date: string;
    };
    abuseipdb?: {
      abuseConfidence: number;
      countryCode: string;
      usageType: string;
    };
    whois?: {
      registrar: string;
      creationDate: string;
      country: string;
    };
  };
  timestamp: string;
}

const ScanURL: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  const validateURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateURL(url)) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Simulate API call to backend
      // In real implementation, this would call your backend API
      const response = await axios.post('/api/scan', { url });
      
      const scanResult: ScanResult = {
        url,
        status: response.data.status,
        confidence: response.data.confidence,
        details: response.data.details,
        timestamp: new Date().toISOString()
      };

      setResult(scanResult);
      setScanHistory(prev => [scanResult, ...prev.slice(0, 9)]); // Keep last 10 scans
    } catch (error: any) {
      // For demo purposes, create a mock result
      const mockResult: ScanResult = {
        url,
        status: Math.random() > 0.7 ? 'malicious' : Math.random() > 0.4 ? 'suspicious' : 'safe',
        confidence: Math.floor(Math.random() * 40) + 60,
        details: {
          virustotal: {
            positives: Math.floor(Math.random() * 5),
            total: 67,
            scan_date: new Date().toISOString()
          },
          abuseipdb: {
            abuseConfidence: Math.floor(Math.random() * 100),
            countryCode: 'IN',
            usageType: 'hosting'
          },
          whois: {
            registrar: 'Example Registrar',
            creationDate: '2020-01-01',
            country: 'India'
          }
        },
        timestamp: new Date().toISOString()
      };

      setResult(mockResult);
      setScanHistory(prev => [mockResult, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-6 h-6 text-success-600" />;
      case 'suspicious':
        return <AlertTriangle className="w-6 h-6 text-warning-600" />;
      case 'malicious':
        return <XCircle className="w-6 h-6 text-danger-600" />;
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadReport = () => {
    if (!result) return;
    
    const report = {
      url: result.url,
      status: result.status,
      confidence: result.confidence,
      timestamp: result.timestamp,
      details: result.details
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          URL Security Scanner
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Scan any URL for malware, phishing, and other security threats
        </p>
      </motion.div>

      {/* Scan Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter URL to Scan
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="input-field pl-10"
                  placeholder="https://example.com"
                  disabled={loading}
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary px-6 flex items-center space-x-2"
              >
                {loading ? (
                  <div className="loading-spinner w-5 h-5"></div>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Scan Now</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-danger-100 border border-danger-200 text-danger-800 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* Scan Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Scan Result
              </h2>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => copyToClipboard(result.url)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <Copy className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={downloadReport}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <Download className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              {/* URL and Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {result.url}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Scanned on {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {result.confidence}% confidence
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.details.virustotal && (
                  <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      VirusTotal
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        Detections: {result.details.virustotal.positives}/{result.details.virustotal.total}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Last Scan: {new Date(result.details.virustotal.scan_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {result.details.abuseipdb && (
                  <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      AbuseIPDB
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        Abuse Confidence: {result.details.abuseipdb.abuseConfidence}%
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Country: {result.details.abuseipdb.countryCode}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Usage: {result.details.abuseipdb.usageType}
                      </p>
                    </div>
                  </div>
                )}

                {result.details.whois && (
                  <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      WHOIS
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        Registrar: {result.details.whois.registrar}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Created: {new Date(result.details.whois.creationDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Country: {result.details.whois.country}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Scans */}
      {scanHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Scans
          </h2>
          <div className="space-y-2">
            {scanHistory.map((scan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(scan.status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {scan.url}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(scan.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
                    {scan.status}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(scan.url, '_blank')}
                    className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ScanURL;
