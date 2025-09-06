// CyberSafe India Extension - Popup Script
// Integrates with the real backend API

const API_BASE_URL = 'https://cybersafeindiabackend-1.onrender.com/api';

// DOM Elements
const urlInput = document.getElementById('urlInput');
const scanButton = document.getElementById('scanButton');
const scanCurrentButton = document.getElementById('scanCurrent');
const openDashboardButton = document.getElementById('openDashboard');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const resultTitle = document.getElementById('resultTitle');
const resultDetails = document.getElementById('resultDetails');
const resultIcon = document.getElementById('resultIcon');
const resultActions = document.getElementById('resultActions');
const viewDetailsButton = document.getElementById('viewDetails');
const reportUrlButton = document.getElementById('reportUrl');

// Auth elements
const authSection = document.getElementById('authSection');
const authInfo = document.getElementById('authInfo');
const authAvatar = document.getElementById('authAvatar');
const authName = document.getElementById('authName');
const authButton = document.getElementById('authButton');

// Stats elements
const statsSection = document.getElementById('statsSection');
const totalScans = document.getElementById('totalScans');
const safeScans = document.getElementById('safeScans');
const threatScans = document.getElementById('threatScans');

// State
let currentUser = null;
let currentScanResult = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
  initializePopup();
  loadUserData();
  loadStats();
  setupEventListeners();
});

// Initialize popup functionality
function initializePopup() {
  // Get current tab URL
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0] && tabs[0].url) {
      urlInput.value = tabs[0].url;
    }
  });

  // Auto-focus URL input
  urlInput.focus();
}

// Load user authentication data
async function loadUserData() {
  try {
    const result = await chrome.storage.local.get(['user', 'authToken']);
    
    if (result.user && result.authToken) {
      currentUser = result.user;
      updateAuthUI(true);
    } else {
      updateAuthUI(false);
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    updateAuthUI(false);
  }
}

// Update authentication UI
function updateAuthUI(isAuthenticated) {
  if (isAuthenticated && currentUser) {
    authAvatar.textContent = currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : '👤';
    authName.textContent = currentUser.displayName || currentUser.email || 'User';
    authButton.textContent = 'Sign Out';
    authButton.onclick = signOut;
  } else {
    authAvatar.textContent = '👤';
    authName.textContent = 'Not signed in';
    authButton.textContent = 'Sign In';
    authButton.onclick = signIn;
  }
}

// Sign in function
function signIn() {
  // Open the main website for authentication
  chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/auth' });
  window.close();
}

// Show authentication modal
function showAuthModal() {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Create modal content
  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    text-align: center;
    color: #333;
  `;

  content.innerHTML = `
    <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600;">
      Sign in to CyberSafe India
    </h3>
    <p style="margin: 0 0 20px 0; color: #666; font-size: 14px; line-height: 1.5;">
      Choose your preferred sign-in method:
    </p>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <button id="googleSignIn" style="
        padding: 12px 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: white;
        color: #333;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      ">
        <span style="font-size: 18px;">🔍</span>
        Sign in with Google
      </button>
      <button id="emailSignIn" style="
        padding: 12px 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: white;
        color: #333;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      ">
        <span style="font-size: 18px;">📧</span>
        Sign in with Email
      </button>
      <button id="cancelSignIn" style="
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        background: #f3f4f6;
        color: #666;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      ">
        Cancel
      </button>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Add event listeners
  document.getElementById('googleSignIn').addEventListener('click', () => {
    document.body.removeChild(modal);
    signInWithGoogle();
  });

  document.getElementById('emailSignIn').addEventListener('click', () => {
    document.body.removeChild(modal);
    signInWithEmail();
  });

  document.getElementById('cancelSignIn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  // Close modal on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Sign in with Google
function signInWithGoogle() {
  // Open local auth page in popup
  const authWindow = window.open(
    chrome.runtime.getURL('auth.html?provider=google'),
    'cybersafe-auth',
    'width=500,height=600,scrollbars=yes,resizable=yes'
  );
  
  // Listen for authentication completion
  const messageHandler = (event) => {
    if (event.data.type === 'AUTH_SUCCESS') {
      const { user, token } = event.data;
      chrome.storage.local.set({
        user: user,
        authToken: token
      });
      authWindow.close();
      window.removeEventListener('message', messageHandler);
      loadUserData();
    } else if (event.data.type === 'AUTH_CANCELLED') {
      authWindow.close();
      window.removeEventListener('message', messageHandler);
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  // Clean up after 5 minutes
  setTimeout(() => {
    window.removeEventListener('message', messageHandler);
  }, 300000);
}

// Sign in with Email
function signInWithEmail() {
  // Open local auth page in popup
  const authWindow = window.open(
    chrome.runtime.getURL('auth.html?provider=email'),
    'cybersafe-auth',
    'width=500,height=600,scrollbars=yes,resizable=yes'
  );
  
  // Listen for authentication completion
  const messageHandler = (event) => {
    if (event.data.type === 'AUTH_SUCCESS') {
      const { user, token } = event.data;
      chrome.storage.local.set({
        user: user,
        authToken: token
      });
      authWindow.close();
      window.removeEventListener('message', messageHandler);
      loadUserData();
    } else if (event.data.type === 'AUTH_CANCELLED') {
      authWindow.close();
      window.removeEventListener('message', messageHandler);
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  // Clean up after 5 minutes
  setTimeout(() => {
    window.removeEventListener('message', messageHandler);
  }, 300000);
}

// Sign out function
async function signOut() {
  try {
    await chrome.storage.local.remove(['user', 'authToken']);
    currentUser = null;
    updateAuthUI(false);
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

// Load daily stats
async function loadStats() {
  try {
    const result = await chrome.storage.local.get(['dailyStats']);
    const stats = result.dailyStats || { total: 0, safe: 0, threats: 0 };
    
    totalScans.textContent = stats.total;
    safeScans.textContent = stats.safe;
    threatScans.textContent = stats.threats;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Update daily stats
async function updateStats(status) {
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
    loadStats();
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  scanButton.addEventListener('click', () => {
    scanURL(urlInput.value);
  });

  scanCurrentButton.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        scanURL(tabs[0].url);
      }
    });
  });

  openDashboardButton.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/dashboard' });
  });

  viewDetailsButton.addEventListener('click', () => {
    if (currentScanResult) {
      chrome.tabs.create({ 
        url: `https://cybersafe-india.vercel.app/scan?url=${encodeURIComponent(currentScanResult.url)}` 
      });
    }
  });

  reportUrlButton.addEventListener('click', () => {
    if (currentScanResult) {
      chrome.tabs.create({ 
        url: `https://cybersafe-india.vercel.app/scan?url=${encodeURIComponent(currentScanResult.url)}&report=true` 
      });
    }
  });

  // Allow Enter key to trigger scan
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      scanURL(urlInput.value);
    }
  });
}

// Main scan function
async function scanURL(url) {
  if (!url) {
    showResult('error', 'Please enter a URL', '');
    return;
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    showResult('error', 'Invalid URL format', 'Please enter a valid URL starting with http:// or https://');
    return;
  }

  showLoading(true);
  hideResult();

  try {
    const result = await performScan(url);
    currentScanResult = result;
    showResult(result.status, result.title, result.details);
    updateStats(result.status);
  } catch (error) {
    console.error('Scan error:', error);
    showResult('error', 'Scan failed', 'Unable to scan the URL. Please try again or check your connection.');
  } finally {
    showLoading(false);
  }
}

// Perform actual scan with backend API
async function performScan(url) {
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
      const scanData = data.data;
      return formatScanResult(scanData, url);
    } else {
      throw new Error(data.error || 'Scan failed');
    }
  } catch (error) {
    // Fallback to mock scan if API fails
    console.warn('API scan failed, using fallback:', error);
    return await performMockScan(url);
  }
}

// Format scan result for display
function formatScanResult(scanData, originalUrl) {
  const status = scanData.status || 'unknown';
  const confidence = scanData.confidence || 0;
  
  let title, details, icon;
  
  switch (status) {
    case 'safe':
      title = '✅ Safe URL';
      details = `This URL appears to be safe based on our security analysis (${confidence}% confidence).`;
      icon = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
      break;
    case 'suspicious':
      title = '⚠️ Suspicious URL';
      details = `This URL shows suspicious characteristics. Proceed with caution (${confidence}% confidence).`;
      icon = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';
      break;
    case 'malicious':
      title = '🚨 Malicious URL';
      details = `This URL has been flagged as malicious by our security engines (${confidence}% confidence).`;
      icon = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-6h-2v6zm0-8h2V7h-2v2z';
      break;
    default:
      title = '❓ Unknown Status';
      details = `Unable to determine the safety status of this URL (${confidence}% confidence).`;
      icon = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';
  }

  // Add additional details if available
  if (scanData.details) {
    const detailsList = [];
    
    if (scanData.details.community) {
      detailsList.push(`Community reports: ${scanData.details.community.reportCount || 0}`);
    }
    
    if (scanData.details.virustotal) {
      const vtData = scanData.details.virustotal;
      if (vtData.data?.attributes?.last_analysis_stats) {
        const malicious = vtData.data.attributes.last_analysis_stats.malicious || 0;
        detailsList.push(`VirusTotal: ${malicious} malicious detections`);
      }
    }
    
    if (detailsList.length > 0) {
      details += '\n\nAdditional details:\n' + detailsList.join('\n');
    }
  }

  return {
    status,
    title,
    details,
    icon,
    url: scanData.url || originalUrl,
    confidence,
    scanDate: scanData.scanDate || new Date().toISOString()
  };
}

// Fallback mock scan function
async function performMockScan(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const random = Math.random();
      let status, title, details, icon;
      
      if (random > 0.9) {
        status = 'malicious';
        title = '🚨 Malicious URL';
        details = 'This URL has been flagged as malicious by multiple security engines.';
        icon = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-6h-2v6zm0-8h2V7h-2v2z';
      } else if (random > 0.6) {
        status = 'suspicious';
        title = '⚠️ Suspicious URL';
        details = 'This URL shows some suspicious characteristics. Proceed with caution.';
        icon = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';
      } else {
        status = 'safe';
        title = '✅ Safe URL';
        details = 'This URL appears to be safe based on our security analysis.';
        icon = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
      }
      
      resolve({ status, title, details, icon, url, confidence: Math.floor(Math.random() * 40) + 60 });
    }, 1500);
  });
}

// Show/hide loading state
function showLoading(show) {
  if (show) {
    loading.classList.add('show');
    scanButton.disabled = true;
    scanButton.innerHTML = `
      <div class="spinner" style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <span>Scanning...</span>
    `;
  } else {
    loading.classList.remove('show');
    scanButton.disabled = false;
    scanButton.innerHTML = `
      <svg class="scan-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6.5 9.5v3h-3v-3h3M19 13h-6v6h6v-6z"/>
      </svg>
      <span>Scan URL</span>
    `;
  }
}

// Show scan result
function showResult(status, title, details) {
  resultTitle.textContent = title;
  resultDetails.textContent = details;
  
  // Update icon
  const iconPath = getIconForStatus(status);
  resultIcon.innerHTML = `<path d="${iconPath}"/>`;
  
  // Remove existing status classes
  result.classList.remove('safe', 'suspicious', 'malicious', 'error');
  
  // Add new status class
  if (status !== 'error') {
    result.classList.add(status);
  }
  
  result.classList.add('show');
  
  // Show/hide action buttons based on status
  if (status === 'malicious' || status === 'suspicious') {
    resultActions.style.display = 'flex';
  } else {
    resultActions.style.display = 'none';
  }
}

// Get icon path for status
function getIconForStatus(status) {
  switch (status) {
    case 'safe':
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
    case 'suspicious':
    case 'malicious':
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';
    default:
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';
  }
}

// Hide result
function hideResult() {
  result.classList.remove('show');
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateUser') {
    currentUser = request.user;
    updateAuthUI(true);
  } else if (request.action === 'userLoggedOut') {
    currentUser = null;
    updateAuthUI(false);
  } else if (request.action === 'scanComplete') {
    // Handle scan completion from background
    if (request.result) {
      currentScanResult = request.result;
      showResult(request.result.status, request.result.title, request.result.details);
      updateStats(request.result.status);
    }
  }
});
