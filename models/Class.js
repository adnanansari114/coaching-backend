// models/class.js
const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    date:{
      type: Date,
      required: true,
    },
    section: {
      type: String,
      required: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);