import React, { useState, useEffect } from 'react';
import { 
  HomePage, 
  LoginPage, 
  RegisterPage, 
  Dashboard, 
  AboutPage, 
  ContactPage, 
  HelpPage 
} from './pages';
import { authAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  // Check for existing user on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentPage('dashboard');
    }
  }, []);

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call logout API endpoint
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setCurrentPage('home');
    }
  };

  // Simple routing based on current page
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'register':
        return <RegisterPage onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard user={user} onLogout={handleLogout} />;
      case 'about':
        return <AboutPage user={user} onLogout={handleLogout} />;
      case 'contact':
        return <ContactPage user={user} onLogout={handleLogout} />;
      case 'help':
        return <HelpPage user={user} onLogout={handleLogout} />;
      case 'home':
      default:
        return <HomePage user={user} onLogout={handleLogout} />;
    }
  };

  // Handle navigation
  useEffect(() => {
    const handleNavigation = (e) => {
      e.preventDefault();
      const href = e.target.getAttribute('href');
      
      if (href === '/login') {
        setCurrentPage('login');
      } else if (href === '/register') {
        setCurrentPage('register');
      } else if (href === '/dashboard') {
        setCurrentPage('dashboard');
      } else if (href === '/about') {
        setCurrentPage('about');
      } else if (href === '/contact') {
        setCurrentPage('contact');
      } else if (href === '/help') {
        setCurrentPage('help');
      } else if (href === '/') {
        setCurrentPage('home');
      }
    };

    // Add click listeners to all links
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      link.addEventListener('click', handleNavigation);
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleNavigation);
      });
    };
  }, [currentPage]);

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;
