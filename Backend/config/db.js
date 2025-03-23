const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    
    await mongoose.connect("mongodb+srv://Su112234@clustngodb.net/chatchat?retryWrites=true&w=majority");
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
