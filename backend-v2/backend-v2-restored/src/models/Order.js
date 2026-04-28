const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  observations: {
    type: String,
    trim: true,
    maxlength: [200, 'Observațiile nu pot depăși 200 de caractere']
  }
});

const orderSchema = new mongoose.Schema({
  customer: {
    name: {
      type: String,
      required: [true, 'Numele clientului este obligatoriu'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Telefonul este obligatoriu'],
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['primita', 'in_preparare', 'gata', 'livrata', 'anulata'],
    default: 'primita'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'online'],
    default: 'cash'
  },
  stripePaymentIntentId: {
    type: String
  },
  observations: {
    type: String,
    trim: true,
    maxlength: [500, 'Observațiile nu pot depăși 500 de caractere']
  },
  estimatedTime: {
    type: Number,
    default: 30 // minute
  }
}, {
  timestamps: true
});

// Index pentru sortare rapidă după status și dată
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
