import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const ResultPage = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { originalText = 'No original text available.', simplifiedText = 'No simplified text available. Please submit text first.' } = location.state || {};

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-100 pt-20">
      <Header user={user} onLogout={onLogout} />
      <div className="flex flex-col items-center justify-center p-6 space-y-8 w-full">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Simplified Result
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
          <div className="bg-white rounded-[30px] shadow-xl border border-gray-200 p-6 h-[400px] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center sticky top-0 bg-white">
              Original Text
            </h2>
            <p className="text-gray-600 text-lg whitespace-pre-wrap">{originalText}</p>
          </div>
          <div className="bg-white rounded-[30px] shadow-xl border border-gray-200 p-6 h-[400px] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center sticky top-0 bg-white">
              Simplified Text
            </h2>
            <p className="text-gray-600 text-lg whitespace-pre-wrap">{simplifiedText}</p>
          </div>
        </div>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-[30px] hover:bg-blue-700"
          onClick={() => navigate('/simplify')}
        >
          Back to Simplify
        </button>
      </div>
    </div>
  );
};

export default ResultPage;