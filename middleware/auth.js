const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant, accès refusé' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer l'utilisateur complet avec son rôle
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Token invalide' });
    }
    
    
    req.userId = user._id;
    req.userRole = user.role;
    req.user = user;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};