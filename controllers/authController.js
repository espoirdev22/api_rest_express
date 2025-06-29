const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
    const { email, password, nom } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé !' });
    }

    // Créer un nouvel utilisateur
    const user = new User({
      email,
      password,
      nom
    });

    await user.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès !' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé !' });
    }

    // Vérifier le mot de passe
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Mot de passe incorrect !' });
    }

    // Générer le token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'RANDOM_TOKEN_SECRET',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      userId: user._id,
      token,
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
