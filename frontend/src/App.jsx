import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  Dashboard,
  AboutPage,
  ContactPage,
  HelpPage,
  SimplifyPage,
  ProfilePage,
  ResultPage,
  HistoryPage,
  ErrorPage,
  ReportPage,
  AdminDashboard,
  AdminLoginPage
} from './pages';
import { authAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('App useEffect - Token from localStorage:', token);
    const userData = localStorage.getItem('user');
    console.log('App useEffect - User data from localStorage:', userData);
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('App useEffect - Parsed user:', parsedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('App useEffect - Error parsing user data:', e);
        setUser(null);
      }
    } else {
      console.log('App useEffect - No valid token or user data, setting user to null');
      setUser(null);
    }
    setLoadingUser(false);
  }, []);

  const handleLogin = (userData) => {
    console.log('App handleLogin - Received userData:', userData);
    if (userData && userData.token) {
      setUser(userData);
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('App handleLogin - User and token set:', userData.token);
    } else {
      console.warn('App handleLogin - Invalid userData:', userData);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('App handleLogout - Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      console.log('App handleLogout - User logged out');
    }
  };

  // ✅ Private Route - Requires authentication
  const PrivateRoute = ({ children }) => {
    console.log('PrivateRoute - Checking user:', user, 'Loading:', loadingUser);
    if (loadingUser) return null;
    return user ? children : <Navigate to="/login" replace />;
  };

  // ✅ Admin Route - Requires admin role
  const AdminRoute = ({ children }) => {
    console.log('AdminRoute - Checking user:', user, 'Role:', user?.role, 'Loading:', loadingUser);
    
    if (loadingUser) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
        </div>
      );
    }
    
    if (!user) {
      console.log('AdminRoute - No user, redirecting to admin login');
      return <Navigate to="/admin/login" replace />;
    }
    
    if (user.role !== 'admin') {
      console.log('AdminRoute - User is not admin, redirecting to home');
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
      <Route path="/about" element={<AboutPage user={user} onLogout={handleLogout} />} />
      <Route path="/contact" element={<ContactPage user={user} onLogout={handleLogout} />} />
      <Route path="/help" element={<HelpPage user={user} onLogout={handleLogout} />} />
      
      {/* Guest + User Routes */}
      <Route path="/simplify" element={<SimplifyPage user={user} onLogout={handleLogout} />} />
      <Route path="/result" element={<ResultPage user={user} onLogout={handleLogout} />} />
      
      {/* User-Only Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard user={user} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/history"
        element={
          <PrivateRoute>
            <HistoryPage user={user} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/report"
        element={
          <PrivateRoute>
            <ReportPage user={user} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage user={user} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage onLogin={handleLogin} />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard user={user} onLogout={handleLogout} />
          </AdminRoute>
        }
      />
      
      {/* Error Page */}
      <Route path="*" element={<ErrorPage user={user} onLogout={handleLogout} />} />
    </Routes>
  );
}

export default App;