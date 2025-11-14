const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require("socket.io");
const dataRoutes = require('./routes/dataRoutes');
require('dotenv').config(); // Loads environment variables from .env file

// --- Basic Setup ---
const app = express();
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Middleware to parse incoming JSON data

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now. We can restrict this later.
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- Socket.IO Connection ---
// This part listens for a frontend client to connect.
io.on('connection', (socket) => {
  console.log('✅ A user connected to Socket.IO with id:', socket.id);

  // When the client disconnects
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// --- Basic Route for testing ---
// --- API Routes ---
// We pass the `io` object to our routes so we can use it for real-time updates
app.use('/api/data', dataRoutes(io));

// --- Start the Server ---
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});