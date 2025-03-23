const express = require("express");
const Group = require("../models/Group");
const authenticate = require("../middleware/auth");
const router = express.Router();

// Create Group
router.post("/", authenticate, async (req, res) => {
  const { name, members } = req.body;
  const group = new Group({ name, members });
  await group.save();
  res.json(group);
});

module.exports = router;
