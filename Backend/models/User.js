const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  password: String, // Use hashed passwords in production
});

module.exports = mongoose.model("User", UserSchema);
