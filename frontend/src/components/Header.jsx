import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.svg';

const Header = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-white/70 shadow-xs' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side - Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img src={Logo} alt="MedExplain Logo" className="h-8 w-8" />
              <h1 className="font-sans text-xl font-bold text-gray-900">
                MedExplain
              </h1>
            </Link>
          </div>

          {/* Right Side - Navigation + User Menu */}
          <div className="flex items-center space-x-6">
            
            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-6">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/help"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Help
              </Link>
              {/* NEW — Simplify Page */}
              <Link
                to="/simplify"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Simplify
              </Link>
            </nav>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="bg-white text-gray-700 border px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                  {user.name || 'Guest'}
                </div>
                <button
                  onClick={onLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="bg-white text-gray-700 border px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                  Guest
                </div>
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
