const Detection = require('../models/detectionModel');

exports.storeDetection = async (req, res) => {
  try {
    const { plantName, diseaseName, userId } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const detection = new Detection({
      userId,
      plantName,
      diseaseName,
      imageUrl,
    });

    await detection.save();
    res.status(200).json({ message: 'Detection saved', detection });
  } catch (error) {
    console.error('Error saving detection:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
