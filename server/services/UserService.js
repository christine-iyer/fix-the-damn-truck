const User = require('../models/User');
const Customer = require('../models/Customer');
const Mechanic = require('../models/Mechanic');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');

class UserService {
    /**
     * Get all users with filtering and pagination
     */
    static async getAllUsers(filters) {
        const { userType, status, page = 1, limit = 10 } = filters;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build match filter
        const matchFilter = {};
        if (status) {
            matchFilter.status = status;
        }
        if (userType) {
            matchFilter.role = userType;
        }

        // Use aggregation pipeline for unified querying
        const pipeline = [
            { $match: matchFilter },
            { $project: { password: 0 } },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limitNum }
                    ],
                    count: [
                        { $count: "total" }
                    ]
                }
            }
        ];

        const [result] = await User.aggregate(pipeline);
        return {
            users: result.data,
            totalCount: result.count[0]?.total || 0
        };
    }


    /**
     * Get user by ID (works with unified User model)
     */
    static async getUserById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid user ID');
        }

        const user = await User.findById(id).select('-password');
        if (user) {
            return { user, userType: user.role };
        }

        return null;
    }

    /**
     * Update user status (works with unified User model)
     */
    static async updateUserStatus(id, status) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid user ID');
        }

        if (!['pending', 'approved', 'banned'].includes(status)) {
            throw new Error('Invalid status. Must be pending, approved, or banned');
        }

        const user = await User.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).select('-password');

        if (user) {
            return { user, userType: user.role };
        }

        return null;
    }

    /**
     * Approve user (convenience method)
     */
    static async approveUser(id) {
        return this.updateUserStatus(id, 'approved');
    }

    /**
     * Ban user (convenience method)
     */
    static async banUser(id) {
        return this.updateUserStatus(id, 'banned');
    }

    /**
     * Delete user (works with unified User model, except admin)
     */
    static async deleteUser(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid user ID');
        }

        const user = await User.findById(id);
        if (!user) {
            throw new Error('User not found or cannot be deleted');
        }

        // Don't allow deleting admin users for security reasons
        if (user.role === 'admin') {
            throw new Error('Admin users cannot be deleted');
        }

        await User.findByIdAndDelete(id);
        return { message: `${user.role} deleted successfully` };
    }

    /**
     * Get comprehensive user statistics for admin dashboard
     */
    static async getUserStats() {
        const pipeline = [
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    // Role breakdown
                    totalCustomers: {
                        $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] }
                    },
                    totalMechanics: {
                        $sum: { $cond: [{ $eq: ['$role', 'mechanic'] }, 1, 0] }
                    },
                    totalAdmins: {
                        $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
                    },
                    // Status breakdown
                    approvedUsers: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    },
                    pendingUsers: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    bannedUsers: {
                        $sum: { $cond: [{ $eq: ['$status', 'banned'] }, 1, 0] }
                    },
                    // Recent activity (last 30 days)
                    recentSignups: {
                        $sum: {
                            $cond: [
                                {
                                    $gte: [
                                        '$createdAt',
                                        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalUsers: 1,
                    roleBreakdown: {
                        customers: '$totalCustomers',
                        mechanics: '$totalMechanics',
                        admins: '$totalAdmins'
                    },
                    statusBreakdown: {
                        approved: '$approvedUsers',
                        pending: '$pendingUsers',
                        banned: '$bannedUsers'
                    },
                    recentActivity: {
                        signupsLast30Days: '$recentSignups'
                    },
                    // Calculate percentages
                    approvalRate: {
                        $round: [
                            {
                                $multiply: [
                                    { $divide: ['$approvedUsers', '$totalUsers'] },
                                    100
                                ]
                            },
                            2
                        ]
                    }
                }
            }
        ];

        const [stats] = await User.aggregate(pipeline);

        // If no users exist, return default structure
        if (!stats) {
            return {
                totalUsers: 0,
                roleBreakdown: { customers: 0, mechanics: 0, admins: 0 },
                statusBreakdown: { approved: 0, pending: 0, banned: 0 },
                recentActivity: { signupsLast30Days: 0 },
                approvalRate: 0
            };
        }

        return stats;
    }
}

module.exports = UserService;
