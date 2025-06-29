const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const { nom, description } = req.body;
    
    const category = new Category({
      nom,
      description,
      createdBy: req.userId
    });

    await category.save();
    
    const populatedCategory = await Category.findById(category._id)
      .populate('createdBy', 'nom email');

    res.status(201).json(populatedCategory);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Cette catégorie existe déjà !' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'nom email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'nom email');
    
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée !' });
    }
    
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { nom, description } = req.body;
    
    // Construire les conditions de recherche selon le rôle
    let searchConditions = { _id: req.params.id };
    
    // Si l'utilisateur n'est pas admin, limiter aux catégories qu'il a créées
    if (req.userRole !== 'admin') {
      searchConditions.createdBy = req.userId;
    }
    
    const category = await Category.findOneAndUpdate(
      searchConditions,
      { nom, description },
      { new: true }
    ).populate('createdBy', 'nom email');

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée ou non autorisée !' });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    // Construire les conditions de recherche selon le rôle
    let searchConditions = { _id: req.params.id };
    
    // Si l'utilisateur n'est pas admin, limiter aux catégories qu'il a créées
    if (req.userRole !== 'admin') {
      searchConditions.createdBy = req.userId;
    }

    const category = await Category.findOneAndDelete(searchConditions);

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée ou non autorisée !' });
    }

    res.status(200).json({ message: 'Catégorie supprimée avec succès !' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};