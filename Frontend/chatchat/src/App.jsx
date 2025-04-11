import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { connectSocket, socket } from './socket';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { getUser } from './utils/userHandler';
import { UserContext, useUser } from './context/userContext';
import VoiceCallComponent from './pages/VoiceCall';



// claude , add a calling button to call the user use lucide-react for calling and declining call button and once user call then show this.name user is calling you would you like to answer?



const App = () => {
  const [connected, setConnected] = useState(false);
  const { user , setUser } = useUser();

  // console.log('hello ji')

  useEffect(() => {

    // getUser().then((user)=>console.log(user)).catch((e)=>console.log(e));
    // Check for stored auth token
    console.log("user : ", user)
    const token = localStorage.getItem('chat-token');
    console.log(token)
    if (token) {
      // Validate token and set user
      validateToken(token);
    }

    // Socket connection events
    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from socket server');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const validateToken = async (token) => {
    try {
      connectSocket(token);
      // API call to validate token
      // If valid, set user state
      // setUser(userData);
    } catch (error) {
      localStorage.removeItem('chat-token');
    }
  };

  const logout = () => {
    localStorage.removeItem('chat-token');
    setUser(null);
    socket.disconnect();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-blue-900 text-gray-900 dark:text-white">
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute user={user}>
              <Chat user={user} connected={connected} />
              {/* <VoiceCallComponent/> */}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute user={user}>
              <Settings user={user} logout={logout} />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
