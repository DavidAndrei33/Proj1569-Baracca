const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username este obligatoriu'],
    unique: true,
    trim: true,
    minlength: [3, 'Username trebuie să aibă minim 3 caractere'],
    maxlength: [30, 'Username nu poate depăși 30 de caractere']
  },
  email: {
    type: String,
    required: [true, 'Email este obligatoriu'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Parola este obligatorie'],
    minlength: [6, 'Parola trebuie să aibă minim 6 caractere'],
    select: false // Nu returna parola în query-uri
  },
  role: {
    type: String,
    enum: ['admin', 'bucatarie', 'staff'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash parola înainte de save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metodă pentru comparare parole
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
