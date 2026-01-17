const express = require("express"); 
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Customer = require('../models/Customer'); 
const Vehicle = require("../models/Vehicle");

router.use(authMiddleware); // only logged-in users can access

// POST /api/vehicles - create a new vehicle for logged-in customer
router.post('/', async (req, res) => {
    try {
        const { make, model, year, vin, licensePlate, color, isPrimary, ownerId } = req.body;

        // Use ownerId from request body if provided, otherwise use authenticated user's ID
        const customerId = ownerId || req.user.id;

        // Check if this is the customer's first vehicle to set as primary
        const existingVehicles = await Vehicle.countDocuments({ customer: customerId });
        const shouldBePrimary = existingVehicles === 0 || isPrimary;

        const vehicle = new Vehicle({
            customer: customerId,
            make,
            model,
            year,
            vin,
            licensePlate,
            color,
            isPrimary: shouldBePrimary
        });

        await vehicle.save();
        
        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully',
            vehicle
        });
    } catch (err) {
        console.error('Error creating vehicle:', err);
        res.status(400).json({ error: err.message });
    }
});

// GET /api/vehicles - get all vehicles for logged-in customer
router.get('/', async (req, res) => {
    try {

        console.log('🔍 req.user.id:', req.user.id);
        console.log('🔍 req.user.role:', req.user.role);
        console.log('🔍 Full req.user:', req.user);

        const customer = await Customer.findById(req.user.id);
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        const vehicles = await customer.getVehicles();

        if (!vehicles.length) {
            return res.status(200).json({
                message: "No vehicles found for this customer",
                vehicles: []
            });
        }

        res.json(vehicles);
    } catch (error) {
        console.error('Error fetching vehicles', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
