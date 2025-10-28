import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../../assets/logo.svg';
import DashboardIconDefault from '../../assets/dashboard-default.svg';
import DashboardIconColored from '../../assets/dashboard-colored.svg';
import ReportIconDefault from '../../assets/report-default.svg';
import ReportIconColored from '../../assets/report_colored.svg';

const SideNav = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleNav = () => setIsOpen(!isOpen);

  const navItems = [
    { 
      name: 'Dashboard', 
      icon: location.pathname === '/dashboard' ? DashboardIconColored : DashboardIconDefault, 
      href: '/dashboard' 
    },
    { 
      name: 'Reports', 
      icon: location.pathname === '/report' ? ReportIconColored : ReportIconDefault, 
      href: '/report' 
    },
    { 
      name: 'History', 
      icon: null, 
      href: '/history' 
    },
  ];

  const handleNavigation = (href) => {
    navigate(href);
    setIsOpen(false); // Close mobile menu after navigation
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  return (
    <>
      {/* Hamburger Button for Mobile */}
      <button
        onClick={toggleNav}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-black hover:bg-white/20 transition-all duration-300 md:hidden"
      >
        {isOpen ? '✖' : '☰'}
      </button>

      {/* Side Navigation */}
      <nav
        className={`fixed top-0 left-0 h-screen w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-lg flex flex-col justify-between text-black transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-40 overflow-y-auto`}
        style={{ maxHeight: '100vh', maxWidth: '100vw' }}
      >
        {/* Logo Section */}
        <div className="p-10 pt-20">
          <div className="mb-8 flex items-center justify-center md:justify-start">
            <img src={Logo} alt="MedExplain Logo" className="h-8 w-auto mr-2" />
            <span className={`text-2xl font-bold text-black ${isOpen ? 'block' : 'hidden md:block'}`}>
              MedExplain
            </span>
          </div>
          
          {/* Navigation Items */}
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    location.pathname === item.href ? 'bg-white/20' : ''
                  }`}
                >
                  {item.icon && (
                    <img 
                      src={item.icon} 
                      alt={item.name} 
                      className="h-6 w-6" 
                    />
                  )}
                  <span className={`text-sm ${location.pathname === item.href ? 'text-blue-500 font-semibold' : 'text-black'}`}>
                    {item.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout & Home Buttons */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex flex-col items-center gap-1 p-3 rounded-lg text-black hover:bg-red-500/20 transition-all duration-300 hover:scale-105 hover:shadow-lg mb-2"
          >
            <span className="text-2xl"></span>
            <span className="text-sm">Logout</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex flex-col items-center gap-1 p-3 rounded-lg text-black hover:bg-blue-500/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <span className="text-2xl"></span>
            <span className="text-sm">Back to Home</span>
          </button>
        </div>
      </nav>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleNav}
        ></div>
      )}
    </>
  );
};

export default SideNav;