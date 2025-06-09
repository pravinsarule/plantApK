const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  userId: Number,   // from PostgreSQL
  plantName: String,
  diseaseName: String,
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Detection', detectionSchema);
