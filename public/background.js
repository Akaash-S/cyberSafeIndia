// Background script for CyberSafe India extension

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('CyberSafe India extension installed');
    
    // Set default settings
    chrome.storage.sync.set({
      autoScan: false,
      notifications: true,
      theme: 'light'
    });
  }
});

// Handle tab updates for auto-scanning
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if auto-scan is enabled
    chrome.storage.sync.get(['autoScan'], (result) => {
      if (result.autoScan) {
        // Perform background scan
        performBackgroundScan(tab.url, tabId);
      }
    });
  }
});

// Background scan function
async function performBackgroundScan(url, tabId) {
  try {
    // In a real implementation, this would call your backend API
    const result = await simulateBackgroundScan(url);
    
    if (result.status === 'malicious') {
      // Show warning notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'CyberSafe India - Security Alert',
        message: `Malicious URL detected: ${url}`,
        buttons: [
          { title: 'Block Page' },
          { title: 'View Details' }
        ]
      });
      
      // Optionally block the page
      chrome.tabs.update(tabId, { url: 'chrome-extension://' + chrome.runtime.id + '/blocked.html' });
    }
  } catch (error) {
    console.error('Background scan failed:', error);
  }
}

// Simulate background scan
function simulateBackgroundScan(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const random = Math.random();
      let status;
      
      if (random > 0.95) {
        status = 'malicious';
      } else if (random > 0.8) {
        status = 'suspicious';
      } else {
        status = 'safe';
      }
      
      resolve({ status, url });
    }, 1000);
  });
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.notifications.clear(notificationId);
  chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  chrome.notifications.clear(notificationId);
  
  if (buttonIndex === 0) {
    // Block page
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.update(tabs[0].id, { 
          url: 'chrome-extension://' + chrome.runtime.id + '/blocked.html' 
        });
      }
    });
  } else if (buttonIndex === 1) {
    // View details
    chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
  }
});

// Context menu for URL scanning
chrome.runtime.onInstalled.addListener(() => {
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
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'scanUrl') {
    // Open popup with URL to scan
    chrome.tabs.create({ 
      url: 'chrome-extension://' + chrome.runtime.id + '/popup.html?url=' + encodeURIComponent(info.linkUrl)
    });
  } else if (info.menuItemId === 'scanPage') {
    // Open popup with current page URL
    chrome.tabs.create({ 
      url: 'chrome-extension://' + chrome.runtime.id + '/popup.html?url=' + encodeURIComponent(tab.url)
    });
  }
});

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanUrl') {
    performBackgroundScan(request.url, sender.tab.id)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep message channel open for async response
  }
});
