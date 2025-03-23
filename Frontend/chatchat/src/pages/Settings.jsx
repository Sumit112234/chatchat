import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Moon, Sun, Bell, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = ({ user, logout }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);

  useEffect(() => {
    // Check for saved preferences in localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedNotifications = localStorage.getItem('notifications') !== 'false';
    const savedSounds = localStorage.getItem('sounds') !== 'false';
    
    setDarkMode(savedDarkMode);
    setNotifications(savedNotifications);
    setSounds(savedSounds);
    
    // Apply dark mode if it's saved as true
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', newValue);
    
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleNotifications = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('notifications', newValue);
  };

  const toggleSounds = () => {
    const newValue = !sounds;
    setSounds(newValue);
    localStorage.setItem('sounds', newValue);
  };

  return (
    <motion.div 
      className="min-h-screen bg-white dark:bg-blue-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-white mr-3">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
        
        <div className="bg-white dark:bg-blue-800 rounded-lg shadow-lg overflow-hidden">
          {/* User Profile */}
          <div className="p-6 border-b border-gray-200 dark:border-blue-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile</h2>
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {user?.name?.substring(0, 2) || 'U'}
              </div>
              <div className="ml-4">
                <div className="font-medium text-lg text-gray-900 dark:text-white">{user?.name || 'User'}</div>
                <div className="text-gray-600 dark:text-gray-300">{user?.email || 'user@example.com'}</div>
              </div>
            </div>
          </div>
          
          {/* Appearance */}
          <div className="p-6 border-b border-gray-200 dark:border-blue-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-gray-700 dark:text-gray-200 mr-3" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-700 dark:text-gray-200 mr-3" />
                )}
                <span className="text-gray-900 dark:text-white">Dark mode</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          // pages/Settings.jsx (continued)
          {/* Notifications */}
          <div className="p-6 border-b border-gray-200 dark:border-blue-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-700 dark:text-gray-200 mr-3" />
                  <span className="text-gray-900 dark:text-white">Push notifications</span>
                </div>
                <button
                  onClick={toggleNotifications}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    notifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {sounds ? (
                    <Volume2 className="h-5 w-5 text-gray-700 dark:text-gray-200 mr-3" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-gray-700 dark:text-gray-200 mr-3" />
                  )}
                  <span className="text-gray-900 dark:text-white">Sound effects</span>
                </div>
                <button
                  onClick={toggleSounds}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    sounds ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      sounds ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Privacy & Security */}
          <div className="p-6 border-b border-gray-200 dark:border-blue-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Privacy & Security</h2>
            <div className="space-y-2">
              <button className="w-full text-left py-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300">
                Change password
              </button>
              <button className="w-full text-left py-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300">
                Blocked users
              </button>
              <button className="w-full text-left py-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300">
                Data & privacy settings
              </button>
            </div>
          </div>
          
          {/* Logout */}
          <div className="p-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={logout}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md"
            >
              Sign out
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;