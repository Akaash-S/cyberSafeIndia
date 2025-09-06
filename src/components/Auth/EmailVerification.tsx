import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

const EmailVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verificationStatus = params.get('status');
    const verificationMessage = params.get('message');

    if (verificationStatus === 'success') {
      setStatus('success');
      setMessage('Your email has been successfully verified! You can now log in.');
    } else if (verificationStatus === 'error') {
      setStatus('error');
      setMessage(verificationMessage || 'Email verification failed. Please try again or contact support.');
    } else {
      // If accessed directly without status, redirect to home
      navigate('/', { replace: true });
    }
  }, [location.search, navigate]);

  const handleGoToLogin = () => {
    navigate('/auth', { replace: true });
  };

  if (status === null) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center"
      >
        {status === 'success' ? (
          <CheckCircle className="w-20 h-20 text-success-500 mx-auto mb-4" />
        ) : (
          <XCircle className="w-20 h-20 text-danger-500 mx-auto mb-4" />
        )}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        <motion.button
          onClick={handleGoToLogin}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 transition-colors font-medium"
        >
          Go to Login
        </motion.button>
      </motion.div>
    </div>
  );
};

export default EmailVerification;
