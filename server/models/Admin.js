const mongoose = require('mongoose');
const User = require('./User');

// Admin-specific schema
const adminSchema = new mongoose.Schema({
    // Admin-specific fields
    permissions: {
        type: [String],
        default: ['read', 'write', 'delete'],
        enum: ['read', 'write', 'delete', 'manage_users', 'manage_system', 'view_analytics']
    },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    accountLocked: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    // Admin can have access to multiple departments/areas
    departments: {
        type: [String],
        default: ['general'],
        enum: ['general', 'customer_service', 'mechanic_management', 'financial', 'technical']
    },
    // Admin can have different clearance levels
    clearanceLevel: {
        type: String,
        enum: ['basic', 'senior', 'supervisor', 'director'],
        default: 'basic'
    }
});

// Admin-specific methods
adminSchema.methods.hasPermission = function (permission) {
    return this.permissions.includes(permission);
};

adminSchema.methods.addPermission = function (permission) {
    if (!this.permissions.includes(permission)) {
        this.permissions.push(permission);
    }
};

adminSchema.methods.removePermission = function (permission) {
    this.permissions = this.permissions.filter(p => p !== permission);
};

adminSchema.methods.canManageUser = function (userRole) {
    const roleHierarchy = {
        'director': ['admin', 'mechanic', 'customer'],
        'supervisor': ['mechanic', 'customer'],
        'senior': ['customer'],
        'basic': []
    };
    return roleHierarchy[this.clearanceLevel]?.includes(userRole) || false;
};

// Admin-specific static methods
adminSchema.statics.findByDepartment = function (department) {
    return this.find({ departments: department });
};

adminSchema.statics.findByClearanceLevel = function (level) {
    return this.find({ clearanceLevel: level });
};

// Create Admin discriminator
const Admin = User.discriminator('admin', adminSchema);

module.exports = Admin;
