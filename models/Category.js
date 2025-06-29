const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);