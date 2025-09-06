import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '../contexts/AuthContext'
import { useAuth } from '../hooks/useAuth'
import { 
  Shield, 
  Bell, 
  Download, 
  Trash2,
  ExternalLink,
  User,
  LogOut
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SettingsData {
  autoScan: boolean
  blockMalicious: boolean
  showWarnings: boolean
  notifications: boolean
  theme: string
  indicatorPosition: string
}

interface StatsData {
  total: number
  safe: number
  threats: number
  extensionUptime: number
}

const OptionsApp: React.FC = () => {
  const { user, loading } = useAuth()
  const [settings, setSettings] = useState<SettingsData>({
    autoScan: true,
    blockMalicious: true,
    showWarnings: true,
    notifications: true,
    theme: 'light',
    indicatorPosition: 'top-right'
  })
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    safe: 0,
    threats: 0,
    extensionUptime: 0
  })
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    loadSettings()
    loadStats()
    loadUserData()
    updateLastUpdated()
  }, [])

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.sync.get([
        'autoScan',
        'blockMalicious',
        'showWarnings',
        'notifications',
        'theme',
        'indicatorPosition'
      ])

      setSettings({
        autoScan: result.autoScan ?? true,
        blockMalicious: result.blockMalicious ?? true,
        showWarnings: result.showWarnings ?? true,
        notifications: result.notifications ?? true,
        theme: result.theme || 'light',
        indicatorPosition: result.indicatorPosition || 'top-right'
      })
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    }
  }

  const loadStats = async () => {
    try {
      const result = await chrome.storage.local.get(['dailyStats', 'extensionInstallDate'])
      const statsData = result.dailyStats || { total: 0, safe: 0, threats: 0 }
      
      const installDate = result.extensionInstallDate || Date.now()
      const daysSinceInstall = Math.floor((Date.now() - installDate) / (1000 * 60 * 60 * 24))

      setStats({
        ...statsData,
        extensionUptime: daysSinceInstall
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadUserData = async () => {
    try {
      await chrome.storage.local.get(['user', 'authToken'])
      // User data is handled by AuthProvider
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const updateLastUpdated = () => {
    const now = new Date()
    setLastUpdated(now.toLocaleDateString() + ' ' + now.toLocaleTimeString())
  }

  const updateSetting = async (key: keyof SettingsData, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value }
      setSettings(newSettings)
      
      await chrome.storage.sync.set({ [key]: value })
      toast.success(`${key} ${value ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error(`Error saving ${key}:`, error)
      toast.error('Failed to save setting')
      // Revert on error
      setSettings(settings)
    }
  }

  const signIn = () => {
    chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/auth' })
  }

  const signOut = async () => {
    try {
      await chrome.storage.local.remove(['user', 'authToken'])
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  const resetStats = async () => {
    if (confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
      try {
        await chrome.storage.local.set({
          dailyStats: { total: 0, safe: 0, threats: 0 },
          extensionInstallDate: Date.now()
        })
        
        loadStats()
        toast.success('Statistics reset successfully')
      } catch (error) {
        console.error('Error resetting stats:', error)
        toast.error('Failed to reset statistics')
      }
    }
  }

  const exportData = async () => {
    try {
      const result = await chrome.storage.local.get()
      const syncResult = await chrome.storage.sync.get()
      
      const data = {
        settings: syncResult,
        stats: result.dailyStats || { total: 0, safe: 0, threats: 0 },
        user: result.user || null,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cybersafe-india-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data')
    }
  }

  const openDashboard = () => {
    chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/dashboard' })
  }

  const ToggleSwitch: React.FC<{ 
    enabled: boolean
    onChange: (enabled: boolean) => void
    label: string
    description?: string
  }> = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">CyberSafe India</h1>
              <p className="text-sm text-gray-500">Extension Settings</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={openDashboard}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Authentication Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Authentication
          </h2>
          
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {user.displayName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:text-red-800 text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-3">Sign in to sync your data across devices</p>
              <button
                onClick={signIn}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Security Settings */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security Settings
          </h2>
          
          <div className="space-y-1">
            <ToggleSwitch
              enabled={settings.autoScan}
              onChange={(enabled) => updateSetting('autoScan', enabled)}
              label="Auto-scan pages"
              description="Automatically scan pages when you visit them"
            />
            
            <ToggleSwitch
              enabled={settings.blockMalicious}
              onChange={(enabled) => updateSetting('blockMalicious', enabled)}
              label="Block malicious URLs"
              description="Prevent access to known malicious websites"
            />
            
            <ToggleSwitch
              enabled={settings.showWarnings}
              onChange={(enabled) => updateSetting('showWarnings', enabled)}
              label="Show security warnings"
              description="Display warnings for suspicious content"
            />
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </h2>
          
          <ToggleSwitch
            enabled={settings.notifications}
            onChange={(enabled) => updateSetting('notifications', enabled)}
            label="Enable notifications"
            description="Receive notifications for security alerts"
          />
        </div>

        {/* Statistics */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-500">Total Scans</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.safe}</div>
              <div className="text-xs text-gray-500">Safe URLs</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.threats}</div>
              <div className="text-xs text-gray-500">Threats Blocked</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.extensionUptime}</div>
              <div className="text-xs text-gray-500">Days Active</div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={resetStats}
              className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:text-red-800 text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Stats</span>
            </button>
            <button
              onClick={exportData}
              className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 hover:text-blue-800 text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4">
          <div className="text-center text-xs text-gray-500">
            <p>Last updated: {lastUpdated}</p>
            <div className="mt-2 space-x-4">
              <a 
                href="https://cybersafe-india.vercel.app/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-700 transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="https://cybersafe-india.vercel.app/help" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-700 transition-colors"
              >
                Help Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Render the options page
const container = document.getElementById('options-root')
if (container) {
  const root = createRoot(container)
  root.render(
    <AuthProvider>
      <OptionsApp />
    </AuthProvider>
  )
}
