const express = require("express");
const multer = require("multer");
const { uploadToCloudinary } = require("../utils/cloudinary");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // ✅ Store in memory

// ✅ Upload Route
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    const fileBuffer = req.file.buffer; // ✅ Get file from memory
    const fileType = req.file.mimetype.split("/")[0];
    const folderName = fileType === "image" ? "images" : fileType === "video" ? "videos" : "audio";

    // ✅ Convert Buffer to Base64
    const fileBase64 = `data:${req.file.mimetype};base64,${fileBuffer.toString("base64")}`;

    // ✅ Upload to Cloudinary (without saving locally)
    const fileUrl = await uploadToCloudinary(fileBase64, folderName);

    res.json({ success: true, fileUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

module.exports = router;


// const express = require("express");
// const multer = require("multer");
// const fs = require("fs");
// const { uploadToCloudinary } = require("../utils/cloudinary");



// const router = express.Router();
// const upload = multer({ dest: "temp_uploads/" }); // Temporary storage

// // ✅ Upload Route
// router.post("/", upload.single("file"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ success: false, message: "No file uploaded" });
//   }

//   try {
//     const fileType = req.file.mimetype.split("/")[0]; // 'image', 'video', 'audio'
//     const folderName = fileType === "image" ? "images" : fileType === "video" ? "videos" : "audio";
    
//     // Upload to Cloudinary
//     const fileUrl = await uploadToCloudinary(req.file.path, folderName);
    
//     // Delete local file after upload
//     fs.unlinkSync(req.file.path);
    
//     res.json({ success: true, fileUrl });
//   } catch (error) {
//     console.error("Upload Error:", error);
//     res.status(500).json({ success: false, message: "Upload failed" });
//   }
// });

// module.exports = router;
