const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  userId: {
    type: String, // or mongoose.Schema.Types.ObjectId if referencing a User model
    required: true,
  },
  plantName: {
    type: String,
    required: true,
  },
  diseaseName: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Detection', detectionSchema);
