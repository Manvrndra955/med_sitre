const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medstore';

app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicines');
const orderRoutes = require('./routes/orders');
const requestRoutes = require('./routes/requests');

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/requests', requestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    dbState: mongoose.connection.readyState === 1 ? 'MongoDB Connected' : 'In-Memory DB Active',
    timestamp: new Date()
  });
});

// Connect MongoDB with graceful fallback
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 2000
})
.then(() => {
  console.log('✅ Connected to MongoDB at:', MONGO_URI);
})
.catch((err) => {
  console.log('⚠️ Local MongoDB not detected. Operating in high-performance In-Memory Fallback Mode.');
});

app.listen(PORT, () => {
  console.log(`🚀 MediQuick Online Pharmacy Server running on port ${PORT}`);
});
