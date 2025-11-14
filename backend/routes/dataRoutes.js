const express = require('express');
const router = express.Router();
const axios = require('axios');
const WoundData = require('../models/WoundData');

// This function takes the io object from server.js so we can use it here
module.exports = function(io) {

  // GET /api/data
  // This endpoint retrieves all historical data from the database
  router.get('/', async (req, res) => {
    try {
      // Find all data and sort it by the creation date (oldest first)
      const allData = await WoundData.find({}).sort({ createdAt: 1 });
      res.status(200).json(allData);
    } catch (error) {
      console.error('❌ Error fetching historical data:', error.message);
      res.status(500).json({ error: 'Failed to fetch historical data' });
    }
  });

  // POST /api/data
  // This is the endpoint your ESP32 will send data to.
  router.post('/', async (req, res) => {
    console.log('Received data from ESP32:', req.body);
    
    const { ph, temperature, humidity } = req.body;

    if (ph === undefined || temperature === undefined || humidity === undefined) {
      return res.status(400).json({ error: 'Missing sensor data: ph, temperature, and humidity are required.' });
    }

    try {
      // Call the ML Service for Predictions
      const healingPromise = axios.post('http://localhost:5001/predict_healing', {
        pH_Value: ph,
        Temperature_Celsius: temperature,
        Humidity: humidity
      });

      const daysPromise = axios.post('http://localhost:5001/predict_days', {
        ph: ph,
        temp_c: temperature,
        humidity_percent: humidity
      });

      const [healingResponse, daysResponse] = await Promise.all([healingPromise, daysPromise]);

      const healingStatus = healingResponse.data.prediction;
      const healingDays = daysResponse.data.predicted_days;
      
      console.log(`ML Predictions -> Status: ${healingStatus}, Days: ${healingDays}`);

      // Save the complete data to the database
      const newWoundData = new WoundData({
        ph,
        temperature,
        humidity,
        healingStatus,
        healingDays
      });

      const savedData = await newWoundData.save();
      console.log('✅ Data saved to MongoDB:', savedData);

      // Broadcast the new data to all connected clients
      io.emit('new-data', savedData);
      console.log('🚀 Broadcasted new data via Socket.IO');

      res.status(201).json({ message: 'Data received and processed successfully', data: savedData });

    } catch (error) {
      console.error('❌ Error processing data:', error.message);
      res.status(500).json({ error: 'Failed to process data' });
    }
  });

  return router;
};