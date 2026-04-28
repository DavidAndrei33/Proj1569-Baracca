const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Verificare header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Acces neautorizat. Token lipsă.'
      });
    }

    // Verificare token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificare utilizator existent și activ
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilizator negăsit.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Cont dezactivat.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token invalid.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirat.'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Eroare server.'
    });
  }
};

// Middleware pentru roluri specifice
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acces interzis. Rol insuficient.'
      });
    }
    next();
  };
};

module.exports = { authMiddleware, authorize };
