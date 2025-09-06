import React from 'react'
import { createRoot } from 'react-dom/client'
import { motion } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  ArrowLeft, 
  ExternalLink, 
  Flag
} from 'lucide-react'

const BlockedApp: React.FC = () => {
  const handleGoBack = () => {
    window.history.back()
  }

  const handleOpenDashboard = () => {
    chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/dashboard' })
  }

  const handleReportFalsePositive = () => {
    chrome.tabs.create({ url: 'https://cybersafe-india.vercel.app/report' })
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-3"
        >
          Access Blocked
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-6 leading-relaxed"
        >
          This website has been blocked by CyberSafe India because it may contain malicious content or pose a security risk.
        </motion.p>

        {/* Security Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center justify-center space-x-2 text-red-800">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Security Protection Active</span>
          </div>
          <p className="text-sm text-red-700 mt-2">
            Your browsing is protected by CyberSafe India's real-time threat detection.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <button
            onClick={handleOpenDashboard}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Dashboard</span>
          </button>

          <button
            onClick={handleReportFalsePositive}
            className="w-full flex items-center justify-center space-x-2 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-3 rounded-lg transition-colors"
          >
            <Flag className="w-4 h-4" />
            <span>Report False Positive</span>
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 pt-4 border-t border-gray-200"
        >
          <p className="text-xs text-gray-500">
            Powered by <span className="font-medium text-blue-600">CyberSafe India</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Render the blocked page
const container = document.getElementById('blocked-root')
if (container) {
  const root = createRoot(container)
  root.render(<BlockedApp />)
}
