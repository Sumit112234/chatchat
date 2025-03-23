const express = require("express");
const Message = require("../models/Message");
const authenticate = require("../middleware/auth");
const multer = require("multer");
const router = express.Router();

// Fetch Messages
router.get("/:room", authenticate, async (req, res) => {
  const { room } = req.params;
  const messages = await Message.find({ room }).sort({ timestamp: 1 });
  res.json(messages);
});

// File Upload
// const storage = multer.diskStorage({
//   destination: "./uploads",
//   filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
// });
// const upload = multer({ storage });

// router.post("/upload", authenticate, upload.single("file"), (req, res) => {
//   res.json({ filePath: `/uploads/${req.file.filename}` });
// });

module.exports = router;
