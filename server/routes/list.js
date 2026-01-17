const express = require('express');
const Customer = require('../models/Customer');
const Mechanic = require('../models/Mechanic');
const auth = require('../middleware/auth');

const router = express.Router();

// List all mechanics
router.get('/mechanics', auth, async (req, res) => {
  try {
    const mechanics = await Mechanic.find({}, '-password');
    res.json(mechanics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get profile of a mechanic to enable creating and editing profile
router.get('/mechanics/:id', auth, async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id, '-password');
    if (!mechanic) return res.status(404).json({ error: 'Mechanic not found' });
    res.json(mechanic);
  } catch (err) {
    console.error('Mechanic update error:', err);
    res.status(500).json({ error: err.message });
  }

});

// Update mechanic profile by ID
router.put('/mechanics/:id', auth, async (req, res) => {
  try {
    const mechanic = await Mechanic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!mechanic) return res.status(404).json({ error: 'Mechanic not found' });
    res.json(mechanic);
  } catch (err) {
    console.error('Mechanic update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// List all customers
router.get('/customers', auth, async (req, res) => {
  try {
    const customers = await Customer.find({}, '-password');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;