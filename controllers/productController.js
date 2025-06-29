const Product = require('../models/Product');
const Category = require('../models/Category');

exports.createProduct = async (req, res) => {
    try {
      const { nom, description, prix, quantite, category } = req.body;
      
      // Vérification obligatoire de la catégorie
      if (!category) {
        return res.status(400).json({ error: 'La catégorie est obligatoire' });
      }
      
      // Vérifier que la catégorie existe
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ error: 'Catégorie non trouvée' });
      }
      
      const product = new Product({
        nom,
        description,
        prix,
        quantite,
        category,
        createdBy: req.userId
      });
  
      await product.save();
      
      const populatedProduct = await Product.findById(product._id)
        .populate('category', 'nom')
        .populate('createdBy', 'nom email');
  
      res.status(201).json(populatedProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = category ? { category } : {};
    
    const products = await Product.find(filter)
      .populate('category', 'nom description')
      .populate('createdBy', 'nom email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Product.countDocuments(filter);
    
    res.status(200).json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'nom description')
      .populate('createdBy', 'nom email');
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé !' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
    try {
      // Vérifie que la catégorie existe
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Catégorie non trouvée" });
      }
  
      // Récupère les produits
      const products = await Product.find({ category: req.params.id })
        .populate('createdBy', 'email nom')
        .populate('category', 'nom');
  
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
  try {
    const { nom, description, prix, quantite, category } = req.body;
    
    // Construire les conditions de recherche selon le rôle
    let searchConditions = { _id: req.params.id };
    
    // Si l'utilisateur n'est pas admin, limiter aux produits qu'il a créés
    if (req.userRole !== 'admin') {
      searchConditions.createdBy = req.userId;
    }
    
    const product = await Product.findOneAndUpdate(
      searchConditions,
      { nom, description, prix, quantite, category },
      { new: true }
    ).populate('category', 'nom description')
     .populate('createdBy', 'nom email');

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé ou non autorisé !' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Vérifier les permissions : propriétaire ou admin
    if (product.createdBy.toString() !== req.userId.toString() && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Vous ne pouvez supprimer que vos propres produits.' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserProducts = async (req, res) => {
  try {
    // Les admins peuvent voir tous les produits, les users seulement les leurs
    let filter = {};
    if (req.userRole !== 'admin') {
      filter.createdBy = req.userId;
    }
    
    const products = await Product.find(filter)
      .populate('category', 'nom description')
      .populate('createdBy', 'nom email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};