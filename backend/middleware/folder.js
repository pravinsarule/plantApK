const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { plantName, diseaseName } = req.body;

    if (!plantName || !diseaseName) {
      return cb(new Error('Missing plantName or diseaseName'), null);
    }

    const dir = path.join(__dirname, '..', 'folder', plantName, diseaseName);

    fs.mkdirSync(dir, { recursive: true }); // Create folder/plant/disease
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `image-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

module.exports = upload;
