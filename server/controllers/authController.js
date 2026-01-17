const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Mechanic = require('../models/Mechanic');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_long_and_random';

/**
 * Unified registration for all user roles
 * Role is determined by user choice in the request body
 */
const register = async (req, res) => {
    try {
        const { username, email, password, role, ...roleSpecificData } = req.body;

        // Use Joi validation for comprehensive input validation
        const validation = User.validateUserData({ username, email, password, role });
        if (validation.error) {
            const errorMessages = validation.error.details.map(detail => detail.message);
            return res.status(400).json({
                error: 'Validation failed',
                details: errorMessages,
                validRoles: ['admin', 'customer', 'mechanic']
            });
        }

        // Check if email already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create user based on role
        let user;
        const baseUserData = { username, email, password, role };

        // Check if this is the first admin (special case)
        const isFirstAdmin = role === 'admin' && process.env.ALLOW_FIRST_ADMIN === 'true';
        if (isFirstAdmin) {
            // Check if any admin already exists
            const existingAdmin = await Admin.findOne({ role: 'admin' });
            if (existingAdmin) {
                return res.status(400).json({
                    error: 'Admin registration is not allowed. Contact system administrator.'
                });
            }
            // First admin gets approved status
            baseUserData.status = 'approved';
        }

        switch (role) {
            case 'customer':
                user = new Customer({
                    ...baseUserData,
                    ...roleSpecificData
                });
                break;
            case 'mechanic':
                user = new Mechanic({
                    ...baseUserData,
                    ...roleSpecificData
                });
                break;
            case 'admin':
                user = new Admin({
                    ...baseUserData,
                    ...roleSpecificData
                });
                break;
            default:
                return res.status(400).json({ error: 'Invalid role' });
        }

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, userType: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Return user data (excluding password) and token
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
            token,
            user: userResponse,
            nextSteps: isFirstAdmin
                ? 'You are the first admin and have been automatically approved. You can now access admin features.'
                : 'Your account is pending approval. You will be notified once approved by an administrator.'
        });

    } catch (error) {
        console.error('Registration error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'Email already exists'
            });
        }

        res.status(500).json({
            error: 'Registration failed',
            details: error.message
        });
    }
};

/**
 * Login for all user roles
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if user is approved (all users including admins need approval)
        if (user.status === 'pending') {
            return res.status(403).json({
                error: 'Account pending approval. Please wait for administrator approval.'
            });
        }

        // Check if user is banned
        if (user.status === 'banned') {
            return res.status(403).json({
                error: 'Account has been banned. Please contact support.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, userType: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Return user data (excluding password) and token
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            message: 'Login successful',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            details: error.message
        });
    }
};

/**
 * Get current user profile using jwt token
 */
const getProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Failed to get profile',
            details: error.message
        });
    }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userId = req.user.id;
        const updateData = req.body;

        // Remove sensitive fields that shouldn't be updated via this endpoint
        delete updateData.password;
        delete updateData.role;
        delete updateData.status;
        delete updateData._id;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user
        });

    } catch (error) {
        console.error('Update profile error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        res.status(500).json({
            error: 'Failed to update profile',
            details: error.message
        });
    }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Current password and new password are required'
            });
        }

        // Get user to determine their role for validation
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Use Joi validation for new password with user's actual role
        const passwordValidation = User.validateUserData({
            username: user.username,
            email: user.email,
            password: newPassword,
            role: user.role
        });

        if (passwordValidation.error) {
            const passwordErrors = passwordValidation.error.details
                .filter(detail => detail.path.includes('password'))
                .map(detail => detail.message);

            if (passwordErrors.length > 0) {
                return res.status(400).json({
                    error: 'New password validation failed',
                    details: passwordErrors
                });
            }
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            error: 'Failed to change password',
            details: error.message
        });
    }
};

/**
 * Logout (client-side token removal with server-side logging)
 */
const logout = async (req, res) => {
    try {
        // JWT validation is handled by authMiddleware before this function
        // We have access to req.user from the validated token

        const userId = req.user.id;
        const userRole = req.user.userType;

        // Log the logout event for audit purposes
        console.log(`User ${userId} (${userRole}) logged out at ${new Date().toISOString()}`);

        // Future: Could implement token blacklisting here
        // For now, we rely on client-side token removal

        res.json({
            message: 'Logout successful',
            timestamp: new Date().toISOString(),
            userId: userId
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Logout failed',
            details: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout
};
