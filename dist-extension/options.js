// CyberSafe India Extension - Options Page Script

// DOM Elements
const autoScanToggle = document.getElementById('autoScanToggle');
const blockMaliciousToggle = document.getElementById('blockMaliciousToggle');
const showWarningsToggle = document.getElementById('showWarningsToggle');
const notificationsToggle = document.getElementById('notificationsToggle');
const themeSelect = document.getElementById('themeSelect');
const indicatorPositionSelect = document.getElementById('indicatorPositionSelect');
const connectionStatus = document.getElementById('connectionStatus');
const signInButton = document.getElementById('signInButton');
const signOutButton = document.getElementById('signOutButton');
const resetStatsButton = document.getElementById('resetStatsButton');
const exportDataButton = document.getElementById('exportDataButton');
const openDashboardButton = document.getElementById('openDashboardButton');

// Stats elements
const totalScans = document.getElementById('totalScans');
const safeScans = document.getElementById('safeScans');
const threatScans = document.getElementById('threatScans');
const extensionUptime = document.getElementById('extensionUptime');
const lastUpdated = document.getElementById('lastUpdated');

// State
let currentUser = null;

// Initialize options page
document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  loadStats();
  loadUserData();
  setupEventListeners();
  updateLastUpdated();
});

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'autoScan',
      'blockMalicious',
      'showWarnings',
      'notifications',
      'theme',
      'indicatorPosition'
    ]);

    // Set toggle states
    autoScanToggle.classList.toggle('active', result.autoScan || false);
    blockMaliciousToggle.classList.toggle('active', result.blockMalicious !== false);
    showWarningsToggle.classList.toggle('active', result.showWarnings !== false);
    notificationsToggle.classList.toggle('active', result.notifications !== false);

    // Set select values
    themeSelect.value = result.theme || 'light';
    indicatorPositionSelect.value = result.indicatorPosition || 'top-right';

  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Load statistics
async function loadStats() {
  try {
    const result = await chrome.storage.local.get(['dailyStats', 'extensionInstallDate']);
    const stats = result.dailyStats || { total: 0, safe: 0, threats: 0 };
    
    totalScans.textContent = stats.total;
    safeScans.textContent = stats.safe;
    threatScans.textContent = stats.threats;

    // Calculate uptime
    const installDate = result.extensionInstallDate || Date.now();
    const daysSinceInstall = Math.floor((Date.now() - installDate) / (1000 * 60 * 60 * 24));
    extensionUptime.textContent = daysSinceInstall;

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load user data
async function loadUserData() {
  try {
    const result = await chrome.storage.local.get(['user', 'authToken']);
    
    if (result.user && result.authToken) {
      currentUser = result.user;
      updateConnectionStatus(true);
    } else {
      updateConnectionStatus(false);
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    updateConnectionStatus(false);
  }
}

// Update connection status UI
function updateConnectionStatus(isConnected) {
  if (isConnected && currentUser) {
    connectionStatus.className = 'status-indicator status-connected';
    connectionStatus.innerHTML = '<span>●</span><span>Connected</span>';
    signInButton.style.display = 'none';
    signOutButton.style.display = 'inline-block';
  } else {
    connectionStatus.className = 'status-indicator status-disconnected';
    connectionStatus.innerHTML = '<span>●</span><span>Not Connected</span>';
    signInButton.style.display = 'inline-block';
    signOutButton.style.display = 'none';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Toggle switches
  autoScanToggle.addEventListener('click', () => toggleSetting('autoScan', autoScanToggle));
  blockMaliciousToggle.addEventListener('click', () => toggleSetting('blockMalicious', blockMaliciousToggle));
  showWarningsToggle.addEventListener('click', () => toggleSetting('showWarnings', showWarningsToggle));
  notificationsToggle.addEventListener('click', () => toggleSetting('notifications', notificationsToggle));

  // Select dropdowns
  themeSelect.addEventListener('change', () => saveSetting('theme', themeSelect.value));
  indicatorPositionSelect.addEventListener('change', () => saveSetting('indicatorPosition', indicatorPositionSelect.value));

  // Buttons
  signInButton.addEventListener('click', signIn);
  signOutButton.addEventListener('click', signOut);
  resetStatsButton.addEventListener('click', resetStats);
  exportDataButton.addEventListener('click', exportData);
  openDashboardButton.addEventListener('click', openDashboard);
}

// Toggle setting
async function toggleSetting(settingName, toggleElement) {
  const isActive = toggleElement.classList.contains('active');
  const newValue = !isActive;
  
  toggleElement.classList.toggle('active', newValue);
  
  try {
    await chrome.storage.sync.set({ [settingName]: newValue });
    
    // Show feedback
    showNotification(`${settingName} ${newValue ? 'enabled' : 'disabled'}`, 'success');
  } catch (error) {
    console.error(`Error saving ${settingName}:`, error);
    // Revert toggle state
    toggleElement.classList.toggle('active', isActive);
    showNotification('Failed to save setting', 'error');
  }
}

// Save setting
async function saveSetting(settingName, value) {
  try {
    await chrome.storage.sync.set({ [settingName]: value });
    showNotification('Setting saved', 'success');
  } catch (error) {
    console.error(`Error saving ${settingName}:`, error);
    showNotification('Failed to save setting', 'error');
  }
}

// Sign in
function signIn() {
  chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/auth' });
}

// Sign out
async function signOut() {
  try {
    await chrome.storage.local.remove(['user', 'authToken']);
    currentUser = null;
    updateConnectionStatus(false);
    showNotification('Signed out successfully', 'success');
  } catch (error) {
    console.error('Error signing out:', error);
    showNotification('Failed to sign out', 'error');
  }
}

// Reset statistics
async function resetStats() {
  if (confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
    try {
      await chrome.storage.local.set({
        dailyStats: { total: 0, safe: 0, threats: 0 },
        extensionInstallDate: Date.now()
      });
      
      loadStats();
      showNotification('Statistics reset successfully', 'success');
    } catch (error) {
      console.error('Error resetting stats:', error);
      showNotification('Failed to reset statistics', 'error');
    }
  }
}

// Export data
async function exportData() {
  try {
    const result = await chrome.storage.local.get();
    const data = {
      settings: await chrome.storage.sync.get(),
      stats: result.dailyStats || { total: 0, safe: 0, threats: 0 },
      user: result.user || null,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybersafe-india-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Data exported successfully', 'success');
  } catch (error) {
    console.error('Error exporting data:', error);
    showNotification('Failed to export data', 'error');
  }
}

// Open dashboard
function openDashboard() {
  chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/dashboard' });
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, 3000);
}

// Update last updated time
function updateLastUpdated() {
  const now = new Date();
  lastUpdated.textContent = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateUser') {
    currentUser = request.user;
    updateConnectionStatus(true);
  } else if (request.action === 'updateStats') {
    loadStats();
  }
});

// Periodic stats update
setInterval(loadStats, 30000); // Update every 30 seconds
