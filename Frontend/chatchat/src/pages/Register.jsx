import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { signup } from '../utils/userHandler';
import { useUser } from '../context/userContext';

const Register = () => {
  const [step, setStep] = useState(1);
  const {user, setUser} = useUser()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const navigate = useNavigate();

  // Simulated username availability check
  const checkUsernameAvailability = async (username) => {
    // In a real app, this would be an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate some existing usernames
        const takenUsernames = ['john', 'jane', 'admin'];
        resolve(!takenUsernames.includes(username.toLowerCase()));
      }, 500);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Special handling for username availability
    if (name === 'username') {
      setUsernameAvailable(null);
    }
  };

  const validateStep = () => {
    switch(step) {
      case 1:
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        return true;
      
      case 2:
        // Password validation
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;
      
      case 3:
        // Full name validation
        if (!formData.fullName.trim()) {
          setError('Please enter your full name');
          return false;
        }
        return true;
      
      case 4:
        // Username validation
        if (!formData.username.trim()) {
          setError('Please enter a username');
          return false;
        }
        return true;
      
      default:
        return false;
    }
  };

  const handleNextStep = async () => {
    setError('');
    
    // Validate current step
    if (!validateStep()) {
      return;
    }

    // Special handling for username availability on final step
    if (step === 4) {
      setLoading(true);
      try {
        const isAvailable = await checkUsernameAvailability(formData.username);
        if (!isAvailable) {
          setError('Username is already taken');
          setUsernameAvailable(false);
          setLoading(false);
          return;
        }
        setUsernameAvailable(true);
      } catch (err) {
        setError('Error checking username availability');
        setLoading(false);
        return;
      }
    }

    // Move to next step or submit
    if (step < 4) {
      setStep(prev => prev + 1);
    } else {
      // Final submission
    
        // Simulated registration
        setTimeout(() => {
          console.log(formData);
          signup(formData)
          .then((data)=>{
            console.log(data);
            setLoading(false)
            navigate('/')
          })
          .catch((e)=>{
            setError('Registration failed. Please try again.');
            console.log(e)
            setLoading(false)
          })
          // setUser({ 
          //   id: 1, 
          //   name: formData.fullName, 
          //   email: formData.email,
          //   username: formData.username 
          // });
          // localStorage.setItem('chat-token', 'mock-token');
          // ;
        }, 1000);
     
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-blue-900 text-gray-900 dark:text-white"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        );
      
      case 2:
        return (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-blue-900 text-gray-900 dark:text-white"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-blue-900 text-gray-900 dark:text-white"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </>
        );
      
      case 3:
        return (
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-blue-900 text-gray-900 dark:text-white"
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
        );
      
      case 4:
        return (
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2" htmlFor="username">
              Username
            </label>
            <input
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                usernameAvailable === false 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-blue-700 focus:ring-blue-500'
              } bg-white dark:bg-blue-900 text-gray-900 dark:text-white`}
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {usernameAvailable === false && (
              <p className="text-red-500 text-sm mt-1">
                Username is already taken
              </p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
    useEffect(()=>{
      if(user)
        navigate('/')
      
    },[user])

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-white dark:bg-blue-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white dark:bg-blue-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="h-12 w-12 text-blue-600 dark:text-white" />
          </motion.div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Create an account
        </h1>
        
        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          {[1, 2, 3, 4].map((num) => (
            <div 
              key={num}
              className={`h-2 w-2 rounded-full mx-1 ${
                step >= num ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={(e) => {
          e.preventDefault();
          handleNextStep();
        }}>
          {renderStepContent()}
          
          <div className="flex justify-between">
            {step > 1 && (
              <motion.button
                type="button"
                onClick={handlePrevStep}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md focus:outline-none"
              >
                Previous
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              type="submit"
              disabled={loading}
            >
              {step < 4 
                ? 'Next' 
                : (loading ? 'Creating account...' : 'Sign up')
              }
            </motion.button>
          </div>
        </form>
        
        <div className="text-center text-gray-600 dark:text-gray-300 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-300 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;