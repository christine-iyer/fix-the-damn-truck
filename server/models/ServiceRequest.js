const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    mechanic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'question', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    question: {
        type: String,
        trim: true,
        maxlength: 500
    },
    // Service details
    serviceType: {
        type: String,
        enum: ['repair', 'maintenance', 'inspection', 'diagnostic', 'emergency'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    estimatedCost: { type: Number, min: 0 },
    actualCost: { type: Number, min: 0 },
    estimatedDuration: { type: Number, min: 0 }, // in hours
    actualDuration: { type: Number, min: 0 }, // in hours
    // Location and scheduling
    preferredDate: { type: Date },
    preferredTime: { type: String },
    location: {
        type: String,
        enum: ['customer_location', 'mechanic_shop', 'mobile_service'],
        default: 'customer_location'
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true }
    },
    // Service history
    scheduledDate: { type: Date },
    completedDate: { type: Date },
    notes: [{
        text: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Indexes for better performance
serviceRequestSchema.index({ customer: 1 });
serviceRequestSchema.index({ vehicle: 1 });
serviceRequestSchema.index({ mechanic: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ serviceType: 1 });
serviceRequestSchema.index({ createdAt: -1 });
serviceRequestSchema.index({ scheduledDate: 1 });

// Virtual for customer vehicles (for backward compatibility)
serviceRequestSchema.virtual('vehicleInfo', {
    ref: 'Vehicle',
    localField: 'vehicle',
    foreignField: '_id',
    justOne: true
});

// Ensure virtual fields are serialized
serviceRequestSchema.set('toJSON', { virtuals: true });
serviceRequestSchema.set('toObject', { virtuals: true });

// Instance methods
serviceRequestSchema.methods.addNote = function (text, authorId) {
    this.notes.push({
        text,
        author: authorId,
        createdAt: new Date()
    });
};

serviceRequestSchema.methods.updateStatus = function (newStatus, userId) {
    const oldStatus = this.status;
    this.status = newStatus;

    // Add automatic note for status changes
    this.addNote(`Status changed from ${oldStatus} to ${newStatus}`, userId);

    // Set completion date if completed
    if (newStatus === 'completed') {
        this.completedDate = new Date();
    }
};

serviceRequestSchema.methods.assignMechanic = function (mechanicId, userId) {
    this.mechanic = mechanicId;
    this.addNote(`Assigned to mechanic`, userId);
};

serviceRequestSchema.methods.scheduleService = function (date, userId) {
    this.scheduledDate = date;
    this.addNote(`Service scheduled for ${date.toDateString()}`, userId);
};

// Static methods
serviceRequestSchema.statics.findByCustomer = function (customerId) {
    return this.find({ customer: customerId }).populate('vehicle').sort({ createdAt: -1 });
};

serviceRequestSchema.statics.findByMechanic = function (mechanicId) {
    return this.find({ mechanic: mechanicId }).populate('vehicle customer').sort({ createdAt: -1 });
};

serviceRequestSchema.statics.findByStatus = function (status) {
    return this.find({ status }).populate('vehicle customer mechanic').sort({ createdAt: -1 });
};

serviceRequestSchema.statics.findByVehicle = function (vehicleId) {
    return this.find({ vehicle: vehicleId }).populate('customer mechanic').sort({ createdAt: -1 });
};

serviceRequestSchema.statics.findPendingRequests = function () {
    return this.find({ status: 'pending' }).populate('vehicle customer').sort({ createdAt: -1 });
};

// Pre-save middleware to validate customer is actually a customer
serviceRequestSchema.pre('save', async function (next) {
    if (this.isModified('customer')) {
        const User = mongoose.model('User');
        const customer = await User.findById(this.customer);
        if (!customer || customer.role !== 'customer') {
            return next(new Error('Service request must belong to a valid customer'));
        }
    }
    next();
});

// Pre-save middleware to validate vehicle belongs to customer
serviceRequestSchema.pre('save', async function (next) {
    if (this.isModified('vehicle') || this.isModified('customer')) {
        const Vehicle = mongoose.model('Vehicle');
        const vehicle = await Vehicle.findById(this.vehicle);
        if (!vehicle || !vehicle.customer.equals(this.customer)) {
            return next(new Error('Vehicle must belong to the customer making the request'));
        }
    }
    next();
});

// Pre-save middleware to validate mechanic is actually a mechanic
serviceRequestSchema.pre('save', async function (next) {
    if (this.mechanic && this.isModified('mechanic')) {
        const User = mongoose.model('User');
        const mechanic = await User.findById(this.mechanic);
        if (!mechanic || mechanic.role !== 'mechanic') {
            return next(new Error('Mechanic must be a valid mechanic user'));
        }
    }
    next();
});

// Pre-delete middleware to update customer's serviceRequests array
serviceRequestSchema.pre('deleteOne', async function (next) {
    const serviceRequestId = this.getQuery()._id;

    // Remove from customer's serviceRequests array
    const User = mongoose.model('User');
    await User.updateMany(
        { serviceRequests: serviceRequestId },
        { $pull: { serviceRequests: serviceRequestId } }
    );

    next();
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;
