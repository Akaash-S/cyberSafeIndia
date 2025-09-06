import React from 'react';
import { motion } from 'framer-motion';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { auth, googleProvider } from '../../firebase';
import { Chrome } from 'lucide-react';
import api from '../../services/api';

const AuthPage: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showEmailVerificationMessage, setShowEmailVerificationMessage] = React.useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const handleBackendLogin = React.useCallback(async (idToken: string) => {
    try {
      const response = await api.post('/user/login', { idToken });
      const responseData = response.data as { success: boolean; data?: { emailVerified: boolean }; error?: string };
      if (responseData.success) {
        if (responseData.data?.emailVerified) {
          console.log('Backend login successful and email verified.');
          refreshUser(); // Refresh user context to get updated status
          navigate('/', { replace: true });
        } else {
          console.log('Backend login successful, email verification pending.');
          setShowEmailVerificationMessage(true);
          // Optionally navigate to a specific page for email verification pending
          navigate('/email-pending', { replace: true });
        }
      } else {
        setError(responseData.error || 'An unknown error occurred during backend login.');
      }
    } catch (err: unknown) {
      console.error('Error sending ID token to backend:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data &&
        typeof err.response.data.error === 'string' 
        ? err.response.data.error 
        : 'Failed to connect to backend.';
      setError(errorMessage);
    }
  }, [navigate, refreshUser]);

  // Check for redirect result on component mount
  React.useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log('Redirect authentication successful:', result.user.email);
          const idToken = await result.user.getIdToken();
          await handleBackendLogin(idToken);
        }
      } catch (error) {
        console.error('Redirect authentication error:', error);
        setError('Authentication failed. Please try again.');
      }
    };

    checkRedirectResult();
  }, [navigate, handleBackendLogin]);

  // Redirect authenticated users to home page
  React.useEffect(() => {
    if (!authLoading && user && user.emailVerified) {
      navigate('/', { replace: true });
    } else if (!authLoading && user && !user.emailVerified) {
      setShowEmailVerificationMessage(true);
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </motion.div>
      </div>
    );
  }

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    setShowEmailVerificationMessage(false);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        console.log('Authentication successful:', result.user.email);
        const idToken = await result.user.getIdToken();
        await handleBackendLogin(idToken);
      }
    } catch (error: unknown) {
      console.error('Popup authentication error:', error);
      if (error instanceof Error) {
        if (error.message.includes('popup-closed-by-user')) {
          setError('Sign-in was cancelled. Please try again.');
        } else if (error.message.includes('popup-blocked') || error.message.includes('popup-closed')) {
          try {
            setError('Popup blocked. Redirecting to Google sign-in...');
            await signInWithRedirect(auth, googleProvider);
            return;
          } catch (redirectError) {
            console.error('Redirect authentication error:', redirectError);
            setError('Authentication failed. Please try again.');
          }
        } else if (error.message.includes('network-request-failed')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError(error.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200 dark:bg-primary-800 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-3/4 right-1/4 w-64 h-64 bg-primary-300 dark:bg-primary-700 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary-400 dark:bg-primary-600 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            CyberSafe India
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Protecting India's Digital Frontier
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="card">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-2xl font-bold text-white">🛡️</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to CyberSafe India
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in with your Google account to get started
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-danger-100 border border-danger-200 text-danger-800 px-4 py-3 rounded-lg mb-4"
              >
                {error}
              </motion.div>
            )}

            {showEmailVerificationMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-info-100 border border-info-200 text-info-800 px-4 py-3 rounded-lg mb-4"
              >
                A verification email has been sent to your email address. Please check your inbox and spam folder to complete your login.
              </motion.div>
            )}

            <motion.button
              onClick={handleGoogleAuth}
              disabled={loading || showEmailVerificationMessage}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              {loading ? (
                <div className="loading-spinner mr-2"></div>
              ) : (
                <Chrome className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Signing in...' : 'Continue with Google'}
            </motion.button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center mb-2">
                <span className="text-success-600 dark:text-success-400">🛡️</span>
              </div>
              <span>Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-2">
                <span className="text-primary-600 dark:text-primary-400">⚡</span>
              </div>
              <span>Fast</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-warning-100 dark:bg-warning-900 rounded-full flex items-center justify-center mb-2">
                <span className="text-warning-600 dark:text-warning-400">🔍</span>
              </div>
              <span>Accurate</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
