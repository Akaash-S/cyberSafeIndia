# CyberSafe India Browser Extension - Installation Guide

## Overview
The CyberSafe India browser extension provides real-time URL scanning and protection against malicious websites. It integrates with your existing CyberSafe India account and backend API.

## Features
- 🔍 Real-time URL scanning
- 🛡️ Malicious URL blocking
- ⚠️ Suspicious URL warnings
- 📊 Security statistics
- 🔗 External link protection
- 📱 Cross-platform support

## Installation

### For Chrome/Edge (Chromium-based browsers)

1. **Download the Extension**
   - Download the `dist-extension` folder
   - Ensure all files are present (manifest.json, popup.html, background.js, etc.)

2. **Enable Developer Mode**
   - Open Chrome/Edge
   - Go to `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" toggle in the top right

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `dist-extension` folder
   - The extension should appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in the toolbar
   - Find "CyberSafe India" and click the pin icon
   - The extension icon will appear in your toolbar

### For Firefox

1. **Prepare for Firefox**
   - The extension uses Manifest V3, which is supported in Firefox 109+
   - Ensure you're using a recent version of Firefox

2. **Load Temporary Add-on**
   - Open Firefox
   - Go to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the dist-extension folder

## Configuration

### Initial Setup
1. Click the CyberSafe India extension icon
2. Click "Sign In" to connect with your CyberSafe India account
3. Configure your security preferences in the extension popup

### Settings
- **Auto-scan Pages**: Automatically scan every page you visit
- **Block Malicious URLs**: Block access to detected malicious websites
- **Show Warnings**: Display warnings for suspicious URLs
- **Notifications**: Enable desktop notifications for security alerts

## Usage

### Basic Scanning
1. **Scan Current Page**: Click the extension icon and click "Scan Current Page"
2. **Scan Specific URL**: Enter a URL in the popup and click "Scan URL"
3. **Right-click Context Menu**: Right-click any link and select "Scan URL with CyberSafe India"

### Security Indicators
- **Green Shield**: Safe URL
- **Yellow Warning**: Suspicious URL
- **Red Alert**: Malicious URL
- **Blue Scanning**: Currently scanning

### Dashboard Access
- Click "Open Dashboard" to access the full CyberSafe India web interface
- View detailed scan results and security analytics
- Manage your account settings and preferences

## Troubleshooting

### Extension Not Working
1. Check if the extension is enabled in your browser
2. Refresh the page and try again
3. Check browser console for error messages
4. Ensure you're connected to the internet

### API Connection Issues
1. Verify your internet connection
2. Check if the CyberSafe India backend is accessible
3. Try signing out and signing back in
4. Clear extension data and reconfigure

### Performance Issues
1. Disable auto-scan if experiencing slowdowns
2. Clear browser cache and cookies
3. Restart your browser
4. Update to the latest extension version

## Support

### Getting Help
- Visit the [CyberSafe India Dashboard](https://cybersafe-india.vercel.app)
- Check the [Help Center](https://cybersafe-india.vercel.app/help)
- Contact support through the web interface

### Reporting Issues
- Use the "Report False Positive" feature for incorrect detections
- Report bugs through the extension options page
- Include browser version and extension version in reports

## Security & Privacy

### Data Collection
- URLs are scanned for security threats only
- No personal data is collected without consent
- Scan results are stored locally on your device
- Account data is handled according to our privacy policy

### Permissions
- **activeTab**: To scan the current page
- **storage**: To save settings and scan history
- **tabs**: To access tab information for scanning
- **notifications**: To show security alerts

## Updates

### Automatic Updates
- The extension will automatically update when new versions are available
- Check the extension page periodically for updates
- Restart your browser after major updates

### Manual Updates
1. Download the latest version
2. Remove the old extension
3. Load the new version following the installation steps

## Version Information
- **Current Version**: 1.0.0
- **Manifest Version**: 3
- **Minimum Browser Versions**:
  - Chrome: 88+
  - Edge: 88+
  - Firefox: 109+

---

**Note**: This extension is designed to work with the CyberSafe India backend API. Ensure you have a valid account and the backend is accessible for full functionality.
