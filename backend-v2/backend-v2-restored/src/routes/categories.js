const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { validateCategory } = require('../middleware/validators');
const { authMiddleware, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes (admin only)
router.post('/', authMiddleware, authorize('admin'), validateCategory, createCategory);
router.put('/:id', authMiddleware, authorize('admin'), validateCategory, updateCategory);
router.delete('/:id', authMiddleware, authorize('admin'), deleteCategory);

module.exports = router;