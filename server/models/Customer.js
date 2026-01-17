const mongoose = require('mongoose');
const User = require('./User');

// Customer-specific schema
const customerSchema = new mongoose.Schema({
    // Customer-specific fields
    serviceRequests: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'ServiceRequest',
        default: []
    },
    phoneNumber: {
        type: String,
        validate: {
            validator: function (v) {
                return /^\+?[\d\s\-\(\)]+$/.test(v);
            },
            message: 'Invalid phone number format'
        }
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true },
        country: { type: String, default: 'US', trim: true }
    },
    // Customer preferences and settings
    preferences: {
        preferredContactMethod: {
            type: String,
            enum: ['email', 'phone', 'sms'],
            default: 'email'
        },
        notificationSettings: {
            emailNotifications: { type: Boolean, default: true },
            smsNotifications: { type: Boolean, default: false },
            pushNotifications: { type: Boolean, default: true }
        },
        language: { type: String, default: 'en' },
        timezone: { type: String, default: 'UTC' }
    },
    // Customer loyalty and history
    loyaltyPoints: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    memberSince: { type: Date, default: Date.now },
    lastServiceDate: { type: Date },
    // Note: Vehicles are now stored in separate Vehicle model
    // Use virtual to access customer's vehicles
    // Customer verification
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    // Emergency contact
    emergencyContact: {
        name: { type: String },
        phone: { type: String },
        relationship: { type: String }
    }
});

// Virtual for customer's vehicles (references Vehicle model)
customerSchema.virtual('vehicles', {
    ref: 'Vehicle',
    localField: '_id',
    foreignField: 'customer'
});

// Ensure virtual fields are serialized
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

// Customer-specific methods
customerSchema.methods.addServiceRequest = function (serviceRequestId) {
    if (!this.serviceRequests.includes(serviceRequestId)) {
        this.serviceRequests.push(serviceRequestId);
    }
};

customerSchema.methods.removeServiceRequest = function (serviceRequestId) {
    this.serviceRequests = this.serviceRequests.filter(id => !id.equals(serviceRequestId));
};

customerSchema.methods.addVehicle = async function (vehicleData) {
    const Vehicle = require('./Vehicle');

    // Create new vehicle
    const vehicle = new Vehicle({
        ...vehicleData,
        customer: this._id
    });

    // If this is the first vehicle or marked as primary, make it primary
    const existingVehicles = await Vehicle.findByCustomer(this._id);
    if (existingVehicles.length === 0 || vehicleData.isPrimary) {
        vehicle.isPrimary = true;
    }

    return await vehicle.save();
};

customerSchema.methods.getPrimaryVehicle = async function () {
    const Vehicle = require('./Vehicle');
    return await Vehicle.findPrimaryVehicle(this._id);
};

customerSchema.methods.getVehicles = async function () {
    const Vehicle = require('./Vehicle');
    return await Vehicle.findByCustomer(this._id);
};

customerSchema.methods.addLoyaltyPoints = function (points) {
    this.loyaltyPoints += points;
};

customerSchema.methods.spendLoyaltyPoints = function (points) {
    if (this.loyaltyPoints >= points) {
        this.loyaltyPoints -= points;
        return true;
    }
    return false;
};

// Customer-specific static methods
customerSchema.statics.findByVehicleMake = async function (make) {
    const Vehicle = require('./Vehicle');
    const vehicles = await Vehicle.findByMake(make);
    const customerIds = vehicles.map(v => v.customer);
    return this.find({ _id: { $in: customerIds } });
};

customerSchema.statics.findByLocation = function (city, state) {
    const query = {};
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    return this.find(query);
};

customerSchema.statics.findHighValueCustomers = function (minSpent = 1000) {
    return this.find({ totalSpent: { $gte: minSpent } }).sort({ totalSpent: -1 });
};

// Pre-delete middleware to handle cascade operations
customerSchema.pre('deleteOne', async function (next) {
    const customerId = this.getQuery()._id;

    // Delete all vehicles belonging to this customer
    const Vehicle = require('./Vehicle');
    await Vehicle.deleteMany({ customer: customerId });

    // Delete all service requests for this customer
    const ServiceRequest = require('./ServiceRequest');
    await ServiceRequest.deleteMany({ customer: customerId });

    next();
});

// Create Customer discriminator
const Customer = User.discriminator('customer', customerSchema);

module.exports = Customer;
