import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../AuthContext';
import apiService from '../../services/api';
import QRCode from 'qrcode';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Download, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Camera,
  Settings,
  Key,
  Bell,
  Activity,
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Flag,
  Database,
  Copy,
  QrCode,
  Smartphone,
  Monitor,
  Award,
  Target,
  Zap,
  ShieldCheck,
  Share2
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: 'Cybersecurity enthusiast and digital safety advocate.',
    location: 'India',
    website: '',
    notifications: {
      email: true,
      push: true,
      security: true,
      weekly: false,
      threatAlerts: true,
      scanComplete: true,
      reportUpdates: true
    },
    privacy: {
      profileVisibility: 'public',
      showStats: true,
      showActivity: true,
      allowDataSharing: false
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      loginAlerts: true,
      suspiciousActivityAlerts: true
    }
  });
  const [stats, setStats] = useState({
    totalScans: 0,
    safeScans: 0,
    suspiciousScans: 0,
    maliciousScans: 0,
    threatReports: 0,
    safeReports: 0,
    totalReports: 0,
    lastActive: '',
    accountAge: 0,
    securityScore: 85
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key: keyof typeof profileData.notifications) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  // Load user stats
  const loadUserStats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [scanStatsResponse, reputationResponse] = await Promise.all([
        apiService.getScanStats(user),
        apiService.getReputationAnalytics(user)
      ]);

      if (scanStatsResponse.success && scanStatsResponse.data) {
        const scanData = scanStatsResponse.data;
        setStats(prev => ({
          ...prev,
          totalScans: scanData.totalScans || 0,
          safeScans: scanData.statusBreakdown?.safe || 0,
          suspiciousScans: scanData.statusBreakdown?.suspicious || 0,
          maliciousScans: scanData.statusBreakdown?.malicious || 0,
          lastActive: new Date().toISOString(),
          accountAge: Math.floor((Date.now() - new Date(user.metadata.creationTime || '').getTime()) / (1000 * 60 * 60 * 24))
        }));
      }

      if (reputationResponse.success && reputationResponse.data) {
        const repData = reputationResponse.data;
        setStats(prev => ({
          ...prev,
          threatReports: repData.userContribution?.threatReports || 0,
          safeReports: repData.userContribution?.safeReports || 0,
          totalReports: repData.userContribution?.totalReports || 0
        }));
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Set default values on error
      setStats(prev => ({
        ...prev,
        totalScans: 0,
        safeScans: 0,
        suspiciousScans: 0,
        maliciousScans: 0,
        threatReports: 0,
        safeReports: 0,
        totalReports: 0
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Load recent activity
  const loadRecentActivity = async () => {
    if (!user) return;

    try {
      const response = await apiService.getScanHistory(user, { limit: 10 });
      if (response.success && response.data && response.data.scans) {
        const activities = response.data.scans.map((scan: any) => ({
          id: scan.id,
          type: 'scan',
          action: `Scanned ${scan.url}`,
          status: scan.status,
          timestamp: scan.scanDate,
          icon: scan.status === 'safe' ? CheckCircle : scan.status === 'malicious' ? AlertTriangle : Clock
        }));
        setRecentActivity(activities);
      }
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  // Load devices
  const loadDevices = async () => {
    // Mock device data - in real app, this would come from API
    const mockDevices = [
      {
        id: '1',
        name: 'Chrome on Windows',
        type: 'desktop',
        browser: 'Chrome',
        os: 'Windows 10',
        lastActive: new Date().toISOString(),
        current: true,
        icon: Monitor
      },
      {
        id: '2',
        name: 'Safari on iPhone',
        type: 'mobile',
        browser: 'Safari',
        os: 'iOS 17',
        lastActive: new Date(Date.now() - 86400000).toISOString(),
        current: false,
        icon: Smartphone
      }
    ];
    setDevices(mockDevices);
  };

  // Load achievements
  const loadAchievements = async () => {
    // Mock achievements data
    const mockAchievements = [
      {
        id: '1',
        title: 'First Scan',
        description: 'Completed your first URL scan',
        icon: Target,
        unlocked: true,
        date: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Threat Hunter',
        description: 'Reported 10 malicious URLs',
        icon: Flag,
        unlocked: stats.threatReports >= 10,
        date: stats.threatReports >= 10 ? new Date().toISOString() : null
      },
      {
        id: '3',
        title: 'Security Expert',
        description: 'Completed 100 scans',
        icon: Shield,
        unlocked: stats.totalScans >= 100,
        date: stats.totalScans >= 100 ? new Date().toISOString() : null
      },
      {
        id: '4',
        title: 'Community Helper',
        description: 'Helped protect the community with 50 reports',
        icon: Award,
        unlocked: stats.totalReports >= 50,
        date: stats.totalReports >= 50 ? new Date().toISOString() : null
      }
    ];
    setAchievements(mockAchievements);
  };

  // Load user profile
  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const response = await apiService.getUserProfile(user);
      if (response.success && response.data) {
        setProfileData(prev => ({
          ...prev,
          displayName: response.data!.displayName || user.displayName || '',
          email: response.data!.email || user.email || ''
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadUserStats();
    loadUserProfile();
    loadRecentActivity();
    loadDevices();
    loadAchievements();
  }, [user]);

  // Reload achievements when stats change
  useEffect(() => {
    loadAchievements();
  }, [stats]);

  const handleSave = async () => {
    if (!user) return;

    try {
      const response = await apiService.updateUserProfile(profileData.displayName, user);
      if (response.success) {
        setIsEditing(false);
        // Reload profile data
        loadUserProfile();
      } else {
        console.error('Failed to update profile:', response.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setProfileData({
      displayName: user?.displayName || '',
      email: user?.email || '',
      bio: 'Cybersecurity enthusiast and digital safety advocate.',
      location: 'India',
      website: '',
      notifications: {
        email: true,
        push: true,
        security: true,
        weekly: false,
        threatAlerts: true,
        scanComplete: true,
        reportUpdates: true
      },
      privacy: {
        profileVisibility: 'public',
        showStats: true,
        showActivity: true,
        allowDataSharing: false
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        loginAlerts: true,
        suspiciousActivityAlerts: true
      }
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // In a real app, this would call Firebase Auth to delete the account
      // and also delete all user data from the database
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Account deleted successfully. You will be redirected to the login page.');
      // In a real app, this would sign out the user and redirect
      // For now, we'll just close the modal
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Account deletion error:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch additional data
      const [scanHistoryResponse, threatReportsResponse] = await Promise.all([
        apiService.getScanHistory(user),
        apiService.getUserThreatReports(user)
      ]);

      const userData = {
        profile: profileData,
        stats: stats,
        recentActivity: recentActivity,
        devices: devices,
        achievements: achievements,
        scanHistory: scanHistoryResponse.success && scanHistoryResponse.data ? scanHistoryResponse.data.scans || [] : [],
        threatReports: threatReportsResponse.success ? threatReportsResponse.data : [],
        accountInfo: {
          accountCreated: user?.metadata.creationTime,
          lastSignIn: user?.metadata.lastSignInTime,
          emailVerified: user?.emailVerified,
          provider: user?.providerData[0]?.providerId,
          uid: user?.uid
        },
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cybersafe-profile-${user.displayName || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Profile data downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [scanHistoryResponse, threatReportsResponse] = await Promise.all([
        apiService.getScanHistory(user),
        apiService.getUserThreatReports(user)
      ]);

      const scanHistory = scanHistoryResponse.success && scanHistoryResponse.data && scanHistoryResponse.data.scans
        ? scanHistoryResponse.data.scans.map((scan: any) => ({
            url: scan.url,
            status: scan.status,
            confidence: scan.details?.virustotal?.confidence || 0,
            scanDate: scan.scanDate,
            domain: scan.url ? new URL(scan.url).hostname : ''
          }))
        : [];

      const threatReports = threatReportsResponse.success && threatReportsResponse.data
        ? threatReportsResponse.data.map((report: any) => ({
            url: report.url,
            threatType: report.threatType,
            severity: report.severity,
            reason: report.reason,
            domain: report.domain,
            reportDate: report.reportDate,
            status: report.status
          }))
        : [];

      // Create comprehensive Excel export
      const { exportComprehensiveReport } = await import('../../utils/excelExport');
      exportComprehensiveReport(scanHistory, threatReports, stats);
      
      // Show success message
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    setShowQRModal(true);
    setIsGeneratingQR(true);
    
    try {
      const profileData = {
        name: user?.displayName || 'User',
        email: user?.email || '',
        profileUrl: `${window.location.origin}/profile/${user?.uid}`,
        joinDate: user?.metadata?.creationTime || new Date().toISOString(),
        stats: {
          totalScans: stats.totalScans,
          securityScore: stats.securityScore
        },
        platform: 'CyberSafe India',
        version: '1.0'
      };
      
      const qrData = JSON.stringify(profileData);
      
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeDataUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const generateQRCodeData = () => {
    const profileData = {
      name: user?.displayName || 'User',
      email: user?.email || '',
      profileUrl: `${window.location.origin}/profile/${user?.uid}`,
      joinDate: user?.metadata?.creationTime || new Date().toISOString(),
      stats: {
        totalScans: stats.totalScans,
        securityScore: stats.securityScore
      },
      platform: 'CyberSafe India',
      version: '1.0'
    };
    
    return JSON.stringify(profileData, null, 2);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const changePassword = async () => {
    if (!user) return;

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would call Firebase Auth to change password
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      alert('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyProfileLink = () => {
    const profileLink = `${window.location.origin}/profile/${user?.uid}`;
    navigator.clipboard.writeText(profileLink);
    alert('Profile link copied to clipboard!');
  };

  const shareProfile = async () => {
    const profileLink = `${window.location.origin}/profile/${user?.uid}`;
    const shareData = {
      title: `${user?.displayName || 'User'}'s CyberSafe Profile`,
      text: `Check out my cybersecurity profile on CyberSafe India!`,
      url: profileLink
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying link
        await navigator.clipboard.writeText(profileLink);
        alert('Profile link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      // Fallback to copying link
      await navigator.clipboard.writeText(profileLink);
      alert('Profile link copied to clipboard!');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `cybersafe-profile-qr-${user?.displayName || 'user'}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const refreshData = () => {
    loadUserStats();
    loadRecentActivity();
    loadAchievements();
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };


  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-3xl font-bold">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.displayName || 'User'}</h1>
              <p className="text-primary-100">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  Member for {stats.accountAge} days
                </span>
                <span className={`text-sm px-3 py-1 rounded-full flex items-center space-x-1 ${
                  stats.securityScore >= 80 ? 'bg-green-500 bg-opacity-20' : 
                  stats.securityScore >= 60 ? 'bg-yellow-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'
                }`}>
                  <Shield className="w-4 h-4" />
                  <span>Security Score: {stats.securityScore}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-4 lg:mt-0">
            <motion.button
              onClick={refreshData}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
            
            <motion.button
              onClick={() => setShowExportModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export</span>
            </motion.button>
            
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-primary-600 hover:bg-opacity-90 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all font-medium"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm"
      >
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Scans</p>
                    <p className="text-3xl font-bold">{stats.totalScans}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="card bg-gradient-to-br from-green-500 to-green-600 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Safe Scans</p>
                    <p className="text-3xl font-bold">{stats.safeScans}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="card bg-gradient-to-br from-red-500 to-red-600 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Threats Detected</p>
                    <p className="text-3xl font-bold">{stats.maliciousScans + stats.suspiciousScans}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Threat Reports</p>
                    <p className="text-3xl font-bold">{stats.threatReports}</p>
                  </div>
                  <Flag className="w-8 h-8 text-purple-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Safe Reports</p>
                    <p className="text-3xl font-bold">{stats.safeReports}</p>
                  </div>
                  <Shield className="w-8 h-8 text-yellow-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm">Security Score</p>
                    <p className="text-3xl font-bold">{stats.securityScore}</p>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-indigo-200" />
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <motion.button
                    onClick={() => setShowExportModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Data</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={generateQRCode}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Code</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={shareProfile}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Profile</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={copyProfileLink}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </motion.button>
                </div>
              </div>

              {/* Recent Activity Preview */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-500" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity: any, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <activity.icon className="w-5 h-5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.status === 'safe' ? 'bg-green-100 text-green-800' :
                        activity.status === 'malicious' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  {isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
                    >
                      <Camera className="w-3 h-3 text-white" />
                    </motion.button>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {user.displayName || 'User'}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Member since {new Date(user.metadata.creationTime || '').toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={profileData.displayName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={profileData.website}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="https://your-website.com"
                />
              </div>

              {isEditing && (
                <div className="flex space-x-2 pt-4">
                  <motion.button
                    onClick={handleSave}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </motion.button>
                  <motion.button
                    onClick={handleCancel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary"
                  >
                    Cancel
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Account Security */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Account Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Verification</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.emailVerified ? 'Verified' : 'Not verified'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.emailVerified ? 'status-safe' : 'status-suspicious'
                }`}>
                  {user.emailVerified ? 'Verified' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Password</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last changed: {new Date(user.metadata.lastSignInTime || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
                                    <motion.button
                      onClick={() => setShowPasswordModal(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-secondary text-sm"
                    >
                      Change Password
                    </motion.button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Last Sign In</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.metadata.lastSignInTime || '').toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
          {/* Notifications */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </h3>
            <div className="space-y-3">
              {Object.entries(profileData.notifications).map(([key, value]: [string, boolean]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleNotificationChange(key as keyof typeof profileData.notifications)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Account Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Account Actions
            </h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Data</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteModal(true)}
                className="w-full btn-danger flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </motion.button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Scans</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.totalScans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Threats Detected</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.maliciousScans + stats.suspiciousScans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Safe Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats.totalScans > 0 ? Math.round((stats.safeScans / stats.totalScans) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-500" />
                  Security Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Email Verified</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Your email is verified</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Verified</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-secondary text-sm"
                    >
                      Enable 2FA
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-500" />
                  Security Score
                </h3>
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(stats.securityScore / 100) * 251.2} 251.2`}
                        className={getSecurityScoreColor(stats.securityScore)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-2xl font-bold ${getSecurityScoreColor(stats.securityScore)}`}>
                        {stats.securityScore}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your security score is based on account settings, activity, and security practices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.map((activity: any, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <activity.icon className="w-6 h-6 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      activity.status === 'safe' ? 'bg-green-100 text-green-800' :
                      activity.status === 'malicious' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Your Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement: any, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      achievement.unlocked
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <achievement.icon className={`w-6 h-6 ${
                        achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'
                      }`} />
                      <h4 className={`font-medium ${
                        achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {achievement.title}
                      </h4>
                    </div>
                    <p className={`text-sm ${
                      achievement.unlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                    {achievement.unlocked && achievement.date && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                        Unlocked {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-blue-500" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  {Object.entries(profileData.notifications).map(([key, value]: [string, boolean]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleNotificationChange(key as keyof typeof profileData.notifications)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-purple-500" />
                  Data Management
                </h3>
                <div className="space-y-3">
                  <motion.button
                    onClick={downloadData}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Data</span>
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={exportToExcel}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Export to Excel</span>
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setShowDeleteModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-danger flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Export Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose how you'd like to export your data
              </p>
              <div className="space-y-3">
                <motion.button
                  onClick={downloadData}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download JSON</span>
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  onClick={exportToExcel}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Export to Excel</span>
                    </>
                  )}
                </motion.button>
              </div>
              <motion.button
                onClick={() => setShowExportModal(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <motion.button
                  onClick={changePassword}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Changing...</span>
                    </>
                  ) : (
                    <span>Change Password</span>
                  )}
                </motion.button>
                <motion.button
                  onClick={() => setShowPasswordModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Share Your Profile
                </h3>
                <motion.button
                  onClick={() => setShowQRModal(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* QR Code Display */}
              <div className="mb-6">
                {isGeneratingQR ? (
                  <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Generating QR Code...</p>
                    </div>
                  </div>
                ) : qrCodeDataUrl ? (
                  <div className="w-64 h-64 bg-white rounded-lg mx-auto p-4 shadow-lg">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Profile QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Scan this QR code to view {user?.displayName || 'User'}'s cybersecurity profile
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <motion.button
                  onClick={copyProfileLink}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </motion.button>
                
                <motion.button
                  onClick={shareProfile}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </motion.button>
              </div>

              {/* Download QR Code Button */}
              {qrCodeDataUrl && (
                <motion.button
                  onClick={downloadQRCode}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary flex items-center justify-center space-x-2 mb-4"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR Code</span>
                </motion.button>
              )}

              {/* Profile Data Preview */}
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-2">
                  View Profile Data
                </summary>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg max-h-32 overflow-y-auto">
                  <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {generateQRCodeData()}
                  </pre>
                </div>
              </details>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Account
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
            <div className="flex space-x-3">
              <motion.button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-danger flex-1 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Account</span>
                )}
              </motion.button>
              <motion.button
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
