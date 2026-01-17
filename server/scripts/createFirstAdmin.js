// Script to create the first admin user
// Run this once to bootstrap the system with an initial admin

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function createFirstAdmin() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/auto-app');
        console.log('Connected to database');

        // Check if any admin already exists
        const existingAdmin = await Admin.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists. Skipping creation.');
            console.log(`Existing admin: ${existingAdmin.email}`);
            return;
        }

        // Create first admin
        const firstAdmin = new Admin({
            username: 'Anmitchell92',
            email: 'avary.dev@gmail.com',
            password: 'Abcd1234!', // Change this in production
            role: 'admin',
            status: 'approved', // First admin is pre-approved
            permissions: ['read', 'write', 'delete', 'manage_users', 'manage_system', 'view_analytics'],
            departments: ['general', 'customer_service', 'mechanic_management', 'financial', 'technical'],
            clearanceLevel: 'director'
        });

        await firstAdmin.save();
        console.log('✅ First admin created successfully!');
        console.log(`Email: ${firstAdmin.email}`);
        console.log(`Username: ${firstAdmin.username}`);
        console.log('⚠️  IMPORTANT: Change the default password immediately!');
        console.log('⚠️  IMPORTANT: Update the email to a real admin email!');

    } catch (error) {
        console.error('❌ Error creating first admin:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
    }
}

// Run the script
createFirstAdmin();
