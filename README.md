# CyberSafe India - Frontend

A modern, responsive web application and browser extension for URL security scanning and threat detection.

## 🚀 Features

- **Real-time URL Scanning**: Scan any URL for malware, phishing, and security threats
- **Multi-layered Protection**: Integration with VirusTotal, AbuseIPDB, and other security databases
- **Interactive Dashboard**: Comprehensive analytics and scan history
- **Browser Extension**: Lightweight extension for real-time protection while browsing
- **User Authentication**: Secure login/signup with Firebase
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Firebase** for authentication
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API calls

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Update `src/firebase.js` with your Firebase project credentials
   - Enable Authentication in Firebase Console
   - Set up Google OAuth (optional)

3. Start development server:
```bash
npm run dev
```

## 🏗️ Building

### Web Application
```bash
npm run build
```

### Browser Extension
```bash
npm run build:extension
```

The extension files will be in the `dist-extension` directory.

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication
3. Add your web app to the project
4. Copy the config object to `src/firebase.js`

### Environment Variables
Create a `.env` file in the root directory:
```
VITE_API_BASE_URL=https://cybersafeindiabackend-1.onrender.com/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard and analytics
│   ├── Scan/          # URL scanning components
│   ├── Analytics/     # Charts and analytics
│   ├── Profile/       # User profile management
│   └── Home/          # Landing page
├── firebase.js        # Firebase configuration
├── App.tsx           # Main app component
└── main.tsx          # Entry point

public/
├── manifest.json     # Browser extension manifest
├── popup.html        # Extension popup
├── popup.js          # Extension popup logic
├── background.js     # Extension background script
├── content.js        # Extension content script
└── icons/           # Extension icons
```

## 🎨 Styling

The project uses Tailwind CSS with custom components and animations. Key styling features:

- **Custom Color Palette**: Primary, success, warning, and danger colors
- **Dark Mode Support**: Automatic dark/light mode switching
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion for page transitions and interactions

## 🔐 Authentication

The app uses Firebase Authentication with support for:
- Email/Password authentication
- Google OAuth
- Protected routes
- Session persistence

## 📊 Analytics

Interactive charts and analytics powered by Recharts:
- Threat distribution pie charts
- Weekly scan activity
- Threat trends over time
- Top scanned domains

## 🌐 Browser Extension

The browser extension provides:
- Real-time URL scanning
- Security indicators on web pages
- Context menu integration
- Background threat detection
- Popup interface for quick scans

## 🚀 Deployment

### Web Application
Deploy the `dist` folder to your preferred hosting service:
- Vercel
- Netlify
- Firebase Hosting
- AWS S3 + CloudFront

### Browser Extension
1. Build the extension: `npm run build:extension`
2. Load the `dist-extension` folder in Chrome/Edge developer mode
3. Or package for Chrome Web Store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**CyberSafe India** - Protecting India's Digital Frontier 🛡️