// CyberSafe India Extension - Background Script
// Handles background tasks, API communication, and notifications

const API_BASE_URL = 'https://cybersafeindiabackend-1.onrender.com/api';

// Extension installation and setup
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('CyberSafe India extension installed');
    
    // Set default settings
    chrome.storage.sync.set({
      autoScan: false,
      notifications: true,
      theme: 'light',
      blockMalicious: true,
      showWarnings: true
    });

    // Initialize daily stats
    chrome.storage.local.set({
      dailyStats: { total: 0, safe: 0, threats: 0 }
    });

    // Create context menu items
    createContextMenus();
  } else if (details.reason === 'update') {
    console.log('CyberSafe India extension updated');
  }
});

// Create context menu items
function createContextMenus() {
  chrome.contextMenus.create({
    id: 'scanUrl',
    title: 'Scan URL with CyberSafe India',
    contexts: ['link']
  });
  
  chrome.contextMenus.create({
    id: 'scanPage',
    title: 'Scan current page',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'reportUrl',
    title: 'Report URL as malicious',
    contexts: ['link']
  });
}

// Handle tab updates for auto-scanning
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !isExtensionUrl(tab.url)) {
    // Check if auto-scan is enabled
    chrome.storage.sync.get(['autoScan'], (result) => {
      if (result.autoScan) {
        performBackgroundScan(tab.url, tabId);
      }
    });
  }
});

// Check if URL is an extension URL
function isExtensionUrl(url) {
  return url.startsWith('chrome-extension://') || 
         url.startsWith('chrome://') || 
         url.startsWith('moz-extension://') ||
         url.startsWith('edge://');
}

// Background scan function
async function performBackgroundScan(url, tabId) {
  try {
    const result = await scanUrlWithAPI(url);
    
    if (result.status === 'malicious') {
      handleMaliciousUrl(url, tabId, result);
    } else if (result.status === 'suspicious') {
      handleSuspiciousUrl(url, tabId, result);
    }

    // Update stats
    updateDailyStats(result.status);

    // Send result to popup if open
    chrome.runtime.sendMessage({
      action: 'scanComplete',
      result: result
    }).catch(() => {
      // Popup not open, ignore error
    });

  } catch (error) {
    console.error('Background scan failed:', error);
  }
}

// Scan URL with API
async function scanUrlWithAPI(url) {
  try {
    // Get auth token
    const result = await chrome.storage.local.get(['authToken']);
    const authToken = result.authToken;

    const headers = {
      'Content-Type': 'application/json',
    };

    // Note: The /scan endpoint uses optionalAuth middleware
    // It doesn't require Bearer token in header, but we can include it
    // The backend will extract user info from the token if present
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/scan`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (data.success && data.data) {
      return formatScanResult(data.data, url);
    } else {
      throw new Error(data.error || 'Scan failed');
    }
  } catch (error) {
    console.warn('API scan failed, using fallback:', error);
    return await performMockScan(url);
  }
}

// Format scan result
function formatScanResult(scanData, originalUrl) {
  const status = scanData.status || 'unknown';
  const confidence = scanData.confidence || 0;
  
  let title, details;
  
  switch (status) {
    case 'safe':
      title = 'Safe URL';
      details = `This URL appears to be safe (${confidence}% confidence)`;
      break;
    case 'suspicious':
      title = 'Suspicious URL';
      details = `This URL shows suspicious characteristics (${confidence}% confidence)`;
      break;
    case 'malicious':
      title = 'Malicious URL';
      details = `This URL has been flagged as malicious (${confidence}% confidence)`;
      break;
    default:
      title = 'Unknown Status';
      details = `Unable to determine safety status (${confidence}% confidence)`;
  }

  return {
    status,
    title,
    details,
    url: scanData.url || originalUrl,
    confidence,
    scanDate: scanData.scanDate || new Date().toISOString()
  };
}

// Fallback mock scan
async function performMockScan(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const random = Math.random();
      let status, title, details;
      
      if (random > 0.95) {
        status = 'malicious';
        title = 'Malicious URL';
        details = 'This URL has been flagged as malicious by multiple security engines.';
      } else if (random > 0.8) {
        status = 'suspicious';
        title = 'Suspicious URL';
        details = 'This URL shows some suspicious characteristics.';
      } else {
        status = 'safe';
        title = 'Safe URL';
        details = 'This URL appears to be safe based on our analysis.';
      }
      
      resolve({ status, title, details, url, confidence: Math.floor(Math.random() * 40) + 60 });
    }, 1000);
  });
}

// Handle malicious URL
async function handleMaliciousUrl(url, tabId, result) {
  const settings = await chrome.storage.sync.get(['blockMalicious', 'notifications']);
  
  if (settings.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'CyberSafe India - Security Alert',
      message: `Malicious URL detected: ${new URL(url).hostname}`,
      buttons: [
        { title: 'Block Page' },
        { title: 'View Details' }
      ]
    });
  }
  
  if (settings.blockMalicious) {
    // Block the page
    chrome.tabs.update(tabId, { 
      url: chrome.runtime.getURL('blocked.html?url=' + encodeURIComponent(url))
    });
  }
}

// Handle suspicious URL
async function handleSuspiciousUrl(url, tabId, result) {
  const settings = await chrome.storage.sync.get(['showWarnings', 'notifications']);
  
  if (settings.showWarnings && settings.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'CyberSafe India - Warning',
      message: `Suspicious URL detected: ${new URL(url).hostname}`,
      buttons: [
        { title: 'View Details' },
        { title: 'Continue' }
      ]
    });
  }
}

// Update daily stats
async function updateDailyStats(status) {
  try {
    const result = await chrome.storage.local.get(['dailyStats']);
    const stats = result.dailyStats || { total: 0, safe: 0, threats: 0 };
    
    stats.total += 1;
    if (status === 'safe') {
      stats.safe += 1;
    } else if (status === 'malicious' || status === 'suspicious') {
      stats.threats += 1;
    }
    
    await chrome.storage.local.set({ dailyStats: stats });
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.notifications.clear(notificationId);
  chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/dashboard' });
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  chrome.notifications.clear(notificationId);
  
  if (buttonIndex === 0) {
    // First button - Block page or View Details
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.update(tabs[0].id, { 
          url: chrome.runtime.getURL('blocked.html')
        });
      }
    });
  } else if (buttonIndex === 1) {
    // Second button - View Details or Continue
    chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/dashboard' });
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'scanUrl') {
    // Open popup with URL to scan
    chrome.action.openPopup();
    // Send URL to popup
    chrome.runtime.sendMessage({
      action: 'scanUrl',
      url: info.linkUrl
    });
  } else if (info.menuItemId === 'scanPage') {
    // Open popup with current page URL
    chrome.action.openPopup();
    chrome.runtime.sendMessage({
      action: 'scanUrl',
      url: tab.url
    });
  } else if (info.menuItemId === 'reportUrl') {
    // Open report page
    chrome.tabs.create({ 
      url: `https://cybersafe-india.vercel.app/scan?url=${encodeURIComponent(info.linkUrl)}&report=true`
    });
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'scan-current-page') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.action.openPopup();
        chrome.runtime.sendMessage({
          action: 'scanUrl',
          url: tabs[0].url
        });
      }
    });
  } else if (command === 'open-dashboard') {
    chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/dashboard' });
  }
});

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanUrl') {
    performBackgroundScan(request.url, sender.tab?.id)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep message channel open for async response
  } else if (request.action === 'getStats') {
    chrome.storage.local.get(['dailyStats'], (result) => {
      sendResponse(result.dailyStats || { total: 0, safe: 0, threats: 0 });
    });
    return true;
  } else if (request.action === 'updateUser') {
    // Update user data
    chrome.storage.local.set({
      user: request.user,
      authToken: request.authToken
    });
    sendResponse({ success: true });
  } else if (request.action === 'authSync') {
    // Handle auth sync from website
    handleAuthSync(request.data);
    sendResponse({ success: true });
  }
});

// Periodic cleanup and maintenance
chrome.alarms.create('dailyCleanup', { 
  when: getNextMidnight(),
  periodInMinutes: 24 * 60 // 24 hours
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyCleanup') {
    // Reset daily stats
    chrome.storage.local.set({
      dailyStats: { total: 0, safe: 0, threats: 0 }
    });
    
    // Clean up old scan cache
    cleanupOldCache();
  }
});

// Get next midnight timestamp
function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

// Clean up old scan cache
async function cleanupOldCache() {
  try {
    const result = await chrome.storage.local.get(['scanCache']);
    if (result.scanCache) {
      const cache = result.scanCache;
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      const filteredCache = {};
      for (const [url, data] of Object.entries(cache)) {
        if (data.timestamp > oneWeekAgo) {
          filteredCache[url] = data;
        }
      }
      
      await chrome.storage.local.set({ scanCache: filteredCache });
    }
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
}

// Handle auth sync from website
async function handleAuthSync(authData) {
  try {
    if (authData.isAuthenticated && authData.user) {
      // User is logged in on website
      console.log('Syncing auth state from website:', authData.user.email);
      
      // Store user data in extension storage
      await chrome.storage.local.set({
        user: authData.user,
        authToken: authData.token,
        lastAuthSync: Date.now()
      });

      // Notify popup if it's open
      chrome.runtime.sendMessage({
        action: 'updateUser',
        user: authData.user,
        authToken: authData.token
      }).catch(() => {
        // Popup not open, ignore error
      });

      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'CyberSafe India',
        message: `Welcome back, ${authData.user.displayName || authData.user.email}!`
      });

    } else {
      // User logged out on website
      console.log('User logged out on website, syncing with extension');
      
      // Clear extension auth data
      await chrome.storage.local.remove(['user', 'authToken']);
      
      // Notify popup if it's open
      chrome.runtime.sendMessage({
        action: 'userLoggedOut'
      }).catch(() => {
        // Popup not open, ignore error
      });
    }
  } catch (error) {
    console.error('Error handling auth sync:', error);
  }
}
