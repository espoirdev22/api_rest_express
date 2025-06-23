const User = require('../models/User');

// Fonction de gestion des erreurs séparée
function handleErrors(err) {
  if (err.name === 'ValidationError') {
    return Object.values(err.errors).map(e => e.message).join(', ');
  }
  if (err.code === 11000) return 'Email déjà utilisé';
  return 'Erreur de traitement';
}

// Méthodes exportées
module.exports = {
  async create(req, res) {
    try {
      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ 
        error: handleErrors(err) // Appel direct de la fonction
      });
    }
  },

  async getAll(req, res) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async getOne(req, res) {
    try {
      const user = await User.findById(req.params.id);
      user ? res.json(user) : res.status(404).json({ error: 'Non trouvé' });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async update(req, res) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      user ? res.json(user) : res.status(404).json({ error: 'Non trouvé' });
    } catch (err) {
      res.status(400).json({ error: handleErrors(err) }); // Appel direct
    }
  },

  async delete(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      user ? res.json({ message: 'Supprimé' }) : res.status(404).json({ error: 'Non trouvé' });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
};