import React from 'react';

const UserInfo = ({ user }) => {
  return (
    <div
      className="fixed top-4 right-4 z-50"
      style={{ zIndex: 50 }} // Ensures it stays above other content
    >
      <div className="bg-white text-gray-700 border px-4 py-2 rounded-full text-sm font-medium shadow-sm">
        {user?.name || 'Guest'}
      </div>
    </div>
  );
};

export default UserInfo;