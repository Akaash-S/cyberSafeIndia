import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '../contexts/AuthContext'
import { useAuth } from '../hooks/useAuth'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Search, 
  BarChart3, 
  Settings, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

// Extension-specific API service
class ExtensionApiService {
  private baseURL = 'https://cybersafeindiabackend-1.onrender.com/api'

  async scanUrl(url: string, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseURL}/scan`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getUserProfile(token: string) {
    const response = await fetch(`${this.baseURL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

const apiService = new ExtensionApiService()

interface ScanResult {
  status: 'safe' | 'suspicious' | 'malicious'
  title: string
  details: string
  confidence?: number
  sources?: string[]
}

const PopupApp: React.FC = () => {
  const { user, loading } = useAuth()
  const [url, setUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [stats, setStats] = useState({ total: 0, safe: 0, threats: 0 })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const result = await chrome.storage.local.get(['dailyStats'])
      setStats(result.dailyStats || { total: 0, safe: 0, threats: 0 })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleScan = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL to scan')
      return
    }

    setScanning(true)
    setScanResult(null)

    try {
      // Get auth token if user is logged in
      const result = await chrome.storage.local.get(['authToken'])
      const token = result.authToken

      const result_data = await apiService.scanUrl(url, token)
      
      const scanResult: ScanResult = {
        status: result_data.status || 'safe',
        title: result_data.title || 'Scan Complete',
        details: result_data.details || 'URL has been analyzed',
        confidence: result_data.confidence,
        sources: result_data.sources
      }

      setScanResult(scanResult)
      
      // Update stats
      const newStats = { ...stats, total: stats.total + 1 }
      if (scanResult.status === 'safe') {
        newStats.safe += 1
      } else {
        newStats.threats += 1
      }
      setStats(newStats)
      
      // Save to storage
      await chrome.storage.local.set({ dailyStats: newStats })
      
      toast.success('Scan completed successfully')
    } catch (error) {
      console.error('Scan error:', error)
      toast.error('Failed to scan URL')
    } finally {
      setScanning(false)
    }
  }

  const openDashboard = () => {
    chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/dashboard' })
  }

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  const signIn = () => {
    chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/auth' })
  }

  const signOut = async () => {
    try {
      await chrome.storage.local.remove(['user', 'authToken'])
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'suspicious':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'malicious':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Shield className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'suspicious':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'malicious':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6" />
            <h1 className="text-lg font-bold">CyberSafe India</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={openOptions}
              className="p-1 hover:bg-white/20 rounded"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="p-4 border-b">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Sign in to sync your data</p>
            <button
              onClick={signIn}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* URL Scanner */}
      <div className="p-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scan URL
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={scanning}
              />
              <button
                onClick={handleScan}
                disabled={scanning || !url.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                {scanning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Scan</span>
              </button>
            </div>
          </div>

          {/* Scan Result */}
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg border ${getStatusColor(scanResult.status)}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(scanResult.status)}
                <span className="font-medium">{scanResult.title}</span>
              </div>
              <p className="text-sm">{scanResult.details}</p>
              {scanResult.confidence && (
                <p className="text-xs mt-1 opacity-75">
                  Confidence: {scanResult.confidence}%
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Today's Stats</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.safe}</div>
            <div className="text-xs text-gray-500">Safe</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{stats.threats}</div>
            <div className="text-xs text-gray-500">Threats</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={openDashboard}
            className="flex items-center justify-center space-x-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={() => chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/scan' })}
            className="flex items-center justify-center space-x-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Advanced</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Render the popup
const container = document.getElementById('popup-root')
if (container) {
  const root = createRoot(container)
  root.render(
    <AuthProvider>
      <PopupApp />
    </AuthProvider>
  )
}
