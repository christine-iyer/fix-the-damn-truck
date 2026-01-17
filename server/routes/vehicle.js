const express = require("express"); 
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Customer = require('../models/Customer'); 
const Vehicle = require("../models/Vehicle");

router.use(authMiddleware); // only logged-in users can access

// POST /api/vehicles - create a new vehicle for logged-in customer
router.post('/', async (req, res) => {
    try {
        const { make, model, year, vin, licensePlate, color, isPrimary } = req.body;

        const vehicle = new Vehicle({
            customer: req.user.id, // make sure auth sets this
            make,
            model,
            year,
            vin,
            licensePlate,
            color,
            isPrimary: !!isPrimary
        });

        await vehicle.save();
        res.status(201).json(vehicle);
    } catch (err) {
        console.error(err);
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
