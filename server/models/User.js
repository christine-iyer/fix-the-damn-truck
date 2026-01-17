const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Joi = require('joi');

// Base User Schema with common fields
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        validate: {
            validator: function (username) {
                // Use Joi for username validation
                const usernameSchema = Joi.string()
                    .alphanum() // Only alphanumeric characters
                    .min(3)
                    .max(30)
                    .required()
                    .messages({
                        'string.alphanum': 'Username must contain only letters and numbers',
                        'string.min': 'Username must be at least 3 characters long',
                        'string.max': 'Username must be no more than 30 characters long'
                    });

                const { error } = usernameSchema.validate(username);
                return !error;
            },
            message: 'Username must be 3-30 characters long and contain only letters and numbers'
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (email) {
                // Use Joi for comprehensive email validation
                const emailSchema = Joi.string()
                    .email({
                        tlds: { allow: true }, // Allow all TLDs
                        minDomainSegments: 2,  // Must have at least domain.tld
                        maxDomainSegments: 5   // Reasonable limit for subdomains
                    })
                    .max(254) // RFC 5321 limit
                    .required();

                const { error } = emailSchema.validate(email);
                return !error;
            },
            message: 'Please provide a valid email address'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 25,
        validate: {
            validator: function (password) {
                // Use Joi for comprehensive password validation
                const passwordSchema = Joi.string()
                    .min(8)
                    .max(25)
                    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
                    .required()
                    .messages({
                        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol',
                        'string.min': 'Password must be at least 8 characters long',
                        'string.max': 'Password must be no more than 25 characters long'
                    });

                const { error } = passwordSchema.validate(password);
                return !error;
            },
            message: 'Password must be 8-25 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol (!@#$%^&*()_+-=[]{}|;:,.<>?)'
        }
    },
    role: {
        type: String,
        enum: ['admin', 'customer', 'mechanic'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'banned'],
        default: 'pending'
    },
    // Common timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    discriminatorKey: 'role' // This enables inheritance
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to validate user data using Joi
userSchema.statics.validateUserData = function (userData) {
    const userSchema = Joi.object({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required()
            .messages({
                'string.alphanum': 'Username must contain only letters and numbers',
                'string.min': 'Username must be at least 3 characters long',
                'string.max': 'Username must be no more than 30 characters long',
                'any.required': 'Username is required'
            }),
        email: Joi.string()
            .email({
                tlds: { allow: true },
                minDomainSegments: 2,
                maxDomainSegments: 5
            })
            .max(254)
            .required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'string.max': 'Email address is too long',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .min(8)
            .max(25)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
            .required()
            .messages({
                'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol',
                'string.min': 'Password must be at least 8 characters long',
                'string.max': 'Password must be no more than 25 characters long',
                'any.required': 'Password is required'
            }),
        role: Joi.string()
            .valid('admin', 'customer', 'mechanic')
            .required()
            .messages({
                'any.only': 'Role must be admin, customer, or mechanic',
                'any.required': 'Role is required'
            })
    });

    return userSchema.validate(userData, { abortEarly: false });
};

// Create the base User model
const User = mongoose.model('User', userSchema);

module.exports = User;