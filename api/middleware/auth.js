const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const auth = async (req, res, next) => {
  try {
    // Check for token in headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication invalid' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token
      const payload = jwt.verify(token, JWT_SECRET);
      
      // Attach user to request object
      req.user = { userId: payload.userId, name: payload.name };
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Authentication invalid' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = auth; 