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
import { authAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // NEW: loading state while restoring user

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
    if (loadingUser) return null; // don't render anything until we know if user exists
    return user ? children : <Navigate to="/login" replace />;
  };

  if (loadingUser) {
    // Optionally show a loader
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
        
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
