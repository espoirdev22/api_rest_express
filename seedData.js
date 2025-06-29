require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/api_rest')
  .then(() => console.log('Connecté à MongoDB pour le seeding...'))
  .catch(err => console.error('Erreur de connexion:', err));

const seedDatabase = async () => {
  try {
    // 1. Nettoyage des collections
    await Promise.all([
      Category.deleteMany(),
      Product.deleteMany(),
      User.deleteMany()
    ]);
    console.log('Anciennes données supprimées');

    // 2. Création des utilisateurs
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const userPassword = await bcrypt.hash('User123!', 12);

    const [admin, user] = await User.insertMany([
      {
        email: 'admin@example.com',
        password: adminPassword,
        nom: 'Admin Principal',
        role: 'admin'
      },
      {
        email: 'user@example.com',
        password: userPassword,
        nom: 'Utilisateur Test',
        role: 'user'
      }
    ]);
    console.log('Utilisateurs créés');

    // 3. Création des catégories
    const [electronique, vetements, alimentation] = await Category.insertMany([
      {
        nom: 'Électronique',
        description: 'Appareils électroniques et gadgets',
        createdBy: admin._id
      },
      {
        nom: 'Vêtements',
        description: 'Mode pour hommes, femmes et enfants',
        createdBy: admin._id
      },
      {
        nom: 'Alimentation',
        description: 'Produits alimentaires et boissons',
        createdBy: user._id
      }
    ]);
    console.log('Catégories créées');

    // 4. Création des produits
    await Product.insertMany([
      {
        nom: 'Smartphone Premium',
        description: 'Dernier modèle avec caméra haute résolution',
        prix: 999,
        quantite: 50,
        category: electronique._id,
        createdBy: admin._id
      },
      {
        nom: 'Ordinateur Portable',
        description: '16GB RAM, SSD 512GB, écran 15"',
        prix: 1299,
        quantite: 30,
        category: electronique._id,
        createdBy: admin._id
      },
      {
        nom: 'Jean Slim',
        description: 'Jean délavé taille slim',
        prix: 59,
        quantite: 100,
        category: vetements._id,
        createdBy: user._id
      },
      {
        nom: 'Bouteille d\'Eau',
        description: 'Pack de 6 bouteilles 1L',
        prix: 4.99,
        quantite: 200,
        category: alimentation._id,
        createdBy: user._id
      }
    ]);
    console.log('Produits créés');

    console.log('✅ Base de données peuplée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Exécution
seedDatabase();