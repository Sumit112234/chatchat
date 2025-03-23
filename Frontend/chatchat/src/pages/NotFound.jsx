import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-blue-900 px-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        className="text-9xl font-bold text-blue-600 dark:text-blue-400"
      >
        404
      </motion.div>
      <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Page Not Found</h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8"
      >
        <Link 
          to="/" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
        >
          <Home className="mr-2 h-5 w-5" />
          Go Home
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default NotFound;