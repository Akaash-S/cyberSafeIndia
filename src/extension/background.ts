// CyberSafe India Extension - Background Service Worker

// Extension configuration
const EXTENSION_CONFIG = {
  apiBaseUrl: 'https://cybersafeindiabackend-1.onrender.com/api',
  websiteUrl: 'https://cybersafe-india.vercel.app',
  scanCacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
  maxCacheSize: 100
}

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details: { reason: string }) => {
  console.log('CyberSafe India Extension installed/updated:', details.reason)
  
  // Set default settings
  await chrome.storage.sync.set({
    autoScan: true,
    blockMalicious: true,
    showWarnings: true,
    notifications: true,
    theme: 'light',
    indicatorPosition: 'top-right'
  })

  // Initialize daily stats
  await chrome.storage.local.set({
    dailyStats: { total: 0, safe: 0, threats: 0 },
    extensionInstallDate: Date.now()
  })

  // Create context menu
  chrome.contextMenus.create({
    id: 'scan-url',
    title: 'Scan URL with CyberSafe India',
    contexts: ['link']
  })

  // Set up daily cleanup alarm
  chrome.alarms.create('dailyCleanup', { 
    when: getNextMidnight(),
    periodInMinutes: 24 * 60 // 24 hours
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info: any, tab: any) => {
  if (info.menuItemId === 'scan-url' && info.linkUrl && tab?.id) {
    await performBackgroundScan(info.linkUrl, tab.id)
  }
})

// Handle tab updates for auto-scanning
chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: any, tab: any) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const settings = await chrome.storage.sync.get(['autoScan'])
    if (settings.autoScan) {
      // Delay scan to allow page to load
      setTimeout(() => {
        performBackgroundScan(tab.url!, tabId)
      }, 2000)
    }
  }
})

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command: string) => {
  if (command === 'scan-current-page') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.url) {
      await performBackgroundScan(tab.url, tab.id!)
    }
  } else if (command === 'open-dashboard') {
    chrome.tabs.create({ url: `${EXTENSION_CONFIG.websiteUrl}/dashboard` })
  }
})

// Message handling
chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: (response?: any) => void) => {
  if (request.action === 'scanUrl') {
    performBackgroundScan(request.url, sender.tab?.id)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }))
    return true // Keep message channel open for async response
  } else if (request.action === 'getStats') {
    chrome.storage.local.get(['dailyStats']).then((result) => {
      sendResponse(result.dailyStats || { total: 0, safe: 0, threats: 0 })
    })
    return true
  } else if (request.action === 'updateUser') {
    // Update user data
    chrome.storage.local.set({
      user: request.user,
      authToken: request.authToken
    })
    sendResponse({ success: true })
  } else if (request.action === 'authSync') {
    // Handle auth sync from website
    handleAuthSync(request.data)
    sendResponse({ success: true })
  }
})

// Perform background scan
async function performBackgroundScan(url: string, tabId?: number): Promise<any> {
  try {
    // Check cache first
    const cacheResult = await chrome.storage.local.get(['scanCache'])
    const cache = cacheResult.scanCache || {}
    const cacheKey = url.toLowerCase()
    
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < EXTENSION_CONFIG.scanCacheExpiry) {
      console.log('Using cached scan result for:', url)
      return cache[cacheKey].result
    }

    // Get auth token if available
    const authResult = await chrome.storage.local.get(['authToken'])
    const token = authResult.authToken

    // Perform scan
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${EXTENSION_CONFIG.apiBaseUrl}/scan`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    // Cache the result
    cache[cacheKey] = {
      result,
      timestamp: Date.now()
    }

    // Limit cache size
    const cacheEntries = Object.entries(cache)
    if (cacheEntries.length > EXTENSION_CONFIG.maxCacheSize) {
      // Remove oldest entries
      const sortedEntries = cacheEntries.sort((a, b) => (a[1] as any).timestamp - (b[1] as any).timestamp)
      const toRemove = sortedEntries.slice(0, cacheEntries.length - EXTENSION_CONFIG.maxCacheSize)
      toRemove.forEach(([key]) => delete cache[key])
    }

    await chrome.storage.local.set({ scanCache: cache })

    // Update stats
    const statsResult = await chrome.storage.local.get(['dailyStats'])
    const stats = statsResult.dailyStats || { total: 0, safe: 0, threats: 0 }
    stats.total += 1
    
    if (result.status === 'safe') {
      stats.safe += 1
    } else {
      stats.threats += 1
    }

    await chrome.storage.local.set({ dailyStats: stats })

    // Send result to content script if tab is available
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: 'updateSecurityStatus',
        status: result.status,
        message: result.title || 'Scan completed'
      }).catch(() => {
        // Tab might not have content script, ignore error
      })
    }

    // Show notification if enabled
    const settings = await chrome.storage.sync.get(['notifications'])
    if (settings.notifications && result.status !== 'safe') {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'CyberSafe India',
        message: `Threat detected: ${result.title || 'Suspicious URL'}`
      })
    }

    return result
  } catch (error) {
    console.error('Background scan error:', error)
    throw error
  }
}

// Handle auth sync from website
async function handleAuthSync(authData: any) {
  try {
    if (authData.isAuthenticated && authData.user) {
      // User is logged in on website
      console.log('Syncing auth state from website:', authData.user.email)
      
      // Store user data in extension storage
      await chrome.storage.local.set({
        user: authData.user,
        authToken: authData.token,
        lastAuthSync: Date.now(),
        authSource: 'website'
      })

      // Notify popup if it's open
      chrome.runtime.sendMessage({
        action: 'updateUser',
        user: authData.user,
        authToken: authData.token
      }).catch(() => {
        // Popup not open, ignore error
      })

      // Show notification only if this is a new login
      const lastSync = await chrome.storage.local.get(['lastAuthSync'])
      const timeSinceLastSync = Date.now() - (lastSync.lastAuthSync || 0)
      
      if (timeSinceLastSync > 30000) { // 30 seconds
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-48.png',
          title: 'CyberSafe India',
          message: `Welcome back, ${authData.user.displayName || authData.user.email}!`
        })
      }

    } else {
      // User logged out on website
      console.log('User logged out on website, syncing with extension')
      
      // Clear extension auth data
      await chrome.storage.local.remove(['user', 'authToken', 'authSource'])
      
      // Notify popup if it's open
      chrome.runtime.sendMessage({
        action: 'userLoggedOut'
      }).catch(() => {
        // Popup not open, ignore error
      })
    }
  } catch (error) {
    console.error('Error handling auth sync:', error)
  }
}

// Daily cleanup
chrome.alarms.onAlarm.addListener(async (alarm: any) => {
  if (alarm.name === 'dailyCleanup') {
    await cleanupOldCache()
  }
})

// Clean up old scan cache
async function cleanupOldCache() {
  try {
    const result = await chrome.storage.local.get(['scanCache'])
    if (result.scanCache) {
      const cache = result.scanCache
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      
      const filteredCache: Record<string, any> = {}
      for (const [url, data] of Object.entries(cache)) {
        if ((data as any).timestamp > oneWeekAgo) {
          filteredCache[url] = data
        }
      }
      
      await chrome.storage.local.set({ scanCache: filteredCache })
    }
  } catch (error) {
    console.error('Error cleaning up cache:', error)
  }
}

// Get next midnight timestamp
function getNextMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight.getTime()
}
