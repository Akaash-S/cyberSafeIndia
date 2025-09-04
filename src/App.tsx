import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './components/Auth/AuthPage';
import PrivateRoute from './components/Auth/PrivateRoute';
import Home from './components/Home/Home';
import ScanURL from './components/Scan/ScanURL';
import Dashboard from './components/Dashboard/Dashboard';
import Analytics from './components/Analytics/Analytics';
import Profile from './components/Profile/Profile';

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

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is not authenticated, show home page
  return <Home />;
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
