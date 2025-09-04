// Content script for CyberSafe India extension

// Inject security indicator into pages
function injectSecurityIndicator() {
  // Check if indicator already exists
  if (document.getElementById('cybersafe-indicator')) {
    return;
  }

  // Create indicator element
  const indicator = document.createElement('div');
  indicator.id = 'cybersafe-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px;
    display: none;
    cursor: pointer;
    transition: all 0.3s ease;
  `;

  // Add click handler to open popup
  indicator.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });

  document.body.appendChild(indicator);
}

// Check page security status
async function checkPageSecurity() {
  const url = window.location.href;
  
  try {
    // Send message to background script for scanning
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'scanUrl', url }, (response) => {
        resolve(response);
      });
    });

    if (response && !response.error) {
      showSecurityIndicator(response.status);
    }
  } catch (error) {
    console.error('Security check failed:', error);
  }
}

// Show security indicator
function showSecurityIndicator(status) {
  const indicator = document.getElementById('cybersafe-indicator');
  if (!indicator) return;

  let text, color;
  
  switch (status) {
    case 'safe':
      text = '🛡️ Safe';
      color = '#22c55e';
      break;
    case 'suspicious':
      text = '⚠️ Suspicious';
      color = '#f59e0b';
      break;
    case 'malicious':
      text = '🚨 Malicious';
      color = '#ef4444';
      break;
    default:
      text = '🔍 Scanning...';
      color = '#6b7280';
  }

  indicator.textContent = text;
  indicator.style.backgroundColor = color;
  indicator.style.display = 'block';

  // Auto-hide after 5 seconds for safe URLs
  if (status === 'safe') {
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 5000);
  }
}

// Highlight suspicious links
function highlightSuspiciousLinks() {
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    
    // Check if it's an external link
    if (href && (href.startsWith('http') || href.startsWith('//'))) {
      try {
        const url = new URL(href, window.location.origin);
        
        // Add visual indicator for external links
        if (url.hostname !== window.location.hostname) {
          link.style.position = 'relative';
          
          // Add small icon
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

// Add click protection for suspicious links
function addClickProtection() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || !link.href) return;

    // Check if it's a suspicious domain
    const url = new URL(link.href);
    const suspiciousDomains = [
      'bit.ly', 'tinyurl.com', 'short.link', 't.co'
    ];

    if (suspiciousDomains.some(domain => url.hostname.includes(domain))) {
      event.preventDefault();
      
      // Show warning
      const warning = document.createElement('div');
      warning.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #f59e0b;
        border-radius: 8px;
        padding: 20px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 300px;
      `;
      
      warning.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #f59e0b;">⚠️ Shortened URL Detected</h3>
        <p style="margin: 0 0 15px 0; color: #333;">This appears to be a shortened URL. Proceed with caution.</p>
        <div style="display: flex; gap: 10px;">
          <button id="cybersafe-continue" style="
            background: #f59e0b;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
          ">Continue</button>
          <button id="cybersafe-cancel" style="
            background: #6b7280;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
          ">Cancel</button>
        </div>
      `;
      
      document.body.appendChild(warning);
      
      // Add event listeners
      document.getElementById('cybersafe-continue').addEventListener('click', () => {
        document.body.removeChild(warning);
        window.open(link.href, '_blank');
      });
      
      document.getElementById('cybersafe-cancel').addEventListener('click', () => {
        document.body.removeChild(warning);
      });
    }
  });
}

// Initialize content script
function init() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }

  // Inject security indicator
  injectSecurityIndicator();
  
  // Check page security
  checkPageSecurity();
  
  // Highlight suspicious links
  highlightSuspiciousLinks();
  
  // Add click protection
  addClickProtection();
  
  // Re-run on dynamic content changes
  const observer = new MutationObserver(() => {
    highlightSuspiciousLinks();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Start the content script
init();
