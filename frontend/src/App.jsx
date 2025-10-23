import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  HomePage, 
  LoginPage, 
  RegisterPage, 
  Dashboard, 
  AboutPage, 
  ContactPage, 
  HelpPage,
  SimplifyPage
} from './pages';
import AdminLogin from './pages/AdminLogin';  
import { authAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // loading state while restoring user

  // Restore user on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoadingUser(false); // done restoring user
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Protect private routes
  const PrivateRoute = ({ children }) => {
    if (loadingUser) return null; // don't render until we know if user exists
    return user ? children : <Navigate to="/login" replace />;
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />

        {/* ✅ Admin Login route (unprotected) */}
        <Route path="/admin/login" element={<AdminLogin onLogin={handleLogin} />} />

        {/* Private routes */}
        <Route 
          path="/dashboard" 
          element={
              <Dashboard user={user} onLogout={handleLogout} />
          } 
        />
        <Route 
          path="/about" 
          element={
              <AboutPage user={user} onLogout={handleLogout} />

          } 
        />
        <Route 
          path="/contact" 
          element={
              <ContactPage user={user} onLogout={handleLogout} />
          } 
        />
        <Route 
          path="/help" 
          element={
              <HelpPage user={user} onLogout={handleLogout} />
          } 
        />
        <Route 
          path="/simplify" 
          element={
              <SimplifyPage user={user} onLogout={handleLogout} />
          } 
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
