import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/homepage/herosection';
import StepSection from '../components/homepage/stepsection';

const HomePage = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-200 relative overflow-hidden">
      <Header user={user} onLogout={onLogout} />
      <HeroSection />
      <StepSection />
    </div>
  );
};

export default HomePage;
