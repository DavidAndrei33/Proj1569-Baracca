const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { validateProduct } = require('../middleware/validators');
const { authMiddleware, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes (admin only)
router.post('/', authMiddleware, authorize('admin'), validateProduct, createProduct);
router.put('/:id', authMiddleware, authorize('admin'), validateProduct, updateProduct);
router.delete('/:id', authMiddleware, authorize('admin'), deleteProduct);

module.exports = router;