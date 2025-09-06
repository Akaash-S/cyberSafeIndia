// CyberSafe India Website Authentication Sync
// This script runs on the CyberSafe India website to sync auth state with the extension

(function() {
  'use strict';

  // Check if we're on the CyberSafe India website
  if (!window.location.hostname.includes('cybersafe-india.vercel.app')) {
    return;
  }

  console.log('CyberSafe India website sync script loaded');

  // Function to get auth state from the website
  function getAuthState() {
    try {
      // Check for Firebase auth state
      if (window.firebase && window.firebase.auth) {
        const user = window.firebase.auth().currentUser;
        if (user) {
          return {
            isAuthenticated: true,
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            }
          };
        }
      }

      // Check for auth state in localStorage
      const authData = localStorage.getItem('cybersafe-auth-data');
      if (authData) {
        const parsed = JSON.parse(authData);
        return {
          isAuthenticated: true,
          user: parsed.user,
          token: parsed.token
        };
      }

      // Check for auth state in sessionStorage
      const sessionAuthData = sessionStorage.getItem('cybersafe-auth-data');
      if (sessionAuthData) {
        const parsed = JSON.parse(sessionAuthData);
        return {
          isAuthenticated: true,
          user: parsed.user,
          token: parsed.token
        };
      }

      return { isAuthenticated: false };
    } catch (error) {
      console.error('Error getting auth state:', error);
      return { isAuthenticated: false };
    }
  }

  // Function to sync auth state with extension
  function syncAuthWithExtension() {
    const authState = getAuthState();
    
    if (authState.isAuthenticated && authState.user) {
      // Send auth data to extension
      window.postMessage({
        type: 'CYBERSAFE_AUTH_SYNC',
        source: 'cybersafe-website',
        data: {
          user: authState.user,
          token: authState.token,
          timestamp: Date.now()
        }
      }, '*');

      console.log('Auth state synced with extension:', authState.user.email);
    } else {
      // Send logout signal
      window.postMessage({
        type: 'CYBERSAFE_AUTH_SYNC',
        source: 'cybersafe-website',
        data: {
          isAuthenticated: false,
          timestamp: Date.now()
        }
      }, '*');

      console.log('User logged out, synced with extension');
    }
  }

  // Monitor for auth state changes
  function setupAuthMonitoring() {
    // Check auth state immediately
    syncAuthWithExtension();

    // Monitor Firebase auth state changes
    if (window.firebase && window.firebase.auth) {
      window.firebase.auth().onAuthStateChanged((user: any) => {
        console.log('Firebase auth state changed:', user ? user.email : 'logged out');
        syncAuthWithExtension();
      });
    }

    // Monitor localStorage changes
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key: string, value: string) {
      originalSetItem.call(this, key, value);
      if (key.includes('auth') || key.includes('user') || key.includes('firebase')) {
        setTimeout(syncAuthWithExtension, 100);
      }
    };

    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function(key: string) {
      originalRemoveItem.call(this, key);
      if (key.includes('auth') || key.includes('user') || key.includes('firebase')) {
        setTimeout(syncAuthWithExtension, 100);
      }
    };

    // Monitor sessionStorage changes
    const originalSessionSetItem = sessionStorage.setItem;
    sessionStorage.setItem = function(key: string, value: string) {
      originalSessionSetItem.call(this, key, value);
      if (key.includes('auth') || key.includes('user') || key.includes('firebase')) {
        setTimeout(syncAuthWithExtension, 100);
      }
    };

    const originalSessionRemoveItem = sessionStorage.removeItem;
    sessionStorage.removeItem = function(key: string) {
      originalSessionRemoveItem.call(this, key);
      if (key.includes('auth') || key.includes('user') || key.includes('firebase')) {
        setTimeout(syncAuthWithExtension, 100);
      }
    };

    // Monitor URL changes (for SPA navigation)
    let currentUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        setTimeout(syncAuthWithExtension, 500);
      }
    });

    urlObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Periodic sync (every 30 seconds)
    setInterval(syncAuthWithExtension, 30000);
  }

  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAuthMonitoring);
  } else {
    setupAuthMonitoring();
  }

  // Also setup monitoring after a delay to catch late-loading auth systems
  setTimeout(setupAuthMonitoring, 2000);

})();
