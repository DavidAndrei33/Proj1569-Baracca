const Order = require('../models/Order');

// @desc    Get all orders
// @route   GET /api/orders
exports.getOrders = async (req, res, next) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    let query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name image price');
    if (!order) {
      return res.status(404).json({ success: false, error: 'Comandă negăsită' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Create order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const order = await Order.create(req.body);
    const populatedOrder = await Order.findById(order._id).populate('items.product', 'name image');
    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['primita', 'in_preparare', 'gata', 'livrata', 'anulata'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Status invalid' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Comandă negăsită' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order payment status
// @route   PUT /api/orders/:id/payment
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, stripePaymentIntentId } = req.body;
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, error: 'Status plată invalid' });
    }

    const updateData = { paymentStatus };
    if (stripePaymentIntentId) updateData.stripePaymentIntentId = stripePaymentIntentId;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Comandă negăsită' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Comandă negăsită' });
    }
    res.status(200).json({ success: true, message: 'Comandă ștearsă cu succes' });
  } catch (error) {
    next(error);
  }
};
