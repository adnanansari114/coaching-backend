const mongoose = require("mongoose");

const topperSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    photo: {
      type: String, // Image ka URL ya path
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // teacher jo add karega
      required: true,
    },
  },
  { timestamps: true }
);

const Topper = mongoose.model("Topper", topperSchema);
module.exports = Topper;
