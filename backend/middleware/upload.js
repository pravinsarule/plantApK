// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Set storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// Filter: only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
                  allowedTypes.test(file.mimetype);
  isValid ? cb(null, true) : cb(new Error('Only image files are allowed'));
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;
