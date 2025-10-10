const express = require("express");
const {
  addTopper,
  getToppers,
  updateTopper,
  deleteTopper,
} = require("../controllers/topperController.js");
const { protect } = require("../middleware/authMiddleware.js");
const { teacher } = require("../middleware/roleMiddleware.js");
const upload = require("../middleware/uploadMiddleware.js"); 

const router = express.Router();

// Teacher add topper
router.post("/", protect, teacher, upload.single("photo"), addTopper);

// Get all toppers (home page me dikhane ke liye)
router.get("/getToppers", getToppers);

// Update topper
router.put("/:id", protect, teacher, upload.single("photo"), updateTopper);

// Delete topper
router.delete("/:id", protect, teacher, deleteTopper);

module.exports = router;
