// import multer from "multer";
// import path from "path";

// // Storage engine
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "backend/uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// // File filter
// const fileFilter = (req, file, cb) => {
//   const allowed = /jpeg|jpg|png|pdf/;
//   const ext = allowed.test(path.extname(file.originalname).toLowerCase());
//   if (ext) cb(null, true);
//   else cb(new Error("Invalid file type"));
// };

// const upload = multer({ storage, fileFilter });

// export default upload;

// middleware/upload.js
const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "backend/uploads/"); // make sure 'uploads' folder exists
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg and .png format allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
