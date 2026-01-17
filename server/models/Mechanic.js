const mongoose = require('mongoose');
const User = require('./User');

// Mechanic-specific schema
const mechanicSchema = new mongoose.Schema({
    // Mechanic-specific fields
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
    // Professional information
    specialization: {
        type: [String],
        default: [],
        enum: ['Engine Repair', 'Brake Systems', 'Electrical', 'AC/Heating', 'Suspension', 'Exhaust', 'Diagnostics', 'General Maintenance']
    },
    experience: {
        type: Number,
        default: 0,
        min: 0,
        max: 50
    }, // years of experience
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: { type: Number, default: 0 },
    // Location and availability
    location: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 },
        address: { type: String, trim: true },
        serviceRadius: { type: Number, default: 25 } // miles
    },
    availability: {
        isAvailable: { type: Boolean, default: true },
        workingHours: {
            monday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
            tuesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
            wednesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
            thursday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
            friday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
            saturday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
            sunday: { start: String, end: String, isWorking: { type: Boolean, default: false } }
        },
        timezone: { type: String, default: 'UTC' }
    },
    // Professional credentials
    certifications: [{
        documents: [],
        name: { type: String }, // Made optional
        issuingBody: { type: String }, // Made optional
        issueDate: { type: Date }, // Made optional
        expiryDate: { type: Date },
        certificateNumber: { type: String }
    }],
    // Business information
    businessInfo: {
        businessName: { type: String, trim: true },
        businessLicense: { type: String, trim: true },
        insuranceProvider: { type: String, trim: true },
        insurancePolicyNumber: { type: String, trim: true },
        insuranceExpiry: { type: Date }
    },
    // Performance metrics
    performance: {
        jobsCompleted: { type: Number, default: 0 },
        averageJobTime: { type: Number, default: 0 }, // in hours
        onTimeRate: { type: Number, default: 100 }, // percentage
        customerSatisfaction: { type: Number, default: 0 },
        repeatCustomerRate: { type: Number, default: 0 }
    },
    // Financial information
    pricing: {
        hourlyRate: { type: Number, default: 0 },
        minimumCharge: { type: Number, default: 0 },
        travelFee: { type: Number, default: 0 },
        acceptsInsurance: { type: Boolean, default: false }
    },
    // Equipment and tools
    equipment: [{
        name: { type: String, required: true },
        type: { type: String, enum: ['diagnostic', 'repair', 'specialty', 'general'] },
        condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'], default: 'good' }
    }],
    // Verification and background
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    backgroundCheckPassed: { type: Boolean, default: false },
    backgroundCheckDate: { type: Date }
});

// Mechanic-specific methods
mechanicSchema.methods.addServiceRequest = function (serviceRequestId) {
    if (!this.serviceRequests.includes(serviceRequestId)) {
        this.serviceRequests.push(serviceRequestId);
    }
};

mechanicSchema.methods.removeServiceRequest = function (serviceRequestId) {
    this.serviceRequests = this.serviceRequests.filter(id => !id.equals(serviceRequestId));
};

mechanicSchema.methods.updateRating = function (newRating) {
    const totalRating = (this.rating * this.totalRatings) + newRating;
    this.totalRatings += 1;
    this.rating = totalRating / this.totalRatings;
};

mechanicSchema.methods.addSpecialization = function (specialization) {
    if (!this.specialization.includes(specialization)) {
        this.specialization.push(specialization);
    }
};

mechanicSchema.methods.removeSpecialization = function (specialization) {
    this.specialization = this.specialization.filter(s => s !== specialization);
};

mechanicSchema.methods.isAvailableAt = function (date, time) {
    if (!this.availability.isAvailable) return false;

    const dayOfWeek = date.toLocaleLowerCase();
    const daySchedule = this.availability.workingHours[dayOfWeek];

    if (!daySchedule || !daySchedule.isWorking) return false;

    // Simple time comparison (you might want to use a more sophisticated time library)
    return time >= daySchedule.start && time <= daySchedule.end;
};

mechanicSchema.methods.addCertification = function (certification) {
    this.certifications.push(certification);
};

mechanicSchema.methods.getExpiredCertifications = function () {
    const now = new Date();
    return this.certifications.filter(cert => cert.expiryDate && cert.expiryDate < now);
};

mechanicSchema.methods.updatePerformance = function (jobTime, onTime, customerSatisfied) {
    this.performance.jobsCompleted += 1;

    // Update average job time
    const totalTime = (this.performance.averageJobTime * (this.performance.jobsCompleted - 1)) + jobTime;
    this.performance.averageJobTime = totalTime / this.performance.jobsCompleted;

    // Update on-time rate
    const totalOnTime = (this.performance.onTimeRate * (this.performance.jobsCompleted - 1)) + (onTime ? 100 : 0);
    this.performance.onTimeRate = totalOnTime / this.performance.jobsCompleted;

    // Update customer satisfaction
    const totalSatisfaction = (this.performance.customerSatisfaction * (this.performance.jobsCompleted - 1)) + (customerSatisfied ? 100 : 0);
    this.performance.customerSatisfaction = totalSatisfaction / this.performance.jobsCompleted;
};

// Mechanic-specific static methods
mechanicSchema.statics.findBySpecialization = function (specialization) {
    return this.find({ specialization: specialization });
};

mechanicSchema.statics.findByLocation = function (latitude, longitude, radius = 25) {
    return this.find({
        'location.latitude': {
            $gte: latitude - (radius / 69), // rough conversion: 1 degree ≈ 69 miles
            $lte: latitude + (radius / 69)
        },
        'location.longitude': {
            $gte: longitude - (radius / 69),
            $lte: longitude + (radius / 69)
        },
        'availability.isAvailable': true
    });
};

mechanicSchema.statics.findTopRated = function (limit = 10) {
    return this.find({ rating: { $gte: 4.0 } })
        .sort({ rating: -1, totalRatings: -1 })
        .limit(limit);
};

mechanicSchema.statics.findByExperience = function (minYears) {
    return this.find({ experience: { $gte: minYears } }).sort({ experience: -1 });
};

// Create Mechanic discriminator
const Mechanic = User.discriminator('mechanic', mechanicSchema);

module.exports = Mechanic;
