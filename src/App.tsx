import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import AuthPage from './components/Auth/AuthPage';
import PrivateRoute from './components/Auth/PrivateRoute';
import Home from './components/Home/Home';
import ScanURL from './components/Scan/ScanURL';
import Dashboard from './components/Dashboard/Dashboard';
import Analytics from './components/Analytics/Analytics';
import Profile from './components/Profile/Profile';
import ToastComponent from './components/Toast/Toast';
import EmailVerification from './components/Auth/EmailVerification';

// Component to handle home route - show home for unauthenticated users, redirect authenticated users
const HomeRoute: React.FC = () => {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and email is verified, redirect to dashboard
  if (user && user.emailVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated but email is not verified, redirect to email pending page
  if (user && !user.emailVerified) {
    return <Navigate to="/email-pending" replace />;
  }

  // If user is not authenticated, show home page
  return <Home />;
};

const EmailPendingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Email Verification Pending</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          A verification email has been sent to your email address. Please check your inbox and spam folder to complete your login.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          You will be redirected to the dashboard once your email is verified.
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomeRoute />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/email-verified" element={<EmailVerification />} />
            <Route path="/email-pending" element={<EmailPendingPage />} />
            
            {/* Protected Routes */}

            <Route path="/dashboard" element={
              <PrivateRoute>
                <Navbar />
                <Dashboard />
              </PrivateRoute>
            } />

            <Route path="/scan" element={
              <PrivateRoute>
                <Navbar />
                <ScanURL />
              </PrivateRoute>
            } />

            <Route path="/analytics" element={
              <PrivateRoute>
                <Navbar />
                <Analytics />
              </PrivateRoute>
            } />

            <Route path="/profile" element={
              <PrivateRoute>
                <Navbar />
                <Profile />
              </PrivateRoute>
            } />

            {/* Redirect to home for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastComponent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
