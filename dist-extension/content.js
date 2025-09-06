// CyberSafe India Extension - Content Script
// Injects security indicators and protection features into web pages

// Configuration
const CONFIG = {
  indicatorPosition: 'top-right',
  autoHideDelay: 5000,
  highlightExternalLinks: true,
  showShortenedUrlWarnings: true,
  suspiciousDomains: [
    'bit.ly', 'tinyurl.com', 'short.link', 't.co', 'goo.gl',
    'ow.ly', 'is.gd', 'v.gd', 'shorturl.at', 'rebrand.ly'
  ]
};

// State
let securityIndicator = null;
let isScanning = false;
let currentPageStatus = null;

// Initialize content script
function init() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }

  // Inject security indicator
  injectSecurityIndicator();
  
  // Check page security
  checkPageSecurity();
  
  // Setup link protection
  setupLinkProtection();
  
  // Setup external link highlighting
  if (CONFIG.highlightExternalLinks) {
    highlightExternalLinks();
  }
  
  // Setup mutation observer for dynamic content
  setupMutationObserver();
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(handleMessage);
}

// Inject security indicator into page
function injectSecurityIndicator() {
  if (document.getElementById('cybersafe-indicator')) {
    return;
  }

  const indicator = document.createElement('div');
  indicator.id = 'cybersafe-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2147483647;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    font-weight: 500;
    display: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 200px;
    word-wrap: break-word;
  `;

  // Add click handler to open popup
  indicator.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });

  // Add hover effects
  indicator.addEventListener('mouseenter', () => {
    indicator.style.transform = 'translateY(-2px)';
    indicator.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
  });

  indicator.addEventListener('mouseleave', () => {
    indicator.style.transform = 'translateY(0)';
    indicator.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  });

  document.body.appendChild(indicator);
  securityIndicator = indicator;
}

// Check page security status
async function checkPageSecurity() {
  const url = window.location.href;
  
  // Skip extension and browser pages
  if (isExtensionUrl(url) || isBrowserUrl(url)) {
    return;
  }

  try {
    isScanning = true;
    showSecurityIndicator('scanning', '🔍 Scanning...');

    // Send message to background script for scanning
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'scanUrl', url }, (response) => {
        resolve(response);
      });
    });

    if (response && !response.error) {
      currentPageStatus = response.status;
      showSecurityIndicator(response.status, response.title);
    } else {
      showSecurityIndicator('error', '❌ Scan failed');
    }
  } catch (error) {
    console.error('Security check failed:', error);
    showSecurityIndicator('error', '❌ Scan failed');
  } finally {
    isScanning = false;
  }
}

// Show security indicator
function showSecurityIndicator(status, message) {
  if (!securityIndicator) return;

  let color, icon;
  
  switch (status) {
    case 'safe':
      color = '#22c55e';
      icon = '🛡️';
      break;
    case 'suspicious':
      color = '#f59e0b';
      icon = '⚠️';
      break;
    case 'malicious':
      color = '#ef4444';
      icon = '🚨';
      break;
    case 'scanning':
      color = '#3b82f6';
      icon = '🔍';
      break;
    case 'error':
      color = '#6b7280';
      icon = '❌';
      break;
    default:
      color = '#6b7280';
      icon = '❓';
  }

  securityIndicator.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 16px;">${icon}</span>
      <span>${message}</span>
    </div>
  `;
  securityIndicator.style.backgroundColor = color;
  securityIndicator.style.display = 'block';

  // Auto-hide for safe URLs
  if (status === 'safe') {
    setTimeout(() => {
      if (securityIndicator && currentPageStatus === 'safe') {
        securityIndicator.style.display = 'none';
      }
    }, CONFIG.autoHideDelay);
  }
}

// Setup link protection
function setupLinkProtection() {
  document.addEventListener('click', handleLinkClick, true);
}

// Handle link clicks
function handleLinkClick(event) {
  const link = event.target.closest('a');
  if (!link || !link.href) return;

  const url = new URL(link.href);
  
  // Check for shortened URLs
  if (CONFIG.showShortenedUrlWarnings && isShortenedUrl(url.hostname)) {
    event.preventDefault();
    showShortenedUrlWarning(link.href, () => {
      window.open(link.href, '_blank', 'noopener,noreferrer');
    });
    return;
  }

  // Check for suspicious domains
  if (isSuspiciousDomain(url.hostname)) {
    event.preventDefault();
    showSuspiciousUrlWarning(link.href, () => {
      window.open(link.href, '_blank', 'noopener,noreferrer');
    });
    return;
  }
}

// Check if URL is shortened
function isShortenedUrl(hostname) {
  return CONFIG.suspiciousDomains.some(domain => 
    hostname.includes(domain) || hostname.endsWith('.' + domain)
  );
}

// Check if domain is suspicious
function isSuspiciousDomain(hostname) {
  // Add your suspicious domain patterns here
  const suspiciousPatterns = [
    /^[a-z0-9]{1,10}\.[a-z]{2,3}$/, // Very short domains
    /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/, // IP addresses
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(hostname));
}

// Show shortened URL warning
function showShortenedUrlWarning(url, onContinue) {
  const warning = createWarningModal(
    '⚠️ Shortened URL Detected',
    'This appears to be a shortened URL. Shortened URLs can hide the real destination and may be used for malicious purposes.',
    url,
    onContinue
  );
  
  document.body.appendChild(warning);
}

// Show suspicious URL warning
function showSuspiciousUrlWarning(url, onContinue) {
  const warning = createWarningModal(
    '🚨 Suspicious URL Detected',
    'This URL appears suspicious based on its domain pattern. Proceed with caution.',
    url,
    onContinue
  );
  
  document.body.appendChild(warning);
}

// Create warning modal
function createWarningModal(title, message, url, onContinue) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    text-align: center;
  `;

  const titleEl = document.createElement('h3');
  titleEl.textContent = title;
  titleEl.style.cssText = `
    margin: 0 0 16px 0;
    color: #f59e0b;
    font-size: 18px;
    font-weight: 600;
  `;

  const messageEl = document.createElement('p');
  messageEl.textContent = message;
  messageEl.style.cssText = `
    margin: 0 0 16px 0;
    color: #333;
    line-height: 1.5;
  `;

  const urlEl = document.createElement('div');
  urlEl.textContent = url;
  urlEl.style.cssText = `
    background: #f3f4f6;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 12px;
    color: #666;
    word-break: break-all;
    margin: 0 0 20px 0;
  `;

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
    justify-content: center;
  `;

  const continueBtn = document.createElement('button');
  continueBtn.textContent = 'Continue';
  continueBtn.style.cssText = `
    background: #f59e0b;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
  `;
  continueBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
    onContinue();
  });
  continueBtn.addEventListener('mouseenter', () => {
    continueBtn.style.background = '#d97706';
  });
  continueBtn.addEventListener('mouseleave', () => {
    continueBtn.style.background = '#f59e0b';
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = `
    background: #6b7280;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
  `;
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.background = '#4b5563';
  });
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.background = '#6b7280';
  });

  buttonContainer.appendChild(continueBtn);
  buttonContainer.appendChild(cancelBtn);

  content.appendChild(titleEl);
  content.appendChild(messageEl);
  content.appendChild(urlEl);
  content.appendChild(buttonContainer);
  modal.appendChild(content);

  return modal;
}

// Highlight external links
function highlightExternalLinks() {
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    
    if (href && (href.startsWith('http') || href.startsWith('//'))) {
      try {
        const url = new URL(href, window.location.origin);
        
        // Add visual indicator for external links
        if (url.hostname !== window.location.hostname) {
          link.style.position = 'relative';
          
          // Add small icon if not already present
          if (!link.querySelector('.cybersafe-external-icon')) {
            const icon = document.createElement('span');
            icon.className = 'cybersafe-external-icon';
            icon.textContent = '🔗';
            icon.style.cssText = `
              position: absolute;
              top: -2px;
              right: -2px;
              font-size: 10px;
              background: rgba(0, 0, 0, 0.7);
              color: white;
              border-radius: 50%;
              width: 14px;
              height: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              pointer-events: none;
            `;
            link.appendChild(icon);
          }
        }
      } catch (error) {
        // Invalid URL, skip
      }
    }
  });
}

// Setup mutation observer for dynamic content
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Re-highlight external links for new content
        if (CONFIG.highlightExternalLinks) {
          highlightExternalLinks();
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Handle messages from background script
function handleMessage(request, sender, sendResponse) {
  if (request.action === 'updateSecurityStatus') {
    currentPageStatus = request.status;
    showSecurityIndicator(request.status, request.message);
  } else if (request.action === 'showNotification') {
    showNotification(request.title, request.message, request.type);
  }
}

// Listen for auth sync messages from the website
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CYBERSAFE_AUTH_SYNC' && event.data.source === 'cybersafe-website') {
    // Forward auth sync to background script
    chrome.runtime.sendMessage({
      action: 'authSync',
      data: event.data.data
    });
  }
});

// Show notification
function showNotification(title, message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#22c55e'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    text-align: center;
  `;
  
  notification.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
    <div>${message}</div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 5000);
}

// Check if URL is extension URL
function isExtensionUrl(url) {
  return url.startsWith('chrome-extension://') || 
         url.startsWith('moz-extension://') ||
         url.startsWith('edge://');
}

// Check if URL is browser URL
function isBrowserUrl(url) {
  return url.startsWith('chrome://') || 
         url.startsWith('about:') ||
         url.startsWith('file://');
}

// Start the content script
init();
