const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create payment intent
// @route   POST /api/payments/create-payment-intent
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, orderId, currency = 'ron', customerEmail } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Sumă invalidă. Trebuie să fie mai mare decât 0.'
      });
    }

    // Creare payment intent Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe folosește cei mai mici unități
      currency: currency.toLowerCase(),
      receipt_email: customerEmail || undefined,
      metadata: {
        orderId: orderId || '',
        integration_check: 'accept_a_payment'
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    console.log(`✅ Payment intent creat: ${paymentIntent.id} — ${amount} RON`);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency.toLowerCase()
    });
  } catch (error) {
    console.error('❌ Stripe payment intent error:', error.message);
    next(error);
  }
};

// @desc    Confirm payment (verificare manuală)
// @route   POST /api/payments/confirm
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment Intent ID lipsește'
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      status: paymentIntent.status,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        receipt_email: paymentIntent.receipt_email,
        metadata: paymentIntent.metadata
      }
    });
  } catch (error) {
    console.error('❌ Stripe confirm error:', error.message);
    next(error);
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('⚠️  Webhook signature verification failed:', error.message);
    return res.status(400).json({
      success: false,
      error: `Webhook Error: ${error.message}`
    });
  }

  console.log(`📩 Webhook received: ${event.type} — ${event.id}`);

  // Handle events
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      
      console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
      console.log(`💰 Amount: ${paymentIntent.amount / 100} ${paymentIntent.currency}`);
      console.log(`📧 Email: ${paymentIntent.receipt_email || 'N/A'}`);
      
      // Update comandă ca plătită
      if (paymentIntent.metadata.orderId) {
        const Order = require('../models/Order');
        try {
          const order = await Order.findByIdAndUpdate(
            paymentIntent.metadata.orderId,
            {
              paymentStatus: 'paid',
              stripePaymentIntentId: paymentIntent.id,
              status: 'primita'
            },
            { new: true }
          );
          
          if (order) {
            console.log(`📝 Comandă ${order._id} marcată ca plătită`);
          }
        } catch (dbError) {
          console.error('❌ Eroare update comandă:', dbError.message);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const failedPayment = event.data.object;
      const errorMessage = failedPayment.last_payment_error?.message || 'Unknown error';
      
      console.log(`❌ Payment failed: ${failedPayment.id}`);
      console.log(`🚫 Reason: ${errorMessage}`);
      
      if (failedPayment.metadata.orderId) {
        const Order = require('../models/Order');
        try {
          await Order.findByIdAndUpdate(
            failedPayment.metadata.orderId,
            { 
              paymentStatus: 'failed',
              observations: `Plată eșuată: ${errorMessage}`
            }
          );
        } catch (dbError) {
          console.error('❌ Eroare update comandă:', dbError.message);
        }
      }
      break;
    }

    case 'payment_intent.created': {
      console.log(`📝 Payment intent created: ${event.data.object.id}`);
      break;
    }

    case 'charge.succeeded': {
      const charge = event.data.object;
      console.log(`💳 Charge succeeded: ${charge.id} — ${charge.amount / 100} ${charge.currency}`);
      break;
    }

    default:
      console.log(`ℹ️  Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// @desc    Get Stripe config (publishable key)
// @route   GET /api/payments/config
exports.getConfig = (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
    currency: 'ron'
  });
};

// @desc    Refund payment
// @route   POST /api/payments/refund
exports.refundPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, amount } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment Intent ID lipsește'
      });
    }

    const refundData = { payment_intent: paymentIntentId };
    if (amount) refundData.amount = Math.round(amount * 100);

    const refund = await stripe.refunds.create(refundData);

    console.log(`↩️ Refund creat: ${refund.id} — status: ${refund.status}`);

    res.json({
      success: true,
      refund: {
        id: refund.id,
        status: refund.status,
        amount: refund.amount / 100,
        currency: refund.currency
      }
    });
  } catch (error) {
    console.error('❌ Stripe refund error:', error.message);
    next(error);
  }
};
