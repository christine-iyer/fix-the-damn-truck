const UserService = require('../../services/UserService');
const User = require('../../models/User');
const Joi = require('joi');

// Validation schemas
const statusUpdateSchema = Joi.object({
    status: Joi.string().valid('pending', 'approved', 'banned').required()
});

// Helper function to log admin actions
const logAdminAction = (adminId, action, targetUserId, details = {}) => {
    console.log(`[ADMIN ACTION] Admin ${adminId} ${action} user ${targetUserId} at ${new Date().toISOString()}`, details);
};

// FIXME: Admin can add user.

// Helper function to check if admin can modify user
const canModifyUser = async (adminId, targetUserId, action) => {
    // Admin cannot modify themselves
    if (adminId === targetUserId) {
        throw new Error(`Cannot ${action} your own account`);
    }

    // Get both admin and target user
    const [adminUser, targetUser] = await Promise.all([
        User.findById(adminId),
        User.findById(targetUserId)
    ]);

    if (!adminUser) {
        throw new Error('Admin user not found');
    }
    if (!targetUser) {
        throw new Error('Target user not found');
    }

    // If target is an admin, check clearance levels
    if (targetUser.role === 'admin') {
        const clearanceHierarchy = {
            'director': 4,
            'supervisor': 3,
            'senior': 2,
            'basic': 1
        };

        const adminLevel = clearanceHierarchy[adminUser.clearanceLevel] || 0;
        const targetLevel = clearanceHierarchy[targetUser.clearanceLevel] || 0;

        // Admin can only modify users with lower clearance levels
        if (adminLevel <= targetLevel) {
            throw new Error(`Cannot ${action} admin accounts with equal or higher clearance level`);
        }
    }

    return targetUser;
};

// Get all users (customers and mechanics) using service layer
const getAllUsers = async (req, res) => {
    try {
        const { userType, status, page, limit } = req.query;

        const result = await UserService.getAllUsers({
            userType,
            status,
            page,
            limit
        });

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const totalPages = Math.ceil(result.totalCount / limitNum);

        res.json({
            users: result.users,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount: result.totalCount,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1,
                limit: limitNum
            }
        });
    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await UserService.getUserById(id);

        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error getting user by ID:', error);
        if (error.message === 'Invalid user ID') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};


// Update user status (approve/ban)
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const adminId = req.user.id;

        // Validate request body
        const { error: validationError } = statusUpdateSchema.validate({ status });
        if (validationError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validationError.details.map(detail => detail.message)
            });
        }

        // Check if admin can modify this user
        const targetUser = await canModifyUser(adminId, id, 'update status');

        const result = await UserService.updateUserStatus(id, status);

        // Log admin action
        logAdminAction(adminId, 'updated status', id, {
            userRole: result.user.role,
            previousStatus: targetUser.status,
            newStatus: status
        });

        res.json({
            message: `User status updated to ${status}`,
            user: result.user
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        if (error.message === 'Invalid user ID') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Invalid status. Must be pending, approved, or banned') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'User not found or cannot be deleted') {
            return res.status(404).json({ error: 'User not found' });
        }
        if (error.message.includes('Cannot') || error.message.includes('admin accounts')) {
            return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await UserService.deleteUser(id);

        res.json(result);
    } catch (error) {
        console.error('Error deleting user:', error);
        if (error.message === 'Invalid user ID') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'User not found or cannot be deleted') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// Get user statistics
const getUserStats = async (req, res) => {
    try {
        const stats = await UserService.getUserStats();
        res.json(stats);
    } catch (error) {
        console.error('Error getting user stats:', error);
        res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    getUserStats
};
