const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/api_rest')
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(err => console.error('Erreur de connexion MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API REST fonctionnelle !' });
});

// Middleware de gestion d'erreurs
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;