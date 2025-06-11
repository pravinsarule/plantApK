
// const fs = require('fs');
// const archiver = require('archiver');
// const path = require('path');
// const Detection = require('../models/detectionModel');

// exports.storeDetection = async (req, res) => {
//   try {
//     const { plantName, diseaseName, userId } = req.body;

//     if (!plantName || !diseaseName || !userId || !req.file) {
//       return res.status(400).json({ error: 'Missing required fields or image' });
//     }

//     const imageUrl = path.join('folder', plantName, diseaseName, req.file.filename);

//     const detection = new Detection({
//       userId,
//       plantName,
//       diseaseName,
//       imageUrl,
//     });

//     const saved = await detection.save();

//     res.status(200).json({
//       message: '✅ Detection saved successfully',
//       detection: saved,
//     });
//   } catch (error) {
//     console.error('❌ Error saving detection:', error.message);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };




// // ⬇️ Compress entire 'folder/' directory including structure
// exports.downloadAllImages = async (req, res) => {
//   try {
//     const folderPath = path.join(__dirname, '..', 'folder');
//     const zipPath = path.join(__dirname, '..', 'images.zip');

//     // Ensure folder exists
//     if (!fs.existsSync(folderPath)) {
//       return res.status(404).json({ error: '📁 Image folder not found' });
//     }

//     // Create a zip stream
//     const output = fs.createWriteStream(zipPath);
//     const archive = archiver('zip', { zlib: { level: 9 } });

//     output.on('close', () => {
//       console.log(`✅ ZIP created: ${archive.pointer()} total bytes`);
//       res.download(zipPath, 'images.zip', (err) => {
//         if (err) {
//           console.error('❌ Error sending zip:', err);
//         }
//         // Optional: remove zip after sending
//         fs.unlink(zipPath, (err) => {
//           if (err) console.error('❌ Error deleting zip file:', err);
//         });
//       });
//     });

//     archive.on('error', (err) => {
//       throw err;
//     });

//     archive.pipe(output);

//     // ✅ Include the 'folder/' directory itself in zip
//     archive.directory(folderPath, 'folder');

//     archive.finalize();
//   } catch (error) {
//     console.error('❌ ZIP error:', error.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
