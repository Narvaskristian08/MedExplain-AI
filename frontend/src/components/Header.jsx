import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.svg';

const Header = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-md bg-white/70 shadow-md'
          : 'bg-white shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={Logo} alt="MedExplain Logo" className="h-8 w-8" />
            <h1 className="font-sans text-xl font-bold text-gray-900">
              MedExplain
            </h1>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors">Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors">Contact</Link>
              <Link to="/help" className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors">Help</Link>
              <Link to="/simplify" className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors">Simplify</Link>
            </nav>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="bg-white text-gray-700 border px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                  {user.name}
                </div>
                <button
                  onClick={onLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-colors"
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Header */}
          <div className="flex md:hidden items-center space-x-2">
            {user ? (
              <div className="bg-white text-gray-800 border px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                {user.name}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}

            <button
              onClick={toggleMobileMenu}
              type="button"
              className="text-gray-700 hover:text-blue-600 focus:outline-none transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t animate-slideDown ${
            isScrolled
              ? 'backdrop-blur-md bg-white/70 border-white/30 shadow-md'
              : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <nav className="flex flex-col px-6 py-4 space-y-3">
            <Link to="/" className="text-gray-800 hover:text-blue-600 text-base font-medium transition-colors">Home</Link>
            <Link to="/about" className="text-gray-800 hover:text-blue-600 text-base font-medium transition-colors">About</Link>
            <Link to="/contact" className="text-gray-800 hover:text-blue-600 text-base font-medium transition-colors">Contact</Link>
            <Link to="/help" className="text-gray-800 hover:text-blue-600 text-base font-medium transition-colors">Help</Link>
            <Link to="/simplify" className="text-gray-800 hover:text-blue-600 text-base font-medium transition-colors">Simplify</Link>

            {user && (
              <>
                <div className="bg-white/80 text-gray-800 border px-4 py-2 rounded-full text-base font-medium shadow-sm mt-2">
                  {user.name}
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-full text-base font-medium hover:bg-red-700 transition-colors mt-2"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
