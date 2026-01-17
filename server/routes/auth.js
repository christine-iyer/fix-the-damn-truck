const express = require('express');
const { register, login, getProfile, updateProfile, changePassword, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Single registration endpoint - role determined by user choice in request body
router.post('/register', register);

// Login endpoint
router.post('/login', login);

router.use(authMiddleware);

// Profile management endpoints (require authentication)
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/logout', logout);

module.exports = router;