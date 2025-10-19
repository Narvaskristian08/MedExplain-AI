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

  // Restore user on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
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
    return user ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
        
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard user={user} onLogout={handleLogout} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/about" 
          element={
            <PrivateRoute>
              <AboutPage user={user} onLogout={handleLogout} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/contact" 
          element={
            <PrivateRoute>
              <ContactPage user={user} onLogout={handleLogout} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/help" 
          element={
            <PrivateRoute>
              <HelpPage user={user} onLogout={handleLogout} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/simplify" 
          element={
            <PrivateRoute>
              <SimplifyPage user={user} onLogout={handleLogout} />
            </PrivateRoute>
          } 
        />
        {/* Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
