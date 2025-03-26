const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  username: {type : String, required: true},
  email: {type : String, required: true},
  fullname: {type : String, required: true},
  userpic: {type : String, default: "https://res.cloudinary.com/djz3p8sye/image/upload/v1631181194/default-user-image.png"},
  password: {type : String, required: true},
}, {
  timestamps: true,
});

module.exports = mongoose.model("User", UserSchema);
