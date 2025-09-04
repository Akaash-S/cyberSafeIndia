// Extension popup functionality
document.addEventListener('DOMContentLoaded', function() {
  const urlInput = document.getElementById('urlInput');
  const scanButton = document.getElementById('scanButton');
  const scanCurrentButton = document.getElementById('scanCurrent');
  const openDashboardButton = document.getElementById('openDashboard');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  const resultTitle = document.getElementById('resultTitle');
  const resultDetails = document.getElementById('resultDetails');

  // Get current tab URL
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      urlInput.value = tabs[0].url;
    }
  });

  // Scan URL function
  async function scanURL(url) {
    if (!url) {
      showResult('error', 'Please enter a URL', '');
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      showResult('error', 'Invalid URL format', '');
      return;
    }

    showLoading(true);
    hideResult();

    try {
      // In a real implementation, this would call your backend API
      // For demo purposes, we'll simulate a scan
      const mockResult = await simulateScan(url);
      showResult(mockResult.status, mockResult.title, mockResult.details);
    } catch (error) {
      showResult('error', 'Scan failed', 'Unable to scan the URL. Please try again.');
    } finally {
      showLoading(false);
    }
  }

  // Simulate scan (replace with real API call)
  function simulateScan(url) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const random = Math.random();
        let status, title, details;
        
        if (random > 0.8) {
          status = 'malicious';
          title = '⚠️ Malicious URL Detected';
          details = 'This URL has been flagged as malicious by multiple security engines.';
        } else if (random > 0.5) {
          status = 'suspicious';
          title = '⚠️ Suspicious URL';
          details = 'This URL shows some suspicious characteristics. Proceed with caution.';
        } else {
          status = 'safe';
          title = '✅ Safe URL';
          details = 'This URL appears to be safe based on our security analysis.';
        }
        
        resolve({ status, title, details });
      }, 2000);
    });
  }

  // Show/hide loading state
  function showLoading(show) {
    if (show) {
      loading.classList.add('show');
      scanButton.disabled = true;
      scanButton.textContent = 'Scanning...';
    } else {
      loading.classList.remove('show');
      scanButton.disabled = false;
      scanButton.textContent = 'Scan URL';
    }
  }

  // Show result
  function showResult(status, title, details) {
    resultTitle.textContent = title;
    resultDetails.textContent = details;
    
    // Remove existing status classes
    result.classList.remove('safe', 'suspicious', 'malicious', 'error');
    
    // Add new status class
    if (status !== 'error') {
      result.classList.add(status);
    }
    
    result.classList.add('show');
  }

  // Hide result
  function hideResult() {
    result.classList.remove('show');
  }

  // Event listeners
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
    chrome.tabs.create({url: 'http://localhost:5173/dashboard'});
  });

  // Allow Enter key to trigger scan
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      scanURL(urlInput.value);
    }
  });

  // Auto-focus URL input
  urlInput.focus();
});
