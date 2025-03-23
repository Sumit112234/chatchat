const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  name: String,
  members: [String],
});

module.exports = mongoose.model("Group", GroupSchema);
