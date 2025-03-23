import React from 'react';
import { motion } from 'framer-motion';

const MessageBubble = ({ message, isOwn, showSender = false }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${
        isOwn
          ? 'bg-blue-600 text-white rounded-br-none'
          : 'bg-white dark:bg-blue-800 text-gray-900 dark:text-white rounded-bl-none'
      }`}
    >
      {showSender && !isOwn && (
        <div className="font-medium text-xs mb-1 text-gray-500 dark:text-gray-300">
          {message.sender.name}
        </div>
      )}
      <div>{message.text}</div>
      <div className={`text-xs mt-1 text-right ${
        isOwn
          ? 'text-blue-200'
          : 'text-gray-500 dark:text-gray-400'
      }`}>
        {formatTime(message.timestamp)}
      </div>
    </motion.div>
  );
};

export default MessageBubble;