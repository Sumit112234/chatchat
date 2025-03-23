import React from 'react';

const UserAvatar = ({ name, size = 'md', status }) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8 text-xs';
      case 'lg': return 'h-12 w-12 text-lg';
      case 'xl': return 'h-16 w-16 text-xl';
      default: return 'h-10 w-10 text-sm';
    }
  };

  return (
    <div className="relative">
      <div className={`${getSize()} rounded-full bg-blue-500 flex items-center justify-center text-white font-medium`}>
        {name ? name.substring(0, 2).toUpperCase() : 'U'}
      </div>
      {status && (
        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-blue-800 ${
          status === 'online' ? 'bg-green-500' : status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
        }`}></span>
      )}
    </div>
  );
};

export default UserAvatar;