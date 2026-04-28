const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  changePassword,
  getUsers,
  updateUser,
  deleteUser
} = require('../controllers/authController');
const { validateLogin, validateRegister, validateChangePassword } = require('../middleware/validators');
const { authMiddleware, authorize } = require('../middleware/auth');

// @route   POST /api/auth/register
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
router.post('/login', validateLogin, login);

// @route   GET /api/auth/me
router.get('/me', authMiddleware, getMe);

// @route   PUT /api/auth/change-password
router.put('/change-password', authMiddleware, validateChangePassword, changePassword);

// @route   GET /api/auth/users (admin only)
router.get('/users', authMiddleware, authorize('admin'), getUsers);

// @route   PUT /api/auth/users/:id (admin only)
router.put('/users/:id', authMiddleware, authorize('admin'), updateUser);

// @route   DELETE /api/auth/users/:id (admin only)
router.delete('/users/:id', authMiddleware, authorize('admin'), deleteUser);

module.exports = router;