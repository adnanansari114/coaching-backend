const Topper = require("../models/Topper.js");

// Add topper
const addTopper = async (req, res) => {
  try {
    const { name, percentage } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null; // multer use hoga image upload ke liye

    if (!name || !percentage || !photo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const topper = await Topper.create({
      name,
      percentage,
      photo,
      createdBy: req.user.id,
    });

    res.status(201).json(topper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all toppers
const getToppers = async (req, res) => {
  try {
    const toppers = await Topper.find().sort({ percentage: -1 }); // Highest first
    res.json(toppers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update topper
const updateTopper = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, percentage } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const topper = await Topper.findById(id);
    if (!topper) return res.status(404).json({ message: "Topper not found" });

    topper.name = name || topper.name;
    topper.percentage = percentage || topper.percentage;
    topper.photo = photo || topper.photo;

    await topper.save();
    res.json(topper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete topper
const deleteTopper = async (req, res) => {
  try {
    const { id } = req.params;
    const topper = await Topper.findById(id);
    if (!topper) return res.status(404).json({ message: "Topper not found" });

    await topper.deleteOne();
    res.json({ message: "Topper deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addTopper,
  getToppers,
  updateTopper,
  deleteTopper,
};