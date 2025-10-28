import React from 'react';
import { useNavigate } from 'react-router-dom';
import SideNav from '../components/dashboard/Sidebar';
import UserInfo from '../components/dashboard/UserInfo';
import Header from '../components/Header';

const ErrorPage = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-100">
    <header user={user} onLogout={onLogout} />
      <div className="flex-1 flex items-center justify-center p-6  md: transition-all duration-300">
        <div className="bg-white rounded-[30px] shadow-xl p-8 max-w-2xl w-full text-center">
          {/* AI + Medical SVG Icon */}
          <div className="flex justify-center mb-6">
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Stethoscope (Medical) */}
              <path
                d="M80 30a10 10 0 00-10-10H30a10 10 0 00-10 10v40a10 10 0 0010 10h40a10 10 0 0010-10V30z"
                stroke="#36A2EB"
                strokeWidth="4"
              />
              <path
                d="M50 20c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20z"
                stroke="#36A2EB"
                strokeWidth="4"
              />
              {/* Neural Network Dots (AI) */}
              <circle cx="30" cy="30" r="3" fill="#FF6384" />
              <circle cx="70" cy="30" r="3" fill="#FF6384" />
              <circle cx="50" cy="50" r="3" fill="#FF6384" />
              <circle cx="30" cy="70" r="3" fill="#FF6384" />
              <circle cx="70" cy="70" r="3" fill="#FF6384" />
              <path
                d="M30 30L50 50M70 30L50 50M30 70L50 50M70 70L50 50"
                stroke="#FF6384"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600 text-lg mb-6">
            Oops! It looks like this page doesn't exist. Our AI-powered medical assistant can't find the record you're looking for.
          </p>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-[30px] hover:bg-blue-700"
            onClick={() => navigate(user ? '/simplify' : '/')}
          >
            {user ? 'Back to Simplify' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;