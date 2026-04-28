const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  webhook,
  getConfig,
  refundPayment
} = require('../controllers/paymentController');
const { authMiddleware, authorize } = require('../middleware/auth');

// GET /api/payments/config - Configurare Stripe public key (public)
router.get('/config', getConfig);

// POST /api/payments/create-payment-intent - Creare payment intent (public)
router.post('/create-payment-intent', createPaymentIntent);

// POST /api/payments/confirm - Verificare plată (public)
router.post('/confirm', confirmPayment);

// POST /api/payments/refund - Rambursare (admin only)
router.post('/refund', authMiddleware, authorize('admin'), refundPayment);

// POST /api/payments/webhook - Webhook Stripe (raw body, handled in server.js)
router.post('/webhook', webhook);

module.exports = router;