import React, { useEffect, useState } from 'react';
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
  
  const [currentPage, setCurrentPage] = useState('login');

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
     
      setCurrentPage('home');
    } else {
      setCurrentPage('login');
    }
  }, []);

  
  const handleLogin = (userData) => {
    setUser(userData);
    
    setCurrentPage('home');
  };

  
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setCurrentPage('login');
    }
  };


  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} user={user} onLogout={handleLogout} />;
      case 'register':
        return <RegisterPage onLogin={handleLogin} user={user} onLogout={handleLogout} />;
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

 
  useEffect(() => {
    const handleNavigation = (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;

      const href = a.getAttribute('href');
      if (!href) return;

      
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
        return;
      }

      e.preventDefault();

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
       
        setCurrentPage(user ? 'home' : 'login');
      }
    };

    document.addEventListener('click', handleNavigation);
    return () => document.removeEventListener('click', handleNavigation);
  }, [user]); 

  return <div className="App">{renderPage()}</div>;
}

export default App;
