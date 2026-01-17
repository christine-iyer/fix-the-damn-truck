const mongoose = require('mongoose');

// Vehicle schema - separate model for proper data normalization
const vehicleSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    make: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear() + 1
    },
    vin: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                // VIN should be 17 characters if provided
                return !v || v.length === 17;
            },
            message: 'VIN must be 17 characters long'
        }
    },
    licensePlate: {
        type: String,
        trim: true,
        uppercase: true
    },
    color: {
        type: String,
        trim: true
    },
    mileage: {
        type: Number,
        min: 0
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    // Vehicle status and history
    status: {
        type: String,
        enum: ['active', 'inactive', 'sold', 'totaled'],
        default: 'active'
    },
    purchaseDate: { type: Date },
    lastServiceDate: { type: Date },
    nextServiceDue: { type: Date },
    // Insurance information
    insurance: {
        provider: { type: String, trim: true },
        policyNumber: { type: String, trim: true },
        expiryDate: { type: Date }
    }
}, {
    timestamps: true
});

// Indexes for better performance
vehicleSchema.index({ customer: 1 });
vehicleSchema.index({ customer: 1, isPrimary: 1 });
vehicleSchema.index({ vin: 1 }, { sparse: true });
vehicleSchema.index({ licensePlate: 1 }, { sparse: true });

// Virtual for service requests
vehicleSchema.virtual('serviceRequests', {
    ref: 'ServiceRequest',
    localField: '_id',
    foreignField: 'vehicle'
});

// Ensure virtual fields are serialized
vehicleSchema.set('toJSON', { virtuals: true });
vehicleSchema.set('toObject', { virtuals: true });

// Instance methods
vehicleSchema.methods.updateMileage = function (newMileage) {
    if (newMileage < this.mileage) {
        throw new Error('New mileage cannot be less than current mileage');
    }
    this.mileage = newMileage;
    this.lastServiceDate = new Date();
};

vehicleSchema.methods.setAsPrimary = async function () {
    // Unset other primary vehicles for this customer
    await this.constructor.updateMany(
        { customer: this.customer, _id: { $ne: this._id } },
        { $set: { isPrimary: false } }
    );
    this.isPrimary = true;
};

vehicleSchema.methods.getServiceHistory = function () {
    return this.constructor.model('ServiceRequest').find({ vehicle: this._id })
        .sort({ createdAt: -1 });
};

// Static methods
vehicleSchema.statics.findByCustomer = function (customerId) {
    return this.find({ customer: customerId }).sort({ isPrimary: -1, createdAt: -1 });
};

vehicleSchema.statics.findPrimaryVehicle = function (customerId) {
    return this.findOne({ customer: customerId, isPrimary: true });
};

vehicleSchema.statics.findByMake = function (make) {
    return this.find({ make: new RegExp(make, 'i') });
};

vehicleSchema.statics.findByYearRange = function (startYear, endYear) {
    return this.find({ year: { $gte: startYear, $lte: endYear } });
};

// Pre-save middleware to ensure only one primary vehicle per customer
vehicleSchema.pre('save', async function (next) {
    if (this.isPrimary && this.isModified('isPrimary')) {
        // Unset other primary vehicles for this customer
        await this.constructor.updateMany(
            { customer: this.customer, _id: { $ne: this._id } },
            { $set: { isPrimary: false } }
        );
    }
    next();
});

// Pre-save middleware to validate customer is actually a customer
vehicleSchema.pre('save', async function (next) {
    if (this.isModified('customer')) {
        const User = mongoose.model('User');
        const customer = await User.findById(this.customer);
        if (!customer || customer.role !== 'customer') {
            return next(new Error('Vehicle must belong to a valid customer'));
        }
    }
    next();
});

// Pre-delete middleware to handle cascade operations
vehicleSchema.pre('deleteOne', async function (next) {
    const vehicleId = this.getQuery()._id;

    // Update or delete related service requests
    const ServiceRequest = mongoose.model('ServiceRequest');
    await ServiceRequest.updateMany(
        { vehicle: vehicleId },
        { $unset: { vehicle: 1 } }
    );

    next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
