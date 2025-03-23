const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const cors = require("cors");


const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const groupRoutes = require("./routes/groups");
const uploadRoutes = require("./routes/upload");
const socketLogic = require("./sockets");
const multer = require("multer");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// MongoDB Connection
// connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);
app.use("/groups", groupRoutes);
app.use("/upload", uploadRoutes);

// app.use('/uploads', express.static('uploads'));

// Real-Time Communication
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

socketLogic(io);
app.get('/',(req,res)=>{
  res.json({
    working : "Sahi h"
  })
})
// const storage = multer.diskStorage({
//   destination: './uploads/',
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// const upload = multer({ storage });


// app.post('/upload', upload.single('file'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ success: false, message: 'No file uploaded' });
//   }

//   const fileUrl = `http://localhost:4000/uploads/${req.file.filename}`;
//   res.json({ success: true, fileUrl });
// });

const PORT = 4000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));



// // server.js
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");

// // App Initialization
// const app = express();
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose
//   .connect("mongodb://localhost:27017/whatsappClone", { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error(err));

// // Schemas
// const UserSchema = new mongoose.Schema({
//   username: String,
//   password: String, // For demo only; use hashed passwords in production
// });
// const User = mongoose.model("User", UserSchema);

// const MessageSchema = new mongoose.Schema({
//   sender: String,
//   content: String,
//   timestamp: { type: Date, default: Date.now },
//   room: String,
//   type: { type: String, default: "text" }, // text, media
//   status: { type: String, default: "sent" }, // sent, delivered, seen
// });
// const Message = mongoose.model("Message", MessageSchema);

// const GroupSchema = new mongoose.Schema({
//   name: String,
//   members: [String],
// });
// const Group = mongoose.model("Group", GroupSchema);

// // Authentication Middleware
// const authenticate = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Unauthorized" });

//   try {
//     const user = jwt.verify(token, "secret_key");
//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(403).json({ message: "Invalid token" });
//   }
// };

// // Signup and Login
// app.post("/signup", async (req, res) => {
//   const { username, password } = req.body;
//   const user = new User({ username, password });
//   await user.save();
//   const token = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });
//   res.json({ token });
// });

// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;
//   const user = await User.findOne({ username, password });
//   if (!user) return res.status(401).json({ message: "Invalid credentials" });

//   const token = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });
//   res.json({ token });
// });

// // Create Group
// app.post("/createGroup", authenticate, async (req, res) => {
//   const { name, members } = req.body;
//   const group = new Group({ name, members });
//   await group.save();
//   res.json(group);
// });

// // Fetch Messages
// app.get("/messages/:room", authenticate, async (req, res) => {
//   const { room } = req.params;
//   const messages = await Message.find({ room }).sort({ timestamp: 1 });
//   res.json(messages);
// });

// // File Upload
// const storage = multer.diskStorage({
//   destination: "./uploads",
//   filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
// });
// const upload = multer({ storage });

// app.post("/upload", authenticate, upload.single("file"), (req, res) => {
//   res.json({ filePath: `/uploads/${req.file.filename}` });
// });

// // Real-Time Communication
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // Replace with your frontend URL
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   // Join Room
//   socket.on("joinRoom", ({ room }) => {
//     socket.join(room);
//     console.log(`User joined room: ${room}`);
//   });

//   // Send Message
//   socket.on("sendMessage", async ({ sender, content, room, type }) => {
//     const message = new Message({ sender, content, room, type });
//     await message.save();
//     io.to(room).emit("receiveMessage", message);
//   });

//   // Message Delivery Status
//   socket.on("messageDelivered", ({ messageId, status }) => {
//     Message.findByIdAndUpdate(messageId, { status }).exec();
//     io.emit("updateMessageStatus", { messageId, status });
//   });

//   // Typing Indicators
//   socket.on("typing", ({ room, username }) => {
//     socket.to(room).emit("userTyping", { username });
//   });

//   socket.on("stopTyping", ({ room, username }) => {
//     socket.to(room).emit("userStoppedTyping", { username });
//   });

//   socket.on("disconnect", () => console.log(`User disconnected: ${socket.id}`));
// });

// const PORT = 4000;
// server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
