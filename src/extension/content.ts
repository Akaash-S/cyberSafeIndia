// CyberSafe India Extension - Content Script

// Security indicator styles
const SECURITY_STYLES = `
  .cybersafe-indicator {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2147483647;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    animation: slideIn 0.3s ease;
  }
  
  .cybersafe-indicator.safe {
    border-color: #10b981;
    background: #f0fdf4;
  }
  
  .cybersafe-indicator.suspicious {
    border-color: #f59e0b;
    background: #fffbeb;
  }
  
  .cybersafe-indicator.malicious {
    border-color: #ef4444;
    background: #fef2f2;
  }
  
  .cybersafe-indicator .icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    display: inline-block;
    vertical-align: middle;
  }
  
  .cybersafe-indicator .text {
    display: inline-block;
    vertical-align: middle;
    font-weight: 500;
  }
  
  .cybersafe-indicator .close {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    color: #6b7280;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .cybersafe-indicator .close:hover {
    color: #374151;
  }
  
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
  
  .cybersafe-warning {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #fef2f2;
    border-bottom: 2px solid #ef4444;
    padding: 12px 20px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    text-align: center;
    color: #dc2626;
    font-weight: 500;
  }
  
  .cybersafe-warning .close {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #dc2626;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

// Inject styles
const styleSheet = document.createElement('style')
styleSheet.textContent = SECURITY_STYLES
document.head.appendChild(styleSheet)

// State
let securityIndicator: HTMLElement | null = null

// Initialize content script
function init() {
  console.log('CyberSafe India content script loaded')
  
  // Check if we're on a blocked page
  if (window.location.href.includes('chrome-extension://') && window.location.href.includes('blocked.html')) {
    return
  }
  
  // Set up link protection
  setupLinkProtection()
  
  // Check current page security
  checkPageSecurity()
  
  // Set up mutation observer for dynamic content
  setupMutationObserver()
}

// Check page security
async function checkPageSecurity() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'scanUrl',
      url: window.location.href
    })
    
    if (response && !response.error) {
      showSecurityIndicator(response.status, response.title || 'Page analyzed')
    }
  } catch (error) {
    console.error('Error checking page security:', error)
  }
}

// Show security indicator
function showSecurityIndicator(status: string, message: string) {
  // Remove existing indicator
  if (securityIndicator) {
    securityIndicator.remove()
  }
  
  // Create new indicator
  securityIndicator = document.createElement('div')
  securityIndicator.className = `cybersafe-indicator ${status}`
  
  const icon = getStatusIcon(status)
  const closeButton = document.createElement('button')
  closeButton.className = 'close'
  closeButton.innerHTML = '×'
  closeButton.onclick = () => {
    if (securityIndicator) {
      securityIndicator.remove()
      securityIndicator = null
    }
  }
  
  securityIndicator.innerHTML = `
    ${icon}
    <span class="text">${message}</span>
  `
  securityIndicator.appendChild(closeButton)
  
  document.body.appendChild(securityIndicator)
  
  // Auto-hide after 5 seconds for safe pages
  if (status === 'safe') {
    setTimeout(() => {
      if (securityIndicator) {
        securityIndicator.remove()
        securityIndicator = null
      }
    }, 5000)
  }
}

// Get status icon
function getStatusIcon(status: string): string {
  switch (status) {
    case 'safe':
      return '<svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
    case 'suspicious':
      return '<svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
    case 'malicious':
      return '<svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
    default:
      return '<svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
  }
}

// Set up link protection
function setupLinkProtection() {
  // Protect existing links
  protectLinks()
  
  // Set up mutation observer for new links
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element
          if (element.tagName === 'A') {
            protectLink(element as HTMLAnchorElement)
          } else {
            const links = element.querySelectorAll('a')
            links.forEach(protectLink)
          }
        }
      })
    })
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

// Protect all links on the page
function protectLinks() {
  const links = document.querySelectorAll('a[href]')
  links.forEach((link) => protectLink(link as HTMLAnchorElement))
}

// Protect individual link
function protectLink(link: HTMLAnchorElement) {
  const href = link.href
  
  if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return
  }
  
  // Check for shortened URLs
  if (isShortenedUrl(href)) {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      showLinkWarning(link, 'This appears to be a shortened URL. Would you like to scan it first?')
    })
    return
  }
  
  // Check for suspicious patterns
  if (isSuspiciousUrl(href)) {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      showLinkWarning(link, 'This URL looks suspicious. Would you like to scan it first?')
    })
    return
  }
  
  // Highlight external links
  if (isExternalLink(href)) {
    link.style.borderBottom = '1px dashed #f59e0b'
    link.title = 'External link - click to scan'
    
    link.addEventListener('click', (e) => {
      e.preventDefault()
      showLinkWarning(link, 'This is an external link. Would you like to scan it first?')
    })
  }
}

// Check if URL is shortened
function isShortenedUrl(url: string): boolean {
  const shorteners = [
    'bit.ly', 'tinyurl.com', 'short.link', 't.co', 'goo.gl', 'ow.ly',
    'is.gd', 'v.gd', 'shorturl.at', 'rebrand.ly', 'cutt.ly', 'short.cm'
  ]
  
  try {
    const domain = new URL(url).hostname.toLowerCase()
    return shorteners.some(shortener => domain.includes(shortener))
  } catch {
    return false
  }
}

// Check if URL is suspicious
function isSuspiciousUrl(url: string): boolean {
  const suspiciousPatterns = [
    /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // IP addresses
    /[a-z0-9-]+\.tk$/, // .tk domains
    /[a-z0-9-]+\.ml$/, // .ml domains
    /[a-z0-9-]+\.ga$/, // .ga domains
    /[a-z0-9-]+\.cf$/  // .cf domains
  ]
  
  return suspiciousPatterns.some(pattern => pattern.test(url.toLowerCase()))
}

// Check if URL is external
function isExternalLink(url: string): boolean {
  try {
    const linkDomain = new URL(url).hostname
    const currentDomain = window.location.hostname
    return linkDomain !== currentDomain
  } catch {
    return false
  }
}

// Show link warning
function showLinkWarning(link: HTMLAnchorElement, message: string) {
  const warning = document.createElement('div')
  warning.className = 'cybersafe-warning'
  warning.innerHTML = `
    ${message}
    <button class="close" onclick="this.parentElement.remove()">×</button>
  `
  
  const scanButton = document.createElement('button')
  scanButton.textContent = 'Scan URL'
  scanButton.style.cssText = `
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    margin-left: 12px;
    cursor: pointer;
    font-size: 14px;
  `
  
  scanButton.onclick = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'scanUrl',
        url: link.href
      })
      
      if (response && !response.error) {
        if (response.status === 'safe') {
          window.open(link.href, '_blank')
        } else {
          alert(`Warning: ${response.title || 'This URL may be unsafe'}`)
        }
      }
    } catch (error) {
      console.error('Error scanning URL:', error)
    }
    
    warning.remove()
  }
  
  warning.appendChild(scanButton)
  document.body.insertBefore(warning, document.body.firstChild)
}

// Set up mutation observer
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Re-protect links when new content is added
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            if (element.tagName === 'A') {
              protectLink(element as HTMLAnchorElement)
            } else {
              const links = element.querySelectorAll('a')
              links.forEach(protectLink)
            }
          }
        })
      }
    })
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

// Handle messages from background script
function handleMessage(request: any) {
  if (request.action === 'updateSecurityStatus') {
    showSecurityIndicator(request.status, request.message)
  } else if (request.action === 'showNotification') {
    showNotification(request.title, request.message, request.type)
  }
}

// Show notification
function showNotification(title: string, message: string, type = 'info') {
  const notification = document.createElement('div')
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
  `
  
  notification.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
    <div>${message}</div>
  `
  
  document.body.appendChild(notification)
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification)
    }
  }, 5000)
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener(handleMessage)

// Listen for auth sync messages from the website
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CYBERSAFE_AUTH_SYNC' && event.data.source === 'cybersafe-website') {
    // Forward auth sync to background script
    chrome.runtime.sendMessage({
      action: 'authSync',
      data: event.data.data
    })
  }
})

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
