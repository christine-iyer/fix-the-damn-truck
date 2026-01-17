const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    getAllUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    getUserStats
} = require('../controllers/admin/usercontroller');

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
};

// Apply authentication and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// User management routes
router.get('/users', getAllUsers);                    // GET /api/admin/users (It will give the list of all users(customers and mechanics))
router.get('/users/stats', getUserStats);            // GET /api/admin/users/stats (It will give the stats of all users(customers and mechanics))
router.get('/users/:id', getUserById);                // GET /api/admin/users/:id (It will give the details of the user by id)
// FIXME: Admin can add users
router.patch('/users/:id/status', updateUserStatus);  // PATCH /api/admin/users/:id/status (It will update the status of the user) (pending, approved, banned)
router.delete('/users/:id', deleteUser);              // DELETE /api/admin/users/:id (It will delete the user)

module.exports = router;
