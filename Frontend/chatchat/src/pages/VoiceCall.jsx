// import React, { useEffect, useRef, useState } from "react";
// import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { socket } from "../socket";

// const VoiceCallComponent = ({ user, currentConversation,conversationId, connected }) => {
//   // console.log(user, currentConversation, conversationId, connected);  
  // const [callStatus, setCallStatus] = useState("idle"); // idle, calling, incoming, active
  // const [callerId, setCallerId] = useState(null);
  // const [callerName, setCallerName] = useState(null);
  // const [isMuted, setIsMuted] = useState(false);
  // const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  // const [callDuration, setCallDuration] = useState(0);
  // const [incomingCall, setIncomingCall] = useState({});

  // const localStreamRef = useRef(null);
  // const remoteStreamRef = useRef(null);
  // const peerConnection = useRef(null);
  // const localStream = useRef(null);
  // const callTimerRef = useRef(null);

//   const config = {
//     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//   };

// //   // Set up socket listeners
//   useEffect(() => {
//     // Listen for incoming calls


//     console.log("Socket ID from useEffect :", socket.id);
//     socket.on("incomingCall", ({ from, fromName, offer }) => {
//       // console.log("Can play MP3:", audio.canPlayType("audio/mpeg"));
//       // console.log("Can play OGG:", audio.canPlayType("audio/ogg"));

//       console.log("📞 Incoming call from:", fromName);
//       setCallerId(from);
//       setCallerName(fromName);
//       setIncomingCall({ offer });
//       setCallStatus("incoming");
      
//       // Play ring tone
//       // const audio = new Audio("jai_raghuvansi.mp3"); // You'll need to add this file
//       // audio.loop = true;
//       // audio.load();
//       // audio.play().catch(e => console.error("Couldn't play ringtone:", e));
      
//       // Auto-reject call after 30 seconds if not answered
//       const timeoutId = setTimeout(() => {
//         if (callStatus === "incoming") {
//           rejectCall();
//           // audio.pause();
//         }
//       }, 30000);
      
//       return () => {
//         clearTimeout(timeoutId);
//         // audio.pause();
//       };
//     });

//     // Listen for call accepted
//     socket.on("callAccepted", ({ answer }) => {
//       console.log("✅ Call accepted");
//       if (peerConnection.current) {
//         peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer))
//           .then(() => {
//             setCallStatus("active");
//             startCallTimer();
//           })
//           .catch(err => console.error("Error setting remote description:", err));
//       }
//     });

//     // Listen for call rejected
//     socket.on("callRejected", () => {
//       console.log("❌ Call rejected");
//       endCall("rejected");
//     });

//     // Listen for call ended
//     socket.on("callEnded", () => {
//       console.log("📴 Call ended by remote user");
//       endCall("ended");
//     });

//     // Listen for ICE candidates
//     socket.on("iceCandidate", ({ candidate }) => {
//       console.log("❄️ Received ICE candidate");
//       console.log(candidate)
//       if (peerConnection.current) {
//         peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
//           .catch(err => console.error("Error adding ICE candidate:", err));
//       }
//     });

//     return () => {
//       socket.off("incomingCall");
//       socket.off("callAccepted");
//       socket.off("callRejected");
//       socket.off("callEnded");
//       socket.off("iceCandidate");
//       endCall();
//     };
//   }, [socket]);

//   // Create peer connection
  // const createPeerConnection = (targetId) => {
  //   const pc = new RTCPeerConnection(config);

  //   // Add local tracks to the connection
  //   if (localStream.current) {
  //     localStream.current.getTracks().forEach((track) => {
  //       pc.addTrack(track, localStream.current);
  //     });
  //   }

  //   // Handle remote tracks
  //   pc.ontrack = (event) => {
  //     console.log("📡 Received remote track");
  //     if (remoteStreamRef.current ) {
  //       remoteStreamRef.current.srcObject = event.streams[0];
  //     }
  //   };

  //   // Handle ICE candidates
  //   pc.onicecandidate = (event) => {
  //     if (event.candidate) {
  //       console.log("📨 Sending ICE candidate");
  //       socket.emit("iceCandidate", {
  //         to: targetId,
  //         candidate: event.candidate,
  //       });
  //     }
  //   };

  //   // Monitor connection state
  //   pc.onconnectionstatechange = () => {
  //     console.log("🔄 Connection State:", pc.connectionState);
  //     if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
  //       endCall("connection_lost");
  //     }
  //   };

  //   return pc;
  // };

//   // Start a call
  // const startCall = async () => {
  //   if (!currentConversation || !connected) return;
  //   console.log(currentConversation)
  //   try {
  //     // Get user's audio
  //     localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
  //     // Set local audio element
  //     if (localStreamRef.current) {
  //       localStreamRef.current.srcObject = localStream.current;
  //     }
      
  //     // Set call status to calling
  //     setCallStatus("calling");
  //     setCallerId(currentConversation._id);
      
  //     // Create peer connection
     
  //     peerConnection.current = createPeerConnection(currentConversation._id);
      
  //     // Create offer
  //     const offer = await peerConnection.current.createOffer();
  //     await peerConnection.current.setLocalDescription(offer);
      
  //     console.log("📤 Calling user:", currentConversation._id);
  //     // Send call request
  //     socket.emit("callUser", {
  //       to: currentConversation._id,
  //       from: user._id,
  //       fromName: user.fullname,
  //       offer,
  //     });
      
  //     // Play outgoing call sound
  //     // const audio = new Audio("/sounds/outgoing.mp3"); // You'll need to add this file
  //     // audio.loop = true;
  //     // audio.play().catch(e => console.error("Couldn't play outgoing call sound:", e));
      
  //     // Auto-cancel call after 30 seconds if not answered
  //     const timeoutId = setTimeout(() => {
  //       if (callStatus === "calling") {
  //         endCall("unanswered");
  //         // audio.pause();
  //       }
  //     }, 30000);
      
  //     return () => {
  //       clearTimeout(timeoutId);
  //       // audio.pause();
  //     };
  //   } catch (err) {
  //     console.error("Error starting call:", err);
  //     setCallStatus("idle");
  //   }
  // };

  // // Answer an incoming call
  // const answerCall = async () => {
  //   try {
  //     // Get user's audio
  //     localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
  //     // Set local audio element
  //     if (localStreamRef.current) {
  //       localStreamRef.current.srcObject = localStream.current;
  //     }
      
  //     // Create peer connection
  //     peerConnection.current = createPeerConnection(callerId);
      
  //     // Set the remote description from the offer
  //     const remoteDesc = new RTCSessionDescription(incomingCall.offer);
  //     await peerConnection.current.setRemoteDescription(remoteDesc);
      
  //     // Create answer
  //     const answer = await peerConnection.current.createAnswer();
  //     await peerConnection.current.setLocalDescription(answer);
      
  //     // Send call acceptance
  //     socket.emit("answerCall", {
  //       to: callerId,
  //       answer,
  //     });
      
  //     // Set call as active and start timer
  //     setCallStatus("active");
  //     startCallTimer();
  //   } catch (err) {
  //     console.error("Error answering call:", err);
  //     rejectCall();
  //   }
  // };

//   // Reject an incoming call
  // const rejectCall = () => {
  //   socket.emit("rejectCall", {
  //     to: callerId,
  //   });
    
  //   setCallStatus("idle");
  //   setCallerId(null);
  //   setCallerName(null);
  // };

//   // End an active call
  // const endCall = (reason = "ended") => {
  //   // Stop the timer
  //   if (callTimerRef.current) {
  //     clearInterval(callTimerRef.current);
  //     callTimerRef.current = null;
  //   }
    
  //   // Close peer connection
  //   if (peerConnection.current) {
  //     peerConnection.current.close();
  //     peerConnection.current = null;
  //   }
    
  //   // Stop all tracks in local stream
  //   if (localStream.current) {
  //     localStream.current.getTracks().forEach(track => track.stop());
  //     localStream.current = null;
  //   }
    
  //   // Clear audio elements
  //   if (localStreamRef.current) {
  //     localStreamRef.current.srcObject = null;
  //   }
  //   if (remoteStreamRef.current) {
  //     remoteStreamRef.current.srcObject = null;
  //   }
    
  //   // Notify the other user if we're ending the call
  //   if (callStatus === "active" || callStatus === "calling") {
  //     socket.emit("endCall", {
  //       to: callerId,
  //     });
  //   }
    
  //   // Reset state
  //   setCallStatus("idle");
  //   setCallerId(null);
  //   setCallerName(null);
  //   setCallDuration(0);
  //   setIsMuted(false);
  //   setIsSpeakerOn(true);
  // };

  // // Toggle mute status
  // const toggleMute = () => {
  //   if (localStream.current) {
  //     const audioTracks = localStream.current.getAudioTracks();
  //     audioTracks.forEach(track => {
  //       track.enabled = !track.enabled;
  //     });
  //     setIsMuted(!isMuted);
  //   }
  // };

  // // Toggle speaker status (in a real app, this would control audio output device)
  // const toggleSpeaker = () => {
  //   setIsSpeakerOn(!isSpeakerOn);
  //   // In a real app, you would use the Audio Output Devices API
  //   // This is just a UI placeholder
  // };

//   // Start call timer
  // const startCallTimer = () => {
  //   if (callTimerRef.current) clearInterval(callTimerRef.current);
    
  //   const startTime = Date.now();
  //   callTimerRef.current = setInterval(() => {
  //     const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  //     setCallDuration(elapsedSeconds);
  //   }, 1000);
  // };

//   // Format call duration
  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

//   localStream?.current?.getAudioTracks().forEach(track => {
//     console.log("Local track enabled:", track.enabled);
//   });
  

  // return (
  //   <>
  //     {/* Call Button */}
  //     {callStatus === "idle" && currentConversation && (
  //       <button
  //         onClick={startCall}
  //         disabled={!connected}
  //         className={`p-2 mr-2 rounded-full ${
  //           connected 
  //             ? 'bg-green-500 hover:bg-green-600 text-white' 
  //             : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  //         }`}
  //         title="Start voice call"
  //       >
  //         <PhoneCall size={18} />
  //       </button>
  //     )}

  //     {/* Incoming Call Dialog */}
  //     <AnimatePresence>
  //       {callStatus === "incoming" && (
  //         <motion.div
  //           initial={{ opacity: 0, y: 50 }}
  //           animate={{ opacity: 1, y: 0 }}
  //           exit={{ opacity: 0, y: 50 }}
  //           className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-sm p-4 mb-4 rounded-lg shadow-lg bg-blue-800 text-white"
  //         >
  //           <div className="flex flex-col items-center">
  //             <div className="mb-3 text-center">
  //               <motion.div
  //                 animate={{ scale: [1, 1.2, 1] }}
  //                 transition={{ repeat: Infinity, duration: 1.5 }}
  //                 className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-2"
  //               >
  //                 <Phone size={32} />
  //               </motion.div>
  //               <h3 className="text-xl font-semibold">{callerName || "Someone"} is calling</h3>
  //               <p className="text-sm text-blue-200">Incoming voice call</p>
  //             </div>
              
  //             <div className="flex gap-4 w-full">
  //               <button
  //                 onClick={rejectCall}
  //                 className="flex-1 bg-red-600 hover:bg-red-700 rounded-full py-3 flex items-center justify-center"
  //               >
  //                 <PhoneOff size={20} className="mr-2" />
  //                 <span>Decline</span>
  //               </button>
                
  //               <button
  //                 onClick={answerCall}
  //                 className="flex-1 bg-green-600 hover:bg-green-700 rounded-full py-3 flex items-center justify-center"
  //               >
  //                 <Phone size={20} className="mr-2" />
  //                 <span>Answer</span>
  //               </button>
  //             </div>
  //           </div>
  //         </motion.div>
  //       )}
  //     </AnimatePresence>

  //     {/* Outgoing Call Dialog */}
  //     <AnimatePresence>
  //       {callStatus === "calling" && (
  //         <motion.div
  //           initial={{ opacity: 0, y: 50 }}
  //           animate={{ opacity: 1, y: 0 }}
  //           exit={{ opacity: 0, y: 50 }}
  //           className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-sm p-4 mb-4 rounded-lg shadow-lg bg-blue-800 text-white"
  //         >
  //           <div className="flex flex-col items-center">
  //             <div className="mb-3 text-center">
  //               <motion.div
  //                 animate={{ scale: [1, 1.2, 1] }}
  //                 transition={{ repeat: Infinity, duration: 1.5 }}
  //                 className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-2"
  //               >
  //                 <Phone size={32} />
  //               </motion.div>
  //               <h3 className="text-xl font-semibold">Calling {currentConversation?.name}...</h3>
  //               <p className="text-sm text-blue-200">Outgoing voice call</p>
  //             </div>
              
  //             <button
  //               onClick={() => endCall("cancelled")}
  //               className="w-full bg-red-600 hover:bg-red-700 rounded-full py-3 flex items-center justify-center"
  //             >
  //               <PhoneOff size={20} className="mr-2" />
  //               <span>Cancel</span>
  //             </button>
  //           </div>
  //         </motion.div>
  //       )}
  //     </AnimatePresence>

  //     {/* Active Call Interface */}
  //     <AnimatePresence>
  //       {callStatus === "active" && (
  //         <motion.div
  //           initial={{ opacity: 0, y: 50 }}
  //           animate={{ opacity: 1, y: 0 }}
  //           exit={{ opacity: 0, y: 50 }}
  //           className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-sm p-4 mb-4 rounded-lg shadow-lg bg-blue-900 text-white"
  //         >
  //           <div className="flex flex-col items-center">
  //             <div className="mb-3 text-center">
  //               <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
  //                 <Phone size={32} />
  //               </div>
  //               <h3 className="text-xl font-semibold">{callerName || currentConversation?.name}</h3>
  //               <p className="text-sm text-blue-200">{formatCallDuration(callDuration)}</p>
  //             </div>
              
  //             {/* Call Controls */}
  //             <div className="flex justify-around w-full mb-4">
  //               <button
  //                 onClick={toggleMute}
  //                 className={`p-3 rounded-full ${
  //                   isMuted ? 'bg-red-500' : 'bg-blue-700 hover:bg-blue-600'
  //                 }`}
  //               >
  //                 {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
  //               </button>
                
  //               <button
  //                 onClick={toggleSpeaker}
  //                 className={`p-3 rounded-full ${
  //                   isSpeakerOn ? 'bg-blue-700 hover:bg-blue-600' : 'bg-red-500'
  //                 }`}
  //               >
  //                 {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
  //               </button>
  //             </div>
              
  //             <button
  //               onClick={() => endCall("ended")}
  //               className="w-full bg-red-600 hover:bg-red-700 rounded-full py-3 flex items-center justify-center"
  //             >
  //               <PhoneOff size={20} className="mr-2" />
  //               <span>End Call</span>
  //             </button>
  //           </div>
            
  //           {/* Hidden audio elements */}
  //           <audio ref={localStreamRef} autoPlay muted className="hidden" />
  //           <audio ref={remoteStreamRef} autoPlay className="hidden" />
  //           {/* <audio ref={localStreamRef} autoPlay muted />
  //           <span>This is audio</span>
  //           <audio ref={remoteStreamRef} autoPlay /> */}
  //         </motion.div>
  //       )}
  //     </AnimatePresence>
  //   </>
  // );
// };

// export default VoiceCallComponent;

import React, { useEffect, useRef, useState } from "react";
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "../socket";


const VoiceCallComponent = ({ user, currentConversation,conversationId, connected }) => {
  const [myId, setMyId] = useState("");
  const [targetId, setTargetId] = useState(currentConversation.id);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);

  
  const [callStatus, setCallStatus] = useState("idle"); // idle, calling, incoming, active
  const [callerId, setCallerId] = useState(null);
  const [callerName, setCallerName] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const callTimerRef = useRef(null);


  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

    // Toggle mute status
    const toggleMute = () => {
      if (localStream.current) {
        const audioTracks = localStream.current.getAudioTracks();
        audioTracks.forEach(track => {
          track.enabled = !track.enabled;
        });
        setIsMuted(!isMuted);
      }
    };
  
    // Toggle speaker status (in a real app, this would control audio output device)
    const toggleSpeaker = () => {
      setIsSpeakerOn(!isSpeakerOn);
      // In a real app, you would use the Audio Output Devices API
      // This is just a UI placeholder
    };

    const rejectCall = () => {
      socket.emit("rejectCall", {
        to: callerId,
      });
      
      setCallStatus("idle");
      setCallerId(null);
      setCallerName(null);
    };
  

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  useEffect(() => {

    socket.on("connect", () => {
      console.log("🔗 Connected to socket server with ID:", socket.id);
      setMyId(socket.id);

      // ✅ Register your userId (can be dynamic later, hardcoded for now)
      const userId = socket.id;
      socket.emit("registerUser", { userId : user._id });
    });

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      localStream.current = stream;
      if (localStreamRef.current) {
        localStreamRef.current.srcObject = stream;
      }
    });

    // socket.on("incomingCall", ({ from, offer }) => {
    //   console.log("📞 Incoming call from:", from);
    //   setIncomingCall({ from, offer });
    // });
  
    socket.on("incomingCall", ({ from, fromName, offer }) => {
      // console.log("Can play MP3:", audio.canPlayType("audio/mpeg"));
      // console.log("Can play OGG:", audio.canPlayType("audio/ogg"));

      console.log("📞 Incoming call from:", fromName);
      setCallerId(from);
      setCallerName(fromName);
      setIncomingCall({ offer, from  });
      setCallStatus("incoming");
      
      // Play ring tone
      // const audio = new Audio("jai_raghuvansi.mp3"); // You'll need to add this file
      // audio.loop = true;
      // audio.load();
      // audio.play().catch(e => console.error("Couldn't play ringtone:", e));
      
      // Auto-reject call after 30 seconds if not answered
      const timeoutId = setTimeout(() => {
        if (callStatus === "incoming") {
          console.log('30000 seconds completed.')
          // rejectCall();
          // audio.pause();
        }
      }, 30000);
      
      return () => {
        clearTimeout(timeoutId);
        // audio.pause();
      };
    });

    // socket.on("callAccepted", ({ answer }) => {
    //   console.log("✅ Call accepted");
    //   peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    //   setCallActive(true);
    // });

    socket.on("callAccepted", ({ answer }) => {
      console.log("✅ Call accepted");
      if (peerConnection.current) {
        peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer))
          .then(() => {
            setCallStatus("active");
            startCallTimer();
          })
          .catch(err => console.error("Error setting remote description:", err));

          setCallActive(true);
      }
    });

   
    socket.on("iceCandidate", ({ candidate }) => {
      console.log("❄️ Received ICE candidate");
      if (peerConnection.current) {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
          .catch(err => console.error("Error adding ICE candidate:", err));
      }
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callRejected");
      socket.off("callEnded");
      socket.off("iceCandidate");
      endCall();
    };
    // return () => {
    //   if (socket) {
    //     socket.disconnect();
    //     socket = null;
    //   }
    // };
  }, []);


  const startCallTimer = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    
    const startTime = Date.now();
    callTimerRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setCallDuration(elapsedSeconds);
    }, 1000);
  };

  const createPeerConnection = (targetId) => {
    const pc = new RTCPeerConnection(config);


      localStream.current?.getTracks()?.forEach((track) => {
        pc.addTrack(track, localStream.current);
      });
    

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log("📡 Received remote track");
      if (remoteStreamRef.current ) {
        remoteStreamRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("📨 Sending ICE candidate");
        socket.emit("iceCandidate", {
          to: targetId,
          candidate: event.candidate,
        });
      }
    };

    // Monitor connection state
    pc.onconnectionstatechange = () => {
      console.log("🔄 Connection State:", pc.connectionState);
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        endCall("connection_lost");
      }
    };

    return pc;
  };

  const createPeerConnection1 = (targetSocketId) => {
    const pc = new RTCPeerConnection(config);

    localStream.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.current);
    });

    pc.ontrack = (event) => {
      if (remoteStreamRef.current) {
        remoteStreamRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          to: targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("🔄 Connection State:", pc.connectionState);
    };

    return pc;
  };

  const callUser1 = async () => {
    console.log("📤 Calling user:", targetId);
    peerConnection.current = createPeerConnection(targetId);
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("callUser", {
      to: targetId,
      from: user._id,
      offer,
    });
  };

  const answerCall1 = async () => {
    peerConnection.current = createPeerConnection(incomingCall.from);
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.emit("answerCall", {
      to: incomingCall.from,
      answer,
    });

    setIncomingCall(null);
    setCallActive(true);
  };


  //startCall bhi h ye
  
  const startCall = async () => {
    if (!currentConversation || !connected) return;
    console.log(currentConversation)

    try {
      // Get user's audio
      // localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set local audio element
      if (localStreamRef.current) {
        localStreamRef.current.srcObject = localStream.current;
      }
      
      // Set call status to calling
      setCallStatus("calling");
      setCallerId(currentConversation._id);
      
      // Create peer connection
      peerConnection.current = createPeerConnection(targetId);
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      
      console.log("📤 Calling user:", currentConversation._id);
      // Send call request
      socket.emit("callUser", {
        to: targetId,
        from: user._id,
        fromName: user.fullname,
        offer,
      });
      
      // Play outgoing call sound
      // const audio = new Audio("/sounds/outgoing.mp3"); // You'll need to add this file
      // audio.loop = true;
      // audio.play().catch(e => console.error("Couldn't play outgoing call sound:", e));
      
      // Auto-cancel call after 30 seconds if not answered
      const timeoutId = setTimeout(() => {
        if (callStatus === "calling") {
          endCall("unanswered");
          // audio.pause();
        }
      }, 30000);
      
      return () => {
        clearTimeout(timeoutId);
        // audio.pause();
      };
    } catch (err) {
      console.error("Error starting call:", err);
      setCallStatus("idle");
    }
  };
  const callUser = async () => {
    if (!currentConversation || !connected) return;
    console.log(currentConversation)

    try {
      // Get user's audio
      // localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set local audio element
      if (localStreamRef.current) {
        localStreamRef.current.srcObject = localStream.current;
      }
      
      // Set call status to calling
      setCallStatus("calling");
      setCallerId(currentConversation._id);
      
      // Create peer connection
      peerConnection.current = createPeerConnection(targetId);
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      
      console.log("📤 Calling user:", currentConversation._id);
      // Send call request
      socket.emit("callUser", {
        to: targetId,
        from: user._id,
        fromName: user.fullname,
        offer,
      });
      
      // Play outgoing call sound
      // const audio = new Audio("/sounds/outgoing.mp3"); // You'll need to add this file
      // audio.loop = true;
      // audio.play().catch(e => console.error("Couldn't play outgoing call sound:", e));
      
      // Auto-cancel call after 30 seconds if not answered
      const timeoutId = setTimeout(() => {
        if (callStatus === "calling") {
          endCall("unanswered");
          // audio.pause();
        }
      }, 30000);
      
      return () => {
        clearTimeout(timeoutId);
        // audio.pause();
      };
    } catch (err) {
      console.error("Error starting call:", err);
      setCallStatus("idle");
    }
  };

  // Answer an incoming call
  const answerCall = async () => {

    console.log("Entered in answerCall")
    try {
      // Get user's audio
      // localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set local audio element
      if (localStreamRef.current) {
        localStreamRef.current.srcObject = localStream.current;
      }
      
      // Create peer connection

      peerConnection.current = createPeerConnection(incomingCall.from);
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
  
      
      // Send call acceptance
      socket.emit("answerCall", {
        to: incomingCall.from,
        answer,
      });
      
      console.log("Entered in AnswerCall and sended Request........")
      setIncomingCall(null);
      setCallActive(true);
      // Set call as active and start timer
      setCallStatus("active");
      startCallTimer();
    } catch (err) {
      console.error("Error answering call:", err);
      rejectCall();
    }
  };


  // yaha se reh gaya h cheak krna

  const endCall1 = () => {
    console.log("📴 Ending call");
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.srcObject = null;
    }
    setCallActive(false);
    setIncomingCall(null);
  };

  const endCall = (reason = "ended") => {
    // Stop the timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    // Stop all tracks in local stream
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    
    // Clear audio elements
    if (localStreamRef.current) {
      localStreamRef.current.srcObject = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.srcObject = null;
    }
    setCallActive(false);
    setIncomingCall(null);
    
    // Notify the other user if we're ending the call
    if (callStatus === "active" || callStatus === "calling") {
      socket.emit("endCall", {
        to: callerId,
      });
    }
    
    // Reset state
    setCallStatus("idle");
    setCallerId(null);
    setCallerName(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeakerOn(true);
  };
  return (
   
<>
        {callStatus === "idle" && currentConversation && (
            <button
              onClick={callUser}
              disabled={!connected}
              className={`p-2 mr-2 rounded-full ${
                connected 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Start voice call"
            >
              <PhoneCall size={18} />
            </button>
          )}

      <AnimatePresence>
        {callStatus === "calling" && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-sm p-4 mb-4 rounded-lg shadow-lg bg-blue-800 text-white"
          >
            <div className="flex flex-col items-center">
              <div className="mb-3 text-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-2"
                >
                  <Phone size={32} />
                </motion.div>
                <h3 className="text-xl font-semibold">Calling {currentConversation?.name}...</h3>
                <p className="text-sm text-blue-200">Outgoing voice call</p>
              </div>
              
              <button
                onClick={() => endCall("cancelled")}
                className="w-full bg-red-600 hover:bg-red-700 rounded-full py-3 flex items-center justify-center"
              >
                <PhoneOff size={20} className="mr-2" />
                <span>Cancel</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

   
        <AnimatePresence>
        {callStatus === "incoming" && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-sm p-4 mb-4 rounded-lg shadow-lg bg-blue-800 text-white"
          >
            <div className="flex flex-col items-center">
              <div className="mb-3 text-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-2"
                >
                  <Phone size={32} />
                </motion.div>
                <h3 className="text-xl font-semibold">{callerName || "Someone"} is calling</h3>
                <p className="text-sm text-blue-200">Incoming voice call</p>
              </div>
              
              <div className="flex gap-4 w-full">
                <button
                  onClick={rejectCall}
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded-full py-3 flex items-center justify-center"
                >
                  <PhoneOff size={20} className="mr-2" />
                  <span>Decline</span>
                </button>
                
                <button
                  onClick={answerCall}
                  className="flex-1 bg-green-600 hover:bg-green-700 rounded-full py-3 flex items-center justify-center"
                >
                  <Phone size={20} className="mr-2" />
                  <span>Answer</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {callActive && (
        // <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6" >
        <div className=" gap-4 mt-6 hidden" >
          <div>
            <p className="text-sm mb-1">🎤 Your Audio</p>
            <audio ref={localStreamRef} autoPlay muted controls className="hidden" />
          </div>
          <div>
            <p className="text-sm mb-1">👤 Caller Audio</p>
            <audio ref={remoteStreamRef} autoPlay controls className="hidden"/>
          </div>
        </div>
      )}

      <AnimatePresence>
        {callStatus === "active" && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-sm p-4 mb-4 rounded-lg shadow-lg bg-blue-900 text-white"
          >
            <div className="flex flex-col items-center">
              <div className="mb-3 text-center">
                <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                  <Phone size={32} />
                </div>
                <h3 className="text-xl font-semibold">{callerName || currentConversation?.name}</h3>
                <p className="text-sm text-blue-200">{formatCallDuration(callDuration)}</p>
              </div>
              
              {/* Call Controls */}
              <div className="flex justify-around w-full mb-4">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full ${
                    isMuted ? 'bg-red-500' : 'bg-blue-700 hover:bg-blue-600'
                  }`}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                
                <button
                  onClick={toggleSpeaker}
                  className={`p-3 rounded-full ${
                    isSpeakerOn ? 'bg-blue-700 hover:bg-blue-600' : 'bg-red-500'
                  }`}
                >
                  {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
              </div>
              
              <button
                onClick={() => endCall("ended")}
                className="w-full bg-red-600 hover:bg-red-700 rounded-full py-3 flex items-center justify-center"
              >
                <PhoneOff size={20} className="mr-2" />
                <span>End Call</span>
              </button>
            </div>
            
          
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

 
};

export default VoiceCallComponent;

// import React, { useEffect, useRef, useState } from "react";
// import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { socket } from "../socket";


// const VoiceCallComponent = ({ user, currentConversation,conversationId, connected }) => {
//   const [myId, setMyId] = useState("");
//   const [targetId, setTargetId] = useState(currentConversation.id);
//   const [incomingCall, setIncomingCall] = useState(null);
//   const [callActive, setCallActive] = useState(false);

  
//   const [callStatus, setCallStatus] = useState("idle"); // idle, calling, incoming, active
//   const [callerId, setCallerId] = useState(null);
//   const [callerName, setCallerName] = useState(null);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isSpeakerOn, setIsSpeakerOn] = useState(true);
//   const [callDuration, setCallDuration] = useState(0);

//   const localStreamRef = useRef(null);
//   const remoteStreamRef = useRef(null);
//   const peerConnection = useRef(null);
//   const localStream = useRef(null);
//   const callTimerRef = useRef(null);


//   const config = {
//     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//   };

//     // Toggle mute status
//     const toggleMute = () => {
//       if (localStream.current) {
//         const audioTracks = localStream.current.getAudioTracks();
//         audioTracks.forEach(track => {
//           track.enabled = !track.enabled;
//         });
//         setIsMuted(!isMuted);
//       }
//     };
  
//     // Toggle speaker status (in a real app, this would control audio output device)
//     const toggleSpeaker = () => {
//       setIsSpeakerOn(!isSpeakerOn);
//       // In a real app, you would use the Audio Output Devices API
//       // This is just a UI placeholder
//     };

//     const rejectCall = () => {
//       socket.emit("rejectCall", {
//         to: callerId,
//       });
      
//       setCallStatus("idle");
//       setCallerId(null);
//       setCallerName(null);
//     };
  

//   const formatCallDuration = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };


//   useEffect(() => {

//     socket.on("connect", () => {
//       console.log("🔗 Connected to socket server with ID:", socket.id);
//       setMyId(socket.id);

//       // ✅ Register your userId (can be dynamic later, hardcoded for now)
//       const userId = socket.id;
//       socket.emit("registerUser", { userId : user._id });
//     });

//     navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
//       localStream.current = stream;
//       if (localStreamRef.current) {
//         localStreamRef.current.srcObject = stream;
//       }
//     });

//     // socket.on("incomingCall", ({ from, offer }) => {
//     //   console.log("📞 Incoming call from:", from);
//     //   setIncomingCall({ from, offer });
//     // });
  
//     socket.on("incomingCall", ({ from, fromName, offer }) => {
//       // console.log("Can play MP3:", audio.canPlayType("audio/mpeg"));
//       // console.log("Can play OGG:", audio.canPlayType("audio/ogg"));

//       console.log("📞 Incoming call from:", fromName);
//       setCallerId(from);
//       setCallerName(fromName);
//       setIncomingCall({ offer, from  });
//       setCallStatus("incoming");
      
//       // Play ring tone
//       // const audio = new Audio("jai_raghuvansi.mp3"); // You'll need to add this file
//       // audio.loop = true;
//       // audio.load();
//       // audio.play().catch(e => console.error("Couldn't play ringtone:", e));
      
//       // Auto-reject call after 30 seconds if not answered
//       const timeoutId = setTimeout(() => {
//         if (callStatus === "incoming") {
//           console.log('30000 seconds completed.')
//           // rejectCall();
//           // audio.pause();
//         }
//       }, 30000);
      
//       return () => {
//         clearTimeout(timeoutId);
//         // audio.pause();
//       };
//     });

//     // socket.on("callAccepted", ({ answer }) => {
//     //   console.log("✅ Call accepted");
//     //   peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//     //   setCallActive(true);
//     // });

//     socket.on("callAccepted", ({ answer }) => {
//       console.log("✅ Call accepted");
//       if (peerConnection.current) {
//         peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer))
//           .then(() => {
//             setCallStatus("active");
//             startCallTimer();
//           })
//           .catch(err => console.error("Error setting remote description:", err));

//           setCallActive(true);
//       }
//     });

   
//     socket.on("iceCandidate", ({ candidate }) => {
//       console.log("❄️ Received ICE candidate");
//       if (peerConnection.current) {
//         peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
//           .catch(err => console.error("Error adding ICE candidate:", err));
//       }
//     });

//     return () => {
//       socket.off("incomingCall");
//       socket.off("callAccepted");
//       socket.off("callRejected");
//       socket.off("callEnded");
//       socket.off("iceCandidate");
//       endCall();
//     };
//     // return () => {
//     //   if (socket) {
//     //     socket.disconnect();
//     //     socket = null;
//     //   }
//     // };
//   }, []);


//   const startCallTimer = () => {
//     if (callTimerRef.current) clearInterval(callTimerRef.current);
    
//     const startTime = Date.now();
//     callTimerRef.current = setInterval(() => {
//       const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
//       setCallDuration(elapsedSeconds);
//     }, 1000);
//   };

//   const createPeerConnection = (targetId) => {
//     const pc = new RTCPeerConnection(config);


//       localStream.current?.getTracks()?.forEach((track) => {
//         pc.addTrack(track, localStream.current);
//       });
    

//     // Handle remote tracks
//     pc.ontrack = (event) => {
//       console.log("📡 Received remote track");
//       if (remoteStreamRef.current ) {
//         remoteStreamRef.current.srcObject = event.streams[0];
//       }
//     };

//     // Handle ICE candidates
//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         console.log("📨 Sending ICE candidate");
//         socket.emit("iceCandidate", {
//           to: targetId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     // Monitor connection state
//     pc.onconnectionstatechange = () => {
//       console.log("🔄 Connection State:", pc.connectionState);
//       if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
//         endCall("connection_lost");
//       }
//     };

//     return pc;
//   };

//   const createPeerConnection1 = (targetSocketId) => {
//     const pc = new RTCPeerConnection(config);

//     localStream.current.getTracks().forEach((track) => {
//       pc.addTrack(track, localStream.current);
//     });

//     pc.ontrack = (event) => {
//       if (remoteStreamRef.current) {
//         remoteStreamRef.current.srcObject = event.streams[0];
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("iceCandidate", {
//           to: targetSocketId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     pc.onconnectionstatechange = () => {
//       console.log("🔄 Connection State:", pc.connectionState);
//     };

//     return pc;
//   };

//   const callUser1 = async () => {
//     console.log("📤 Calling user:", targetId);
//     peerConnection.current = createPeerConnection(targetId);
//     const offer = await peerConnection.current.createOffer();
//     await peerConnection.current.setLocalDescription(offer);

//     socket.emit("callUser", {
//       to: targetId,
//       from: user._id,
//       offer,
//     });
//   };

//   const answerCall1 = async () => {
//     peerConnection.current = createPeerConnection(incomingCall.from);
//     await peerConnection.current.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
//     const answer = await peerConnection.current.createAnswer();
//     await peerConnection.current.setLocalDescription(answer);

//     socket.emit("answerCall", {
//       to: incomingCall.from,
//       answer,
//     });

//     setIncomingCall(null);
//     setCallActive(true);
//   };


//   //startCall bhi h ye
  
//   const callUser = async () => {
//     if (!currentConversation || !connected) return;
//     console.log(currentConversation)

//     try {
//       // Get user's audio
//       // localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
//       // Set local audio element
//       if (localStreamRef.current) {
//         localStreamRef.current.srcObject = localStream.current;
//       }
      
//       // Set call status to calling
//       setCallStatus("calling");
//       setCallerId(currentConversation._id);
      
//       // Create peer connection
//       peerConnection.current = createPeerConnection(targetId);
//       const offer = await peerConnection.current.createOffer();
//       await peerConnection.current.setLocalDescription(offer);
      
//       console.log("📤 Calling user:", currentConversation._id);
//       // Send call request
//       socket.emit("callUser", {
//         to: targetId,
//         from: user._id,
//         fromName: user.fullname,
//         offer,
//       });
      
//       // Play outgoing call sound
//       // const audio = new Audio("/sounds/outgoing.mp3"); // You'll need to add this file
//       // audio.loop = true;
//       // audio.play().catch(e => console.error("Couldn't play outgoing call sound:", e));
      
//       // Auto-cancel call after 30 seconds if not answered
//       const timeoutId = setTimeout(() => {
//         if (callStatus === "calling") {
//           endCall("unanswered");
//           // audio.pause();
//         }
//       }, 30000);
      
//       return () => {
//         clearTimeout(timeoutId);
//         // audio.pause();
//       };
//     } catch (err) {
//       console.error("Error starting call:", err);
//       setCallStatus("idle");
//     }
//   };

//   // Answer an incoming call
//   const answerCall = async () => {

    
//     try {
//       // Get user's audio
//       // localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
//       // Set local audio element
//       if (localStreamRef.current) {
//         localStreamRef.current.srcObject = localStream.current;
//       }
      
//       // Create peer connection

//       peerConnection.current = createPeerConnection(incomingCall.from);
//       await peerConnection.current.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
//       const answer = await peerConnection.current.createAnswer();
//       await peerConnection.current.setLocalDescription(answer);
  
      
//       // Send call acceptance
//       socket.emit("answerCall", {
//         to: incomingCall.from,
//         answer,
//       });
      
      
//       setIncomingCall(null);
//       setCallActive(true);
//       // Set call as active and start timer
//       setCallStatus("active");
//       startCallTimer();
//     } catch (err) {
//       console.error("Error answering call:", err);
//       rejectCall();
//     }
//   };


//   // yaha se reh gaya h cheak krna

//   const endCall1 = () => {
//     console.log("📴 Ending call");
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//     if (remoteStreamRef.current) {
//       remoteStreamRef.current.srcObject = null;
//     }
//     setCallActive(false);
//     setIncomingCall(null);
//   };

//   const endCall = (reason = "ended") => {
//     // Stop the timer
//     if (callTimerRef.current) {
//       clearInterval(callTimerRef.current);
//       callTimerRef.current = null;
//     }
    
//     // Close peer connection
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
    
//     // Stop all tracks in local stream
//     if (localStream.current) {
//       localStream.current.getTracks().forEach(track => track.stop());
//       localStream.current = null;
//     }
    
//     // Clear audio elements
//     if (localStreamRef.current) {
//       localStreamRef.current.srcObject = null;
//     }
//     if (remoteStreamRef.current) {
//       remoteStreamRef.current.srcObject = null;
//     }
//     setCallActive(false);
//     setIncomingCall(null);
    
//     // Notify the other user if we're ending the call
//     if (callStatus === "active" || callStatus === "calling") {
//       socket.emit("endCall", {
//         to: callerId,
//       });
//     }
    
//     // Reset state
//     setCallStatus("idle");
//     setCallerId(null);
//     setCallerName(null);
//     setCallDuration(0);
//     setIsMuted(false);
//     setIsSpeakerOn(true);
//   };

//   return (
//     <div className="p-6 max-w-2xl mx-auto bg-gray-900 text-white rounded-xl shadow-xl mt-10 w-[90%]">
//       <h2 className="text-2xl font-bold mb-4 text-center">🔊 Voice Call</h2>

//       <div className="text-sm text-gray-400 mb-1">Your ID:</div>
//       <div className="p-2 bg-gray-800 rounded mb-4 text-xs break-all">{myId}</div>

//       <input
//         type="text"
//         placeholder="Enter target user ID"
//         className="w-full p-2 mb-3 rounded text-black"
//         value={targetId}
//         onChange={(e) => setTargetId(e.target.value)}
//       />

//       <div className="flex flex-col sm:flex-row gap-4">
//         <button
//           onClick={callUser}
//           className="bg-blue-500 hover:bg-blue-600 flex-1 p-2 rounded"
//         >
//           📞 Call
//         </button>

//         <button
//           onClick={endCall}
//           className="bg-red-500 hover:bg-red-600 flex-1 p-2 rounded"
//         >
//           ❌ End Call
//         </button>
//       </div>

//       {incomingCall && (
//         <div className="bg-green-600 p-4 rounded mt-4 text-center">
//           <p className="mb-2">📲 Incoming Call from {incomingCall.from}</p>
//           <button
//             onClick={answerCall}
//             className="bg-black p-2 rounded w-full"
//           >
//             ✅ Answer
//           </button>
//         </div>
//       )}

//       {callActive && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
//           <div>
//             <p className="text-sm mb-1">🎤 Your Audio</p>
//             <audio ref={localStreamRef} autoPlay muted controls />
//           </div>
//           <div>
//             <p className="text-sm mb-1">👤 Caller Audio</p>
//             <audio ref={remoteStreamRef} autoPlay controls />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VoiceCallComponent;



// import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// // Create socket inside component lifecycle (DO NOT create outside)
// let socket;

// const VoiceCall = () => {
//   const [myId, setMyId] = useState("");
//   const [targetId, setTargetId] = useState("");
//   const [incomingCall, setIncomingCall] = useState(null);
//   const [callActive, setCallActive] = useState(false);

//   const localStreamRef = useRef(null);
//   const remoteStreamRef = useRef(null);
//   const peerConnection = useRef(null);
//   const localStream = useRef(null);

//   const config = {
//     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//   };

//   useEffect(() => {
//     socket = io("http://localhost:4000");

//     socket.on("connect", () => {
//       console.log("🔗 Connected to socket server with ID:", socket.id);
//       setMyId(socket.id);

//       // ✅ Register your userId (can be dynamic later, hardcoded for now)
//       const userId = socket.id;
//       socket.emit("registerUser", { userId });
//     });

//     navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
//       localStream.current = stream;
//       if (localStreamRef.current) {
//         localStreamRef.current.srcObject = stream;
//       }
//     });

//     socket.on("incomingCall", ({ from, offer }) => {
//       console.log("📞 Incoming call from:", from);
//       setIncomingCall({ from, offer });
//     });

//     socket.on("callAccepted", ({ answer }) => {
//       console.log("✅ Call accepted");
//       peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//       setCallActive(true);
//     });

//     socket.on("iceCandidate", ({ candidate }) => {
//       console.log("❄️ Received ICE candidate");
//       if (peerConnection.current) {
//         peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//       }
//     });

//     return () => {
//       if (socket) {
//         socket.disconnect();
//         socket = null;
//       }
//     };
//   }, []);

//   const createPeerConnection = (targetSocketId) => {
//     const pc = new RTCPeerConnection(config);

//     localStream.current.getTracks().forEach((track) => {
//       pc.addTrack(track, localStream.current);
//     });

//     pc.ontrack = (event) => {
//       if (remoteStreamRef.current) {
//         remoteStreamRef.current.srcObject = event.streams[0];
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("iceCandidate", {
//           to: targetSocketId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     pc.onconnectionstatechange = () => {
//       console.log("🔄 Connection State:", pc.connectionState);
//     };

//     return pc;
//   };

//   const callUser = async () => {
//     console.log("📤 Calling user:", targetId);
//     peerConnection.current = createPeerConnection(targetId);
//     const offer = await peerConnection.current.createOffer();
//     await peerConnection.current.setLocalDescription(offer);

//     socket.emit("callUser", {
//       to: targetId,
//       from: myId,
//       offer,
//     });
//   };

//   const answerCall = async () => {
//     peerConnection.current = createPeerConnection(incomingCall.from);
//     await peerConnection.current.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
//     const answer = await peerConnection.current.createAnswer();
//     await peerConnection.current.setLocalDescription(answer);

//     socket.emit("answerCall", {
//       to: incomingCall.from,
//       answer,
//     });

//     setIncomingCall(null);
//     setCallActive(true);
//   };

//   const endCall = () => {
//     console.log("📴 Ending call");
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//     if (remoteStreamRef.current) {
//       remoteStreamRef.current.srcObject = null;
//     }
//     setCallActive(false);
//     setIncomingCall(null);
//   };

  // return (
  //   <div className="p-6 max-w-2xl mx-auto bg-gray-900 text-white rounded-xl shadow-xl mt-10 w-[90%]">
  //     <h2 className="text-2xl font-bold mb-4 text-center">🔊 Voice Call</h2>

  //     <div className="text-sm text-gray-400 mb-1">Your ID:</div>
  //     <div className="p-2 bg-gray-800 rounded mb-4 text-xs break-all">{myId}</div>

  //     <input
  //       type="text"
  //       placeholder="Enter target user ID"
  //       className="w-full p-2 mb-3 rounded text-black"
  //       value={targetId}
  //       onChange={(e) => setTargetId(e.target.value)}
  //     />

  //     <div className="flex flex-col sm:flex-row gap-4">
  //       <button
  //         onClick={callUser}
  //         className="bg-blue-500 hover:bg-blue-600 flex-1 p-2 rounded"
  //       >
  //         📞 Call
  //       </button>

  //       <button
  //         onClick={endCall}
  //         className="bg-red-500 hover:bg-red-600 flex-1 p-2 rounded"
  //       >
  //         ❌ End Call
  //       </button>
  //     </div>

  //     {incomingCall && (
  //       <div className="bg-green-600 p-4 rounded mt-4 text-center">
  //         <p className="mb-2">📲 Incoming Call from {incomingCall.from}</p>
  //         <button
  //           onClick={answerCall}
  //           className="bg-black p-2 rounded w-full"
  //         >
  //           ✅ Answer
  //         </button>
  //       </div>
  //     )}

  //     {callActive && (
  //       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
  //         <div>
  //           <p className="text-sm mb-1">🎤 Your Audio</p>
  //           <audio ref={localStreamRef} autoPlay muted controls />
  //         </div>
  //         <div>
  //           <p className="text-sm mb-1">👤 Caller Audio</p>
  //           <audio ref={remoteStreamRef} autoPlay controls />
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // );
// };

// export default VoiceCall;
