const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes'); // Import des routes

const app = express();

// Middleware
app.use(express.json()); // Pour parser le JSON

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/api_rest')
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur MongoDB:', err));

// Routes
app.use('/api/users', userRoutes); // Préfixe '/api/users'

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Lancement du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});