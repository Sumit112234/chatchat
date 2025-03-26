import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send,Loader2,Menu, Settings, Users, LogOut, MessageCircle, Mic, Image, Video, PauseCircle, X, Download, Share, Trash, ZoomIn } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket';
import AudioPlayer from '../components/AudioPlayer';
import {useUser} from '../context/userContext.jsx'

let backend_url = import.meta.env.VITE_APP_SERVER_URL;

const Chat = ({  connected }) => {

  const { user, logout } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [zoomedMedia, setZoomedMedia] = useState(null);
  const [sendBtnLoading, setSendBtnLoading] = useState(false);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  
  // Mock conversations for display
  useEffect(() => {
    setConversations([
      { id: 1, name: 'John Doe', lastMessage: 'Hey, how are you?', unread: 3 },
      { id: 2, name: 'Jane Smith', lastMessage: 'The meeting is at 2pm', unread: 0 },
      { id: 3, name: 'Team Chat', lastMessage: 'Alice: I finished the report', unread: 1, isGroup: true },
    ]);
    setCurrentConversation({ id: 1, name: 'John Doe' });
  }, []);

  // Mock messages for display
  useEffect(() => {
    if (currentConversation) {
      setMessages([
        { id: 1, sender: { id: 2, name: 'John Doe' }, text: 'Hey there!', timestamp: new Date(Date.now() - 3600000) },
        { id: 2, sender: { id: 1, name: 'You' }, text: 'Hi! How are you?', timestamp: new Date(Date.now() - 3500000) },
        { id: 3, sender: { id: 2, name: 'John Doe' }, text: 'I\'m good, thanks for asking. How about you?', timestamp: new Date(Date.now() - 3400000) },
        { id: 4, sender: { id: 2, name: 'John Doe' }, type: 'image', media: '/api/placeholder/400/300', text: 'Check out this photo!', timestamp: new Date(Date.now() - 3000000) },
      ]);
    }
  }, [currentConversation]);

  useEffect(() => {
    // Socket events for receiving messages
    socket.on('receiveMessage', (message) => {
      if (message.sender.id !== user.id) {
        console.log("message received : ", message);
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some(msg => msg.id === message.id);
          if (!messageExists) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
      }
    });

    socket.on('userTyping', ({ userId, username, isTyping }) => {
      if (userId !== user.id) {
        setTypingUsers(prev => {
          if (isTyping && !prev.some(u => u.id === userId)) {
            return [...prev, { id: userId, name: username }];
          } else if (!isTyping) {
            return prev.filter(u => u.id !== userId);
          }
          return prev;
        });
      }
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('userTyping');
    };
  }, [user.id]);

  useEffect(() => {
    // Scroll to bottom of messages
    scrollToBottom();
  }, [messages]);

  // Cleanup recording resources when component unmounts
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Typing indicator logic
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Emit typing event
    socket.emit('typing', {
      conversationId: currentConversation.id,
      userId: user.id,
      username: user.name,
      isTyping: e.target.value.length > 0
    });
  };

  const handleSendMessage = async(e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !mediaPreview) || !connected) return;
    

    setSendBtnLoading(true)


   

    const message = {
      id: Date.now(),
      sender: { id: user.id, name: user.name },
      text: newMessage,
      timestamp: new Date(),
      conversationId: currentConversation.id,
    };

    // Add media type if present
    if (mediaPreview) {
      await  UploadFiles(message);
      // console.log(mediaPreview)
      // message.type = mediaPreview.type.split('/')[0]; // 'image', 'audio', or 'video'
      // message.media = mediaPreview.preview;
    }

    // Optimistically add message to state
    setMessages((prevMessages) => [...prevMessages, message]);
    setSendBtnLoading(false);
    // Emit message to server
    socket.emit('sendMessage', message);
    console.log("message sended : ", message);
    
    // Reset state
    setNewMessage('');
    setMediaPreview(null);
    
    // Reset typing indicator
    socket.emit('typing', {
      conversationId: currentConversation.id,
      userId: user.id,
      username: user.name,
      isTyping: false
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMediaClick = (type) => {
    fileInputRef.current.setAttribute('accept', type === 'image' ? 'image/*' : 'video/*');
    fileInputRef.current.click();
  };

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const fileType = file.type.split('/')[0]; // 'image' or 'video'
  //     const reader = new FileReader();
      
  //     reader.onload = (event) => {
  //       setMediaPreview({
  //         type: file.type,
  //         preview: event.target.result,
  //         name: file.name
  //       });
  //     };
      
  //     reader.readAsDataURL(file);
  //   }
  // };
  
  const UploadFiles = async(message)=>{
    if(!file)
        return; 

    const formData = new FormData();
    formData.append('file', file);
  
    try {
        console.log('Uploading file....');
      // Send file to backend
      const response = await fetch(backend_url + 'upload', {
        method: 'POST',
        body: formData
      });
  
      const data = await response.json();
  
      if (data.success) {
        setFile(null);
        setMediaPreview({
          type: file.type,
          preview: data.fileUrl, // Store the uploaded file URL
          name: file.name
        });
        message.type = file.type.split('/')[0]; // 'image', 'audio', or 'video'
        message.media = data.fileUrl;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    

  }


  const handleFileChange = async (e) => {
    const files = e.target.files[0];
    
    if (!files) return;

    setFile(files);
  
    const fileType = files.type.split('/')[0]; // 'image', 'audio', or 'video'
  

    const reader = new FileReader();
      
    // show file before sending
      reader.onload = (event) => {
        setMediaPreview({
          type: files.type,
          preview: event.target.result,
          name: files.name
        });
      };
      
      reader.readAsDataURL(files);

 };
  
  const blobToBase64 = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result);
    });
  };
  
  // const handleMicClick = async () => {
  //   if (!isRecording) {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //       mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  //       audioChunksRef.current = [];
        
  //       mediaRecorderRef.current.ondataavailable = (event) => {
  //         if (event.data.size > 0) {
  //           audioChunksRef.current.push(event.data);
  //         }
  //       };
        
  //       mediaRecorderRef.current.onstop = async () => {
  //         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
  //         const audioUrl = URL.createObjectURL(audioBlob);
          

  //         const base64Audio = await blobToBase64(audioBlob);

  //         setMediaPreview({
  //           type: 'audio/webm',
  //           preview: base64Audio,
  //           name: `Recording_${new Date().toISOString()}`
  //         });
          
  //         // Stop all tracks
  //         stream.getTracks().forEach(track => track.stop());
          
  //         // Reset recording time and clear interval
  //         clearInterval(recordingIntervalRef.current);
  //         setRecordingTime(0);
  //       };
        
  //       // Start recording
  //       mediaRecorderRef.current.start();
  //       setIsRecording(true);
        
  //       // Start timer
  //       recordingIntervalRef.current = setInterval(() => {
  //         setRecordingTime(prevTime => prevTime + 1);
  //       }, 1000);
        
  //     } catch (error) {
  //       console.error('Error accessing microphone:', error);
  //     }
  //   } else {
  //     // Stop recording
  //     if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
  //       mediaRecorderRef.current.stop();
  //       setIsRecording(false);
  //     }
  //   }
  // };

  const handleMicClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
        audioChunksRef.current = [];
  
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
  
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const audioUrl = URL.createObjectURL(audioBlob);
  
          // Preview before uploading
          setMediaPreview({
            type: "audio/webm",
            preview: audioUrl,
            name: `Recording_${Date.now()}.webm`,
          });
  
          // Convert to file format
          const audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, { type: "audio/webm" });
          setFile(audioFile); // Store file for upload
  
          // Stop all tracks
          stream.getTracks().forEach((track) => track.stop());
  
          // Reset recording time and clear interval
          clearInterval(recordingIntervalRef.current);
          setRecordingTime(0);
        };
  
        // Start recording
        mediaRecorderRef.current.start();
        setIsRecording(true);
  
        // Start timer
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime((prevTime) => prevTime + 1);
        }, 1000);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  };
  
  const cancelMediaPreview = () => {
    setMediaPreview(null);
  };

  // Handle zooming in on media
  const handleZoomMedia = (message) => {
    setZoomedMedia(message);
  };

  // Close zoomed media view
  const closeZoomedMedia = () => {
    setZoomedMedia(null);
  };

  // Handle media download
  // const handleDownloadMedia = (mediaUrl, filename, type) => {
  //   const link = document.createElement('a');
  //   link.href = mediaUrl;
  //   link.download = filename || `download-${Date.now()}.${type}`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  
const handleDownloadMedia = (mediaUrl, filename, type) => {
  // For images and media with data URLs
  if (mediaUrl.startsWith('data:') || mediaUrl.startsWith('blob:')) {
    // For data URLs, we need to fetch the data and create a blob
    fetch(mediaUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate appropriate extension based on media type
        let extension = 'file';
        if (type === 'image') extension = 'jpg';
        else if (type === 'video') extension = 'mp4';
        else if (type === 'audio') extension = 'mp3';
        
        link.download = `${filename || `download-${Date.now()}`}.${extension}`;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      })
      .catch(error => {
        console.error('Error downloading media:', error);
        alert('Failed to download. Please try again.');
      });
  } else {
    // For regular URLs
    const link = document.createElement('a');
    link.href = mediaUrl;
    
    // Extract extension from URL or use default
    const urlExtension = mediaUrl.split('.').pop().split('?')[0];
    let extension = urlExtension || 'file';
    if (type === 'image' && !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) extension = 'jpg';
    else if (type === 'video' && !['mp4', 'webm', 'mov'].includes(extension)) extension = 'mp4';
    else if (type === 'audio' && !['mp3', 'wav', 'ogg'].includes(extension)) extension = 'mp3';
    
    link.download = `${filename || `download-${Date.now()}`}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};



  // Message rendering based on type
  const renderMessage = (message) => {
    return (
      <div className="relative">
        {message.sender.id !== user.id && (
          <div className="font-medium text-xs mb-1 text-gray-500 dark:text-gray-300">
            {message.sender.name}
          </div>
        )}
        
        {message.text && <div className="mb-2">{message.text}</div>}
        
        {message.type === 'image' && (
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src={message.media} 
              alt="Shared image" 
              className="rounded-md max-w-full max-h-60 object-contain mb-2 cursor-pointer"
              onClick={() => handleZoomMedia(message)}
            />
            <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleZoomMedia(message)}
                className="p-1 bg-gray-800/70 rounded-full text-white"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </motion.div>
        )}
        
        {message.type === 'video' && (
          
          <motion.video 
            src={message.media} 
            controls 
            className="rounded-md max-w-full max-h-60 mb-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />

          
        )}


        
        {message.type === 'audio' && (
          <AudioPlayer message={message}/>
          // <motion.div
          //   className="w-full mb-2 bg-gray-100 dark:bg-blue-950  rounded-md p-5 "
          //   initial={{ opacity: 0, scale: 0.8 }}
          //   animate={{ opacity: 1, scale: 1 }}
          //   transition={{ duration: 0.3 }}
          // >
          //   <audio 
          //     src={message.media} 
          //     controls 
          //     className="w-full"
          //   />
          // </motion.div>
        )}
        
        <div className={`text-xs mt-1 text-right ${
          message.sender.id === user.id
            ? 'text-blue-200'
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white dark:bg-blue-900">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-80 bg-white dark:bg-blue-800 border-r border-gray-200 dark:border-blue-700 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-blue-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-blue-600 dark:text-white" />
                <h1 className="font-bold text-xl text-gray-900 dark:text-white">ChatApp</h1>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 dark:text-gray-300 md:hidden"
              >
                <Menu size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 px-3 py-2">
                  Conversations
                </div>
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setCurrentConversation(conv)}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
                      currentConversation?.id === conv.id
                        ? 'bg-blue-100 dark:bg-blue-700'
                        : 'hover:bg-gray-100 dark:hover:bg-blue-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {conv.isGroup ? (
                          <Users className="h-10 w-10 text-blue-500 dark:text-blue-300 p-2 bg-blue-100 dark:bg-blue-800 rounded-full" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white font-medium">
                            {conv.name.substring(0, 2)}
                          </div>
                        )}
                        {connected && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-blue-800"></span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {conv.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 truncate w-40">
                          {conv.lastMessage}
                        </div>
                      </div>
                    </div>
                    {conv.unread > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-blue-700">
              <Link
                to="/settings"
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-white"
              >
                <Settings size={20} />
                <span>Settings</span>
              </Link>
              <button onClick={()=>logout()} className="mt-4 flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-white">
                <LogOut size={20} />
                <span>Sign out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 dark:border-blue-700 p-4 flex items-center justify-between">
          {!sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="mr-4 text-gray-500 dark:text-gray-300"
            >
              <Menu size={20} />
            </button>
          )}
          
          {currentConversation && (
            <div className="flex items-center">
              <div className="font-medium text-lg text-gray-900 dark:text-white">
                {currentConversation.name}
              </div>
              {connected && (
                <span className="ml-2 text-sm text-green-500">online</span>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-blue-900">
          {!connected && (
            <div className="text-center py-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
              You are currently offline. Messages will be sent when you reconnect.
            </div>
          )}
          
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender.id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${
                  message.sender.id === user.id
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-blue-800 text-gray-900 dark:text-white rounded-bl-none'
                }`}
              >
                {renderMessage(message)}
              </motion.div>
            </div>
          ))}
          
          {/* Typing indicator */}
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-start"
              >
                <div className="bg-white dark:bg-blue-800 p-3 rounded-lg text-gray-900 dark:text-white rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <motion.div 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="h-2 w-2 bg-gray-500 dark:bg-gray-300 rounded-full"
                      />
                      <motion.div 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="h-2 w-2 bg-gray-500 dark:bg-gray-300 rounded-full"
                      />
                      <motion.div 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="h-2 w-2 bg-gray-500 dark:bg-gray-300 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-300">
                      {typingUsers.length === 1 
                        ? `${typingUsers[0].name} is typing...` 
                        : `${typingUsers.length} people are typing...`}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Preview section for media */}
        <AnimatePresence>
          {mediaPreview && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-t border-gray-200 dark:border-blue-700 bg-gray-50 dark:bg-blue-900 flex items-center"
            >
              <div className="relative flex-1 flex items-center space-x-3">
                {mediaPreview.type.startsWith('image') && (
                  <img src={mediaPreview.preview} alt="Preview" className="h-16 rounded" />
                )}
                {mediaPreview.type.startsWith('video') && (
                  <video src={mediaPreview.preview} className="h-16 rounded" />
                )}
                {mediaPreview.type.startsWith('audio') && (
                  <div className="flex items-center bg-blue-100 dark:bg-blue-800 p-2 rounded">
                    <Mic size={24} className="text-blue-600 dark:text-blue-300 mr-2" />
                    <span className="text-gray-900 dark:text-white">Audio recording</span>
                  </div>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-300 flex-1 truncate">
                  {mediaPreview.name}
                </span>
                <button 
                  onClick={cancelMediaPreview}
                  className="text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-t border-gray-200 dark:border-blue-700 bg-red-50 dark:bg-red-900/20 flex items-center justify-between"
            >
              <div className="flex items-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="h-3 w-3 bg-red-500 rounded-full mr-3"
                />
                <span className="text-red-600 dark:text-red-400">Recording audio...</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-600 dark:text-gray-300">{formatRecordingTime(recordingTime)}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMicClick}
                  className="p-1 rounded-full bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400"
                >
                  <PauseCircle size={24} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-blue-700 p-4 bg-white dark:bg-blue-800">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => handleMediaClick('image')}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700 rounded-full"
            >
              <Image size={20} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => handleMediaClick('video')}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700 rounded-full"
            >
              <Video size={20} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleMicClick}
              className={`p-2 rounded-full ${
                isRecording 
                  ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30' 
                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700'
              }`}
            >
              <Mic size={20} />
            </motion.button>
            
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              disabled={isRecording}
              className="flex-1 border border-gray-300 dark:border-blue-700 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-blue-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-blue-950 disabled:cursor-not-allowed"
            />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={sendBtnLoading || (!newMessage.trim() && !mediaPreview) || !connected}
              className={`p-2 rounded-full flex items-center justify-center ${
                sendBtnLoading || (!newMessage.trim() && !mediaPreview) || !connected
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {sendBtnLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </motion.button>
          </div>
        </form>
      </div>



      {/* Zoomed media modal */}

      <AnimatePresence>
  {zoomedMedia && (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={closeZoomedMedia}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="relative max-w-4xl max-h-full bg-white dark:bg-blue-900 rounded-lg overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 flex justify-between items-center bg-gray-100 dark:bg-blue-800">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {zoomedMedia.sender.name.substring(0, 2)}
            </div>
            <div>
              <div className="text-gray-800 dark:text-white font-medium">
                {zoomedMedia.sender.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                {formatTime(zoomedMedia.timestamp)}
              </div>
            </div>
          </div>
          <button 
            onClick={closeZoomedMedia}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full p-1 hover:bg-gray-200 dark:hover:bg-blue-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 flex justify-center bg-gray-900/20 dark:bg-black/40">
          {zoomedMedia.type === 'image' && (
            <motion.img 
              src={zoomedMedia.media} 
              alt="Enlarged media" 
              className="max-h-[70vh] max-w-full object-contain rounded-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              drag
              dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
              dragElastic={0.1}
            />
          )}
          {zoomedMedia.type === 'video' && (
            <video 
              src={zoomedMedia.media} 
              controls 
              className="max-h-[70vh] max-w-full rounded-md"
              autoPlay
            />
          )}
          {zoomedMedia.type === 'audio' && (
            <div className="w-full p-8 bg-gray-100 dark:bg-blue-950 rounded-md">
              <audio 
                src={zoomedMedia.media} 
                controls 
                className="w-full"
                
              />
            </div>
          )}
        </div>
        
        {zoomedMedia.text && (
          <div className="px-4 py-2 text-gray-800 dark:text-white border-t border-gray-200 dark:border-blue-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Caption</p>
            {zoomedMedia.text}
          </div>
        )}
        
        <div className="p-4 border-t border-gray-200 dark:border-blue-700 flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDownloadMedia(
              zoomedMedia.media, 
              `${zoomedMedia.sender.name.replace(/\s+/g, '_')}_${zoomedMedia.type}_${new Date().getTime()}`, 
              zoomedMedia.type
            )}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            <Download size={18} />
            <span>Download</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-200 dark:bg-blue-700 hover:bg-gray-300 dark:hover:bg-blue-600 text-gray-800 dark:text-white rounded-md"
          >
            <Share size={18} />
            <span>Share</span>
          </motion.button>

          {zoomedMedia.sender.id === user.id && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded-md"
            >
              <Trash size={18} />
              <span>Delete</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
</div>
)
}
export default Chat;

// import React, { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import { Send, Menu, Settings, Users, LogOut, MessageCircle, Mic, Image, Video, PauseCircle, X } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { socket } from '../socket';

// const Chat = ({ user, connected }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [conversations, setConversations] = useState([]);
//   const [currentConversation, setCurrentConversation] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordingTime, setRecordingTime] = useState(0);
//   const [mediaPreview, setMediaPreview] = useState(null);
//   const [typingUsers, setTypingUsers] = useState([]);
//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const recordingIntervalRef = useRef(null);
  
//   // Mock conversations for display
//   useEffect(() => {
//     setConversations([
//       { id: 1, name: 'John Doe', lastMessage: 'Hey, how are you?', unread: 3 },
//       { id: 2, name: 'Jane Smith', lastMessage: 'The meeting is at 2pm', unread: 0 },
//       { id: 3, name: 'Team Chat', lastMessage: 'Alice: I finished the report', unread: 1, isGroup: true },
//     ]);
//     setCurrentConversation({ id: 1, name: 'John Doe' });
//   }, []);

//   // Mock messages for display
//   useEffect(() => {
//     if (currentConversation) {
//       setMessages([
//         { id: 1, sender: { id: 2, name: 'John Doe' }, text: 'Hey there!', timestamp: new Date(Date.now() - 3600000) },
//         { id: 2, sender: { id: 1, name: 'You' }, text: 'Hi! How are you?', timestamp: new Date(Date.now() - 3500000) },
//         { id: 3, sender: { id: 2, name: 'John Doe' }, text: 'I\'m good, thanks for asking. How about you?', timestamp: new Date(Date.now() - 3400000) },
//         { id: 4, sender: { id: 2, name: 'John Doe' }, type: 'image', media: '/api/placeholder/400/300', text: 'Check out this photo!', timestamp: new Date(Date.now() - 3000000) },
//       ]);
//     }
//   }, [currentConversation]);

//   useEffect(() => {
//     // Socket events for receiving messages
//     socket.on('receiveMessage', (message) => {
//       if (message.sender.id !== user.id) {
//         setMessages((prevMessages) => {
//           const messageExists = prevMessages.some(msg => msg.id === message.id);
//           if (!messageExists) {
//             return [...prevMessages, message];
//           }
//           return prevMessages;
//         });
//       }
//     });

//     socket.on('userTyping', ({ userId, username, isTyping }) => {
//       if (userId !== user.id) {
//         setTypingUsers(prev => {
//           if (isTyping && !prev.some(u => u.id === userId)) {
//             return [...prev, { id: userId, name: username }];
//           } else if (!isTyping) {
//             return prev.filter(u => u.id !== userId);
//           }
//           return prev;
//         });
//       }
//     });

//     return () => {
//       socket.off('receiveMessage');
//       socket.off('userTyping');
//     };
//   }, [user.id]);

//   useEffect(() => {
//     // Scroll to bottom of messages
//     scrollToBottom();
//   }, [messages]);

//   // Cleanup recording resources when component unmounts
//   useEffect(() => {
//     return () => {
//       if (recordingIntervalRef.current) {
//         clearInterval(recordingIntervalRef.current);
//       }
//       if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//         mediaRecorderRef.current.stop();
//       }
//     };
//   }, []);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   // Typing indicator logic
//   const handleInputChange = (e) => {
//     setNewMessage(e.target.value);
    
//     // Emit typing event
//     socket.emit('typing', {
//       conversationId: currentConversation.id,
//       userId: user.id,
//       username: user.name,
//       isTyping: e.target.value.length > 0
//     });
//   };

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if ((!newMessage.trim() && !mediaPreview) || !connected) return;

//     const message = {
//       id: Date.now(),
//       sender: { id: user.id, name: user.name },
//       text: newMessage,
//       timestamp: new Date(),
//       conversationId: currentConversation.id,
//     };

//     // Add media type if present
//     if (mediaPreview) {
//       message.type = mediaPreview.type.split('/')[0]; // 'image', 'audio', or 'video'
//       message.media = mediaPreview.preview;
//     }

//     // Optimistically add message to state
//     setMessages((prevMessages) => [...prevMessages, message]);
    
//     // Emit message to server
//     socket.emit('sendMessage', message);
    
//     // Reset state
//     setNewMessage('');
//     setMediaPreview(null);
    
//     // Reset typing indicator
//     socket.emit('typing', {
//       conversationId: currentConversation.id,
//       userId: user.id,
//       username: user.name,
//       isTyping: false
//     });
//   };

//   const formatTime = (date) => {
//     return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const formatRecordingTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const handleMediaClick = (type) => {
//     fileInputRef.current.setAttribute('accept', type === 'image' ? 'image/*' : 'video/*');
//     fileInputRef.current.click();
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const fileType = file.type.split('/')[0]; // 'image' or 'video'
//       const reader = new FileReader();
      
//       reader.onload = (event) => {
//         setMediaPreview({
//           type: file.type,
//           preview: event.target.result,
//           name: file.name
//         });
//       };
      
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleMicClick = async () => {
//     if (!isRecording) {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         mediaRecorderRef.current = new MediaRecorder(stream);
//         audioChunksRef.current = [];
        
//         mediaRecorderRef.current.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunksRef.current.push(event.data);
//           }
//         };
        
//         mediaRecorderRef.current.onstop = () => {
//           const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
//           const audioUrl = URL.createObjectURL(audioBlob);
          
//           setMediaPreview({
//             type: 'audio/mp3',
//             preview: audioUrl,
//             name: `Recording_${new Date().toISOString()}`
//           });
          
//           // Stop all tracks
//           stream.getTracks().forEach(track => track.stop());
          
//           // Reset recording time and clear interval
//           clearInterval(recordingIntervalRef.current);
//           setRecordingTime(0);
//         };
        
//         // Start recording
//         mediaRecorderRef.current.start();
//         setIsRecording(true);
        
//         // Start timer
//         recordingIntervalRef.current = setInterval(() => {
//           setRecordingTime(prevTime => prevTime + 1);
//         }, 1000);
        
//       } catch (error) {
//         console.error('Error accessing microphone:', error);
//       }
//     } else {
//       // Stop recording
//       if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//         mediaRecorderRef.current.stop();
//         setIsRecording(false);
//       }
//     }
//   };

//   const cancelMediaPreview = () => {
//     setMediaPreview(null);
//   };

//   // Message rendering based on type
//   const renderMessage = (message) => {
//     return (
//       <div className="relative">
//         {message.sender.id !== user.id && (
//           <div className="font-medium text-xs mb-1 text-gray-500 dark:text-gray-300">
//             {message.sender.name}
//           </div>
//         )}
        
//         {message.text && <div className="mb-2">{message.text}</div>}
        
//         {message.type === 'image' && (
//           <motion.img 
//             src={message.media} 
//             alt="Shared image" 
//             className="rounded-md max-w-full max-h-60 object-contain mb-2"
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.3 }}
//           />
//         )}
        
//         {message.type === 'video' && (
//           <motion.video 
//             src={message.media} 
//             controls 
//             className="rounded-md max-w-full max-h-60 mb-2"
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.3 }}
//           />
//         )}
        
//         {message.type === 'audio' && (
//           <motion.audio 
//             src={message.media} 
//             controls 
//             className="w-full mb-2"
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.3 }}
//           />
//         )}
        
//         <div className={`text-xs mt-1 text-right ${
//           message.sender.id === user.id
//             ? 'text-blue-200'
//             : 'text-gray-500 dark:text-gray-400'
//         }`}>
//           {formatTime(message.timestamp)}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex h-screen bg-white dark:bg-blue-900">
//       {/* Sidebar */}
//       <AnimatePresence>
//         {sidebarOpen && (
//           <motion.div
//             initial={{ x: -300 }}
//             animate={{ x: 0 }}
//             exit={{ x: -300 }}
//             transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//             className="w-80 bg-white dark:bg-blue-800 border-r border-gray-200 dark:border-blue-700 flex flex-col"
//           >
//             <div className="p-4 border-b border-gray-200 dark:border-blue-700 flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 <MessageCircle className="h-6 w-6 text-blue-600 dark:text-white" />
//                 <h1 className="font-bold text-xl text-gray-900 dark:text-white">ChatApp</h1>
//               </div>
//               <button 
//                 onClick={() => setSidebarOpen(false)}
//                 className="text-gray-500 dark:text-gray-300 md:hidden"
//               >
//                 <Menu size={20} />
//               </button>
//             </div>
            
//             <div className="flex-1 overflow-y-auto">
//               <div className="p-2">
//                 <div className="text-sm font-medium text-gray-500 dark:text-gray-400 px-3 py-2">
//                   Conversations
//                 </div>
//                 {conversations.map((conv) => (
//                   <button
//                     key={conv.id}
//                     onClick={() => setCurrentConversation(conv)}
//                     className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
//                       currentConversation?.id === conv.id
//                         ? 'bg-blue-100 dark:bg-blue-700'
//                         : 'hover:bg-gray-100 dark:hover:bg-blue-700/50'
//                     }`}
//                   >
//                     <div className="flex items-center space-x-3">
//                       <div className="relative">
//                         {conv.isGroup ? (
//                           <Users className="h-10 w-10 text-blue-500 dark:text-blue-300 p-2 bg-blue-100 dark:bg-blue-800 rounded-full" />
//                         ) : (
//                           <div className="h-10 w-10 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white font-medium">
//                             {conv.name.substring(0, 2)}
//                           </div>
//                         )}
//                         {connected && (
//                           <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-blue-800"></span>
//                         )}
//                       </div>
//                       <div>
//                         <div className="font-medium text-gray-900 dark:text-white">
//                           {conv.name}
//                         </div>
//                         <div className="text-sm text-gray-500 dark:text-gray-300 truncate w-40">
//                           {conv.lastMessage}
//                         </div>
//                       </div>
//                     </div>
//                     {conv.unread > 0 && (
//                       <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
//                         {conv.unread}
//                       </span>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="p-4 border-t border-gray-200 dark:border-blue-700">
//               <Link
//                 to="/settings"
//                 className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-white"
//               >
//                 <Settings size={20} />
//                 <span>Settings</span>
//               </Link>
//               <button className="mt-4 flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-white">
//                 <LogOut size={20} />
//                 <span>Sign out</span>
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Main chat area */}
//       <div className="flex-1 flex flex-col">
//         <div className="border-b border-gray-200 dark:border-blue-700 p-4 flex items-center justify-between">
//           {!sidebarOpen && (
//             <button 
//               onClick={() => setSidebarOpen(true)} 
//               className="mr-4 text-gray-500 dark:text-gray-300"
//             >
//               <Menu size={20} />
//             </button>
//           )}
          
//           {currentConversation && (
//             <div className="flex items-center">
//               <div className="font-medium text-lg text-gray-900 dark:text-white">
//                 {currentConversation.name}
//               </div>
//               {connected && (
//                 <span className="ml-2 text-sm text-green-500">online</span>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-blue-900">
//           {!connected && (
//             <div className="text-center py-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
//               You are currently offline. Messages will be sent when you reconnect.
//             </div>
//           )}
          
//           {messages.map((message) => (
//             <div 
//               key={message.id} 
//               className={`flex ${message.sender.id === user.id ? 'justify-end' : 'justify-start'}`}
//             >
//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${
//                   message.sender.id === user.id
//                     ? 'bg-blue-600 text-white rounded-br-none'
//                     : 'bg-white dark:bg-blue-800 text-gray-900 dark:text-white rounded-bl-none'
//                 }`}
//               >
//                 {renderMessage(message)}
//               </motion.div>
//             </div>
//           ))}
          
//           {/* Typing indicator */}
//           <AnimatePresence>
//             {typingUsers.length > 0 && (
//               <motion.div 
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: 10 }}
//                 className="flex justify-start"
//               >
//                 <div className="bg-white dark:bg-blue-800 p-3 rounded-lg text-gray-900 dark:text-white rounded-bl-none">
//                   <div className="flex items-center space-x-2">
//                     <div className="flex space-x-1">
//                       <motion.div 
//                         animate={{ y: [0, -5, 0] }} 
//                         transition={{ repeat: Infinity, duration: 1, delay: 0 }}
//                         className="h-2 w-2 bg-gray-500 dark:bg-gray-300 rounded-full"
//                       />
//                       <motion.div 
//                         animate={{ y: [0, -5, 0] }} 
//                         transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
//                         className="h-2 w-2 bg-gray-500 dark:bg-gray-300 rounded-full"
//                       />
//                       <motion.div 
//                         animate={{ y: [0, -5, 0] }} 
//                         transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
//                         className="h-2 w-2 bg-gray-500 dark:bg-gray-300 rounded-full"
//                       />
//                     </div>
//                     <span className="text-xs text-gray-500 dark:text-gray-300">
//                       {typingUsers.length === 1 
//                         ? `${typingUsers[0].name} is typing...` 
//                         : `${typingUsers.length} people are typing...`}
//                     </span>
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
          
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Preview section for media */}
//         <AnimatePresence>
//           {mediaPreview && (
//             <motion.div 
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               exit={{ opacity: 0, height: 0 }}
//               className="p-4 border-t border-gray-200 dark:border-blue-700 bg-gray-50 dark:bg-blue-900 flex items-center"
//             >
//               <div className="relative flex-1 flex items-center space-x-3">
//                 {mediaPreview.type.startsWith('image') && (
//                   <img src={mediaPreview.preview} alt="Preview" className="h-16 rounded" />
//                 )}
//                 {mediaPreview.type.startsWith('video') && (
//                   <video src={mediaPreview.preview} className="h-16 rounded" />
//                 )}
//                 {mediaPreview.type.startsWith('audio') && (
//                   <div className="flex items-center bg-blue-100 dark:bg-blue-800 p-2 rounded">
//                     <Mic size={24} className="text-blue-600 dark:text-blue-300 mr-2" />
//                     <span className="text-gray-900 dark:text-white">Audio recording</span>
//                   </div>
//                 )}
//                 <span className="text-sm text-gray-600 dark:text-gray-300 flex-1 truncate">
//                   {mediaPreview.name}
//                 </span>
//                 <button 
//                   onClick={cancelMediaPreview}
//                   className="text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Recording indicator */}
//         <AnimatePresence>
//           {isRecording && (
//             <motion.div 
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               exit={{ opacity: 0, height: 0 }}
//               className="p-4 border-t border-gray-200 dark:border-blue-700 bg-red-50 dark:bg-red-900/20 flex items-center justify-between"
//             >
//               <div className="flex items-center">
//                 <motion.div
//                   animate={{ scale: [1, 1.2, 1] }}
//                   transition={{ repeat: Infinity, duration: 1.5 }}
//                   className="h-3 w-3 bg-red-500 rounded-full mr-3"
//                 />
//                 <span className="text-red-600 dark:text-red-400">Recording audio...</span>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <span className="text-gray-600 dark:text-gray-300">{formatRecordingTime(recordingTime)}</span>
//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={handleMicClick}
//                   className="p-1 rounded-full bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400"
//                 >
//                   <PauseCircle size={24} />
//                 </motion.button>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Message input */}
//         <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-blue-700 p-4 bg-white dark:bg-blue-800">
//           <div className="flex items-center space-x-2">
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               className="hidden"
//             />
            
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               type="button"
//               onClick={() => handleMediaClick('image')}
//               className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700 rounded-full"
//             >
//               <Image size={20} />
//             </motion.button>
            
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               type="button"
//               onClick={() => handleMediaClick('video')}
//               className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700 rounded-full"
//             >
//               <Video size={20} />
//             </motion.button>
            
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               type="button"
//               onClick={handleMicClick}
//               className={`p-2 rounded-full ${
//                 isRecording 
//                   ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30' 
//                   : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700'
//               }`}
//             >
//               <Mic size={20} />
//             </motion.button>
            
//             <input
//               type="text"
//               value={newMessage}
//               onChange={handleInputChange}
//               placeholder="Type a message..."
//               disabled={isRecording}
//               className="flex-1 border border-gray-300 dark:border-blue-700 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-blue-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-blue-950 disabled:cursor-not-allowed"
//             />
            
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               type="submit"
//               disabled={(!newMessage.trim() && !mediaPreview) || !connected}
//               className={`p-2 rounded-full ${
//                 (!newMessage.trim() && !mediaPreview) || !connected
//                   ? 'bg-blue-400 cursor-not-allowed'
//                   : 'bg-blue-600 hover:bg-blue-700'
//               } text-white`}
//             >
//               <Send size={20} />
//             </motion.button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Chat;