const Vehicle = require('../models/Vehicle');

/**
 * Finds an existing vehicle or creates a new one for a customer
 * @param {string} customerId - The customer's ObjectId
 * @param {object} vehicleData - Vehicle information (make, model, year, etc.)
 * @returns {Promise<object>} - The vehicle document
 */
async function findOrCreateVehicle(customerId, vehicleData) {
    try {
        const { make, model, year, vin, licensePlate, color, mileage } = vehicleData;

        // Step 1: Search for existing vehicle by customer + make + model + year
        let vehicle = await Vehicle.findOne({
            customer: customerId,
            make: { $regex: new RegExp(`^${make}$`, 'i') }, // Case insensitive
            model: { $regex: new RegExp(`^${model}$`, 'i') }, // Case insensitive
            year: year
        });

        // Step 2: If vehicle exists, return it
        if (vehicle) {
            console.log('Found existing vehicle:', vehicle._id);
            return vehicle;
        }

        // Step 3: Check if this is customer's first vehicle
        const customerVehicleCount = await Vehicle.countDocuments({ customer: customerId });
        const isPrimary = customerVehicleCount === 0;

        // Step 4: Create new vehicle
        const newVehicleData = {
            customer: customerId,
            make: make.trim(),
            model: model.trim(),
            year: parseInt(year),
            isPrimary: isPrimary,
            status: 'active'
        };

        // Add optional fields if provided
        if (vin) newVehicleData.vin = vin.trim().toUpperCase();
        if (licensePlate) newVehicleData.licensePlate = licensePlate.trim().toUpperCase();
        if (color) newVehicleData.color = color.trim();
        if (mileage && !isNaN(mileage)) newVehicleData.mileage = parseInt(mileage);

        vehicle = new Vehicle(newVehicleData);
        await vehicle.save();

        console.log('Created new vehicle:', vehicle._id);
        return vehicle;

    } catch (error) {
        console.error('Error in findOrCreateVehicle:', error);
        throw new Error(`Failed to find or create vehicle: ${error.message}`);
    }
}

/**
 * Updates vehicle information if additional data is provided
 * @param {string} vehicleId - The vehicle's ObjectId
 * @param {object} updateData - Additional vehicle data to update
 * @returns {Promise<object>} - The updated vehicle document
 */
async function updateVehicleInfo(vehicleId, updateData) {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        return vehicle;
    } catch (error) {
        console.error('Error updating vehicle:', error);
        throw new Error(`Failed to update vehicle: ${error.message}`);
    }
}

module.exports = {
    findOrCreateVehicle,
    updateVehicleInfo
};
