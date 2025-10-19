import React from 'react';
import Header from '../components/Header';

const AboutPage = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-100">
      <Header user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            About Us
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Learn more about our mission and values
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600">
                We are dedicated to providing innovative solutions that help our users 
                achieve their goals. Our platform is designed with simplicity and 
                functionality in mind, ensuring the best possible experience for 
                everyone who uses our services.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Our Values
              </h2>
              <ul className="text-gray-600 space-y-2">
                <li>• User-first approach in everything we do</li>
                <li>• Continuous innovation and improvement</li>
                <li>• Transparency and open communication</li>
                <li>• Security and privacy protection</li>
                <li>• Accessibility for all users</li>
              </ul>
            </div>
          </div>

          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">JD</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">John Doe</h3>
                <p className="text-gray-600">CEO & Founder</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">JS</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Jane Smith</h3>
                <p className="text-gray-600">CTO</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">MJ</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Mike Johnson</h3>
                <p className="text-gray-600">Lead Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
