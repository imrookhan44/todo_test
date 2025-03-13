require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConnect = require('./middleware/dbConnect');
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const start = async () => {
  try {
    // Connect to MongoDB
    await dbConnect();
    console.log('Connected to MongoDB');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

start(); 