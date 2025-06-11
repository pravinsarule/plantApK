// // const express = require('express');
// // const router = express.Router();
// // const multer = require('multer');
// // const path = require('path');
// // const detectionController = require('../controllers/detectionController');

// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => cb(null, 'uploads/'),
// //   filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
// // });
// // const upload = multer({ storage });

// // router.post('/store', upload.single('image'), detectionController.storeDetection);

// // module.exports = router;

// const express = require('express');
// const router = express.Router();
// const detectionController = require('../controllers/detectionController');
// const upload = require('../middleware/folder');

// router.post('/store', upload.single('image'), detectionController.storeDetection);

// router.get('/download-all', detectionController.downloadAllImages);

// module.exports = router;
