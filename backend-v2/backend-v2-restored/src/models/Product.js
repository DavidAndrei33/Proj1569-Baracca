const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Numele produsului este obligatoriu'],
    trim: true,
    maxlength: [100, 'Numele nu poate depăși 100 de caractere']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrierea nu poate depăși 500 de caractere']
  },
  price: {
    type: Number,
    required: [true, 'Prețul este obligatoriu'],
    min: [0, 'Prețul nu poate fi negativ']
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Categoria este obligatorie']
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  preparationTime: {
    type: Number,
    default: 15, // minute
    min: 0
  }
}, {
  timestamps: true
});

// Index pentru căutare rapidă
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
