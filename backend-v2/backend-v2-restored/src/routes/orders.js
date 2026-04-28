const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder
} = require('../controllers/orderController');
const { validateOrder, validateOrderStatus } = require('../middleware/validators');
const { authMiddleware, authorize } = require('../middleware/auth');

// Public routes (anyone can create order)
router.post('/', validateOrder, createOrder);

// Protected routes (admin/bucatarie/staff)
router.get('/', authMiddleware, authorize('admin', 'bucatarie', 'staff'), getOrders);
router.get('/:id', authMiddleware, authorize('admin', 'bucatarie', 'staff'), getOrder);
router.put('/:id/status', authMiddleware, authorize('admin', 'bucatarie', 'staff'), validateOrderStatus, updateOrderStatus);
router.put('/:id/payment', authMiddleware, authorize('admin'), updatePaymentStatus);
router.delete('/:id', authMiddleware, authorize('admin'), deleteOrder);

module.exports = router;