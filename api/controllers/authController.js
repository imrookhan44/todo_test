const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_LIFETIME = process.env.JWT_LIFETIME || '30d';

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create user
    const user = await User.create({ name, email, password });
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_LIFETIME }
    );

    res.status(201).json({
      user: {
        name: user.name,
        email: user.email,
        id: user._id
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_LIFETIME }
    );

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        id: user._id
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
}; 