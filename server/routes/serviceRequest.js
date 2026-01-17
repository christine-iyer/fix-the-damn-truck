const express = require('express');
const ServiceRequest = require('../models/ServiceRequest');
const Customer = require('../models/Customer');
const Mechanic = require('../models/Mechanic');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');
const { findOrCreateVehicle } = require('../utils/vehicleHelper');

const router = express.Router();

// Customer creates a service request
router.post('/', auth, async (req, res) => {
    try {
        const { mechanicId, vehicleData, description, serviceType, priority } = req.body;
        const customerId = req.user.id;

        // Step 1: Validate required fields
        if (!vehicleData || !vehicleData.make || !vehicleData.model || !vehicleData.year) {
            return res.status(400).json({
                error: 'Vehicle data with make, model, and year is required'
            });
        }

        if (!description) {
            return res.status(400).json({ error: 'Service description is required' });
        }

        // Step 2: Find or create vehicle
        const vehicle = await findOrCreateVehicle(customerId, vehicleData);

        // Step 3: Create service request
        const serviceRequestData = {
            customer: customerId,
            vehicle: vehicle._id,
            description,
            serviceType,
            priority,
            status: 'pending'
        };

        // Add optional fields if provided
        if (mechanicId) serviceRequestData.mechanic = mechanicId;
        if (question) serviceRequestData.question = question;
        if (preferredDate) serviceRequestData.preferredDate = new Date(preferredDate);
        if (preferredTime) serviceRequestData.preferredTime = preferredTime;
        if (location) serviceRequestData.location = location;
        if (address) serviceRequestData.address = address;

        const serviceRequest = new ServiceRequest(serviceRequestData);
        await serviceRequest.save();

        // Step 4: Update related collections
        await Customer.findByIdAndUpdate(customerId, {
            $push: { serviceRequests: serviceRequest._id }
        });

        if (mechanicId) {
            await Mechanic.findByIdAndUpdate(mechanicId, {
                $push: { serviceRequests: serviceRequest._id }
            });
        }

        // Step 5: Return populated service request
        const populatedRequest = await ServiceRequest.findById(serviceRequest._id)
            .populate('customer', 'username email')
            .populate('mechanic', 'username email')
            .populate('vehicle');

        res.status(201).json({
            success: true,
            message: 'Service request created successfully',
            serviceRequest: populatedRequest
        });

    } catch (err) {
        console.error('Service request creation error:', err);
        res.status(500).json({
            error: 'Failed to create service request',
            details: err.message
        });
    }
});

// Mechanic updates service request status (accept/reject/question)
router.put('/:id', auth, async (req, res) => {
    try {
        const { status, question } = req.body;
        const serviceRequest = await ServiceRequest.findById(req.params.id);
        if (!serviceRequest) return res.status(404).json({ error: 'Service request not found' });
        // Only mechanic assigned to request can update
        if (serviceRequest.mechanic.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        if (status) serviceRequest.status = status;
        if (question) serviceRequest.question = question;
        await serviceRequest.save();
        res.json(serviceRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Get a single mechanic by ID
router.get('/mechanics/:id', auth, async (req, res) => {
    try {
        const mechanic = await Mechanic.findById(req.params.id, '-password');
        if (!mechanic) return res.status(404).json({ error: 'Mechanic not found' });
        res.json(mechanic);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all service requests for a mechanic
router.get('/mechanic/:mechanicId', auth, async (req, res) => {
    try {
        const requests = await ServiceRequest.find({ mechanic: req.params.mechanicId }).populate('customer').populate('vehicle');
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all service requests for a customer
router.get('/customer/:customerId', auth, async (req, res) => {
    try {
        const requests = await ServiceRequest.find({ customer: req.params.customerId }).populate('mechanic').populate('vehicle');
        console.log(requests);
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
