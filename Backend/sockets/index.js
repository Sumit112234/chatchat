const Message = require("../models/Message");


const userSocketMap = new Map(); // username/userId => socket.id

const socketLogic = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // ==================== Register User ====================
    socket.on("registerUser", ({ userId }) => {
      userSocketMap.set(userId, socket.id);
      console.log(`User registered: ${userId} -> ${socket.id}`, userSocketMap);
    });

    // ==================== Chat Room ====================
    socket.on("joinRoom", ({ room }) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on("sendMessage", async (message) => {
      // Save logic (optional)
      console.log("Message received:", message);

      const { receiver } = message;
      console.log(receiver);
      const targetSocketId = userSocketMap.get(receiver.id);
      
      if (targetSocketId) {
        io.to(targetSocketId).emit("receiveMessage", message);
      } 
    });

    socket.on("messageDelivered", ({ messageId, status }) => {
      io.emit("updateMessageStatus", { messageId, status });
    });

    socket.on("typing", ({ room, username }) => {
      socket.to(room).emit("userTyping", { username });
    });

    socket.on("stopTyping", ({ room, username }) => {
      socket.to(room).emit("userStoppedTyping", { username });
    });

    // ==================== Voice Calling ====================
    socket.on("callUser", ({ to, from, fromName, offer }) => {

      console.log(to, from , fromName)
      const targetSocketId = userSocketMap.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("incomingCall", { from, offer, fromName });
      }
      else{
        console.log("sabko bhej do");
        io.emit("incomingCall", { from, offer, fromName });
      }
    });

    socket.on("answerCall", ({ to, answer }) => {
      const targetSocketId = userSocketMap.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("callAccepted", { answer });
      }
      else{
        console.log("sabko bhej do");
        io.emit("callAccepted", { answer });
      }
    });

    socket.on("iceCandidate", ({ to, candidate }) => {
      const targetSocketId = userSocketMap.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("iceCandidate", { candidate });
      }
      else{
        console.log("sabko bhej do");
        io.emit("iceCandidate", { candidate });
      }
    });

    // ==================== Disconnect ====================
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);

      for (let [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          console.log(`User removed: ${userId}`);
          break;
        }
      }
    });
  });
};


module.exports = socketLogic;
