const Message = require("../models/Message");


const socketLogic = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", ({ room }) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on("sendMessage", async (message) => {
      // const message = new Message({ sender, content, room, type });
      // await message.save();
      console.log(message);
      // io.to(room).emit("receiveMessage",message);
      io.emit("receiveMessage",message);
    });

    socket.on("messageDelivered", ({ messageId, status }) => {
      // Message.findByIdAndUpdate(messageId, { status }).exec();
      io.emit("updateMessageStatus", { messageId, status });
    });

    socket.on("typing", ({ room, username }) => {
      socket.to(room).emit("userTyping", { username });
    });

    socket.on("stopTyping", ({ room, username }) => {
      socket.to(room).emit("userStoppedTyping", { username });
    });

    socket.on("disconnect", () => console.log(`User disconnected: ${socket.id}`));
  });
};

module.exports = socketLogic;
