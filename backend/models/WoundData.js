const mongoose = require('mongoose');

const WoundDataSchema = new mongoose.Schema({
  // Sensor values from the ESP32
  ph: {
    type: Number,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  // Predictions from our ML models
  healingStatus: {
    type: String,
    required: true
  },
  healingDays: {
    type: Number,
    required: true
  }
}, {
  // This automatically adds `createdAt` and `updatedAt` fields
  timestamps: true 
});

const WoundData = mongoose.model('WoundData', WoundDataSchema);

module.exports = WoundData;