const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Numele categoriei este obligatoriu'],
    trim: true,
    unique: true,
    maxlength: [50, 'Numele nu poate depăși 50 de caractere']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Descrierea nu poate depăși 200 de caractere']
  },
  image: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
