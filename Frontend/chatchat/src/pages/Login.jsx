import React, { useState ,useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
// import { login } from '../utils/userHandler';
import { useUser } from '../context/userContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {user,setUser, login} = useUser();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Make API call to login
      const response = await login(formData);
      console.log(response)
      navigate('/');
      localStorage.setItem('chat-token', response.token);
      // setUser(response.user);
      // Mocked for example
      // setTimeout(() => {
      //   setUser({ id: Math.floor(Math.random()*100), name: 'Test User', email: formData.email });
      //   localStorage.setItem('chat-token', 'mock-token');
      //   // navigate('/');
      // }, 1000);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(()=>{
    if(user)
    {
      setTimeout(() => {
        navigate('/')
      }, 1500);
      
    }
    
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
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Sign in to ChatApp</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
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
          <div className="mb-6">
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
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-4"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </motion.button>
        </form>
        
        <div className="text-center text-gray-600 dark:text-gray-300">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-300 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;