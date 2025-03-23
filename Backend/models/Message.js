const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  room: String,
  type: { type: String, default: "text" }, // text, media
  status: { type: String, default: "sent" }, // sent, delivered, seen
});

module.exports = mongoose.model("Message", MessageSchema);
