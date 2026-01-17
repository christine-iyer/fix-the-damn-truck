// Database seeding script for Auto App
// This script populates the database with sample users of different roles
// Run with: npm run seed

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Mechanic = require('../models/Mechanic');
const Vehicle = require('../models/Vehicle');
require('dotenv').config();

// Sample data arrays
const sampleAdmins = [
    {
        username: 'admin1',
        email: 'admin1@autoapp.com',
        password: 'Admin123!',
        role: 'admin',
        status: 'approved',
        permissions: ['read', 'write', 'delete', 'manage_users', 'manage_system', 'view_analytics'],
        departments: ['general', 'customer_service', 'mechanic_management', 'financial', 'technical'],
        clearanceLevel: 'director'
    },
    {
        username: 'supervisor1',
        email: 'supervisor1@autoapp.com',
        password: 'Super123!',
        role: 'admin',
        status: 'approved',
        permissions: ['read', 'write', 'manage_users'],
        departments: ['customer_service', 'mechanic_management'],
        clearanceLevel: 'supervisor'
    },
    {
        username: 'senior1',
        email: 'senior1@autoapp.com',
        password: 'Senior123!',
        role: 'admin',
        status: 'approved',
        permissions: ['read', 'write'],
        departments: ['customer_service'],
        clearanceLevel: 'senior'
    }
];

const sampleCustomers = [
    {
        username: 'johndoe',
        email: 'john.doe@email.com',
        password: 'Customer123!',
        role: 'customer',
        status: 'approved',
        phoneNumber: '+1-555-0101',
        address: {
            street: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'US'
        },
        preferences: {
            preferredContactMethod: 'email',
            notificationSettings: {
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: true
            },
            language: 'en',
            timezone: 'America/New_York'
        },
        loyaltyPoints: 150,
        totalSpent: 1250.00,
        isVerified: true,
        verificationDate: new Date('2024-01-15'),
        emergencyContact: {
            name: 'Jane Doe',
            phone: '+1-555-0102',
            relationship: 'Spouse'
        }
    },
    {
        username: 'sarahsmith',
        email: 'sarah.smith@email.com',
        password: 'Customer123!',
        role: 'customer',
        status: 'approved',
        phoneNumber: '+1-555-0201',
        address: {
            street: '456 Oak Avenue',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'US'
        },
        preferences: {
            preferredContactMethod: 'phone',
            notificationSettings: {
                emailNotifications: true,
                smsNotifications: true,
                pushNotifications: true
            },
            language: 'en',
            timezone: 'America/Los_Angeles'
        },
        loyaltyPoints: 75,
        totalSpent: 850.00,
        isVerified: true,
        verificationDate: new Date('2024-02-10'),
        emergencyContact: {
            name: 'Mike Smith',
            phone: '+1-555-0202',
            relationship: 'Brother'
        }
    },
    {
        username: 'mikejohnson',
        email: 'mike.johnson@email.com',
        password: 'Customer123!',
        role: 'customer',
        status: 'approved',
        phoneNumber: '+1-555-0301',
        address: {
            street: '789 Pine Street',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'US'
        },
        preferences: {
            preferredContactMethod: 'sms',
            notificationSettings: {
                emailNotifications: false,
                smsNotifications: true,
                pushNotifications: true
            },
            language: 'en',
            timezone: 'America/Chicago'
        },
        loyaltyPoints: 200,
        totalSpent: 2100.00,
        isVerified: true,
        verificationDate: new Date('2024-01-05'),
        emergencyContact: {
            name: 'Lisa Johnson',
            phone: '+1-555-0302',
            relationship: 'Wife'
        }
    },
    {
        username: 'emilydavis',
        email: 'emily.davis@email.com',
        password: 'Customer123!',
        role: 'customer',
        status: 'pending',
        phoneNumber: '+1-555-0401',
        address: {
            street: '321 Elm Street',
            city: 'Houston',
            state: 'TX',
            zipCode: '77001',
            country: 'US'
        },
        preferences: {
            preferredContactMethod: 'email',
            notificationSettings: {
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: false
            },
            language: 'en',
            timezone: 'America/Chicago'
        },
        loyaltyPoints: 0,
        totalSpent: 0,
        isVerified: false
    }
];

const sampleMechanics = [
    {
        username: 'bobmechanic',
        email: 'bob.mechanic@email.com',
        password: 'Mechanic123!',
        role: 'mechanic',
        status: 'approved',
        phoneNumber: '+1-555-1001',
        specialization: ['Engine', 'Transmission', 'Diagnostics'],
        experience: 8,
        rating: 4.8,
        totalRatings: 45,
        location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: 'New York, NY',
            serviceRadius: 30
        },
        availability: {
            isAvailable: true,
            workingHours: {
                monday: { start: '08:00', end: '18:00', isWorking: true },
                tuesday: { start: '08:00', end: '18:00', isWorking: true },
                wednesday: { start: '08:00', end: '18:00', isWorking: true },
                thursday: { start: '08:00', end: '18:00', isWorking: true },
                friday: { start: '08:00', end: '18:00', isWorking: true },
                saturday: { start: '09:00', end: '15:00', isWorking: true },
                sunday: { start: '10:00', end: '14:00', isWorking: false }
            },
            timezone: 'America/New_York'
        },
        certifications: [
            {
                name: 'ASE Master Technician',
                issuingBody: 'National Institute for Automotive Service Excellence',
                issueDate: new Date('2020-03-15'),
                expiryDate: new Date('2026-03-15'),
                certificateNumber: 'ASE-2020-001'
            },
            {
                name: 'Engine Performance Specialist',
                issuingBody: 'ASE',
                issueDate: new Date('2021-06-10'),
                expiryDate: new Date('2027-06-10'),
                certificateNumber: 'ASE-ENG-2021-001'
            }
        ],
        businessInfo: {
            businessName: 'Bob\'s Auto Repair',
            businessLicense: 'BL-2020-001',
            insuranceProvider: 'Progressive Commercial',
            insurancePolicyNumber: 'POL-2024-001',
            insuranceExpiry: new Date('2024-12-31')
        },
        performance: {
            jobsCompleted: 156,
            averageJobTime: 2.5,
            onTimeRate: 96,
            customerSatisfaction: 94,
            repeatCustomerRate: 78
        },
        pricing: {
            hourlyRate: 85,
            minimumCharge: 50,
            travelFee: 25,
            acceptsInsurance: true
        },
        equipment: [
            { name: 'OBD-II Scanner', type: 'diagnostic', condition: 'excellent' },
            { name: 'Engine Analyzer', type: 'diagnostic', condition: 'good' },
            { name: 'Transmission Jack', type: 'repair', condition: 'excellent' },
            { name: 'Impact Wrench Set', type: 'general', condition: 'good' }
        ],
        isVerified: true,
        verificationDate: new Date('2024-01-10'),
        backgroundCheckPassed: true,
        backgroundCheckDate: new Date('2024-01-05')
    },
    {
        username: 'alicetech',
        email: 'alice.tech@email.com',
        password: 'Mechanic123!',
        role: 'mechanic',
        status: 'approved',
        phoneNumber: '+1-555-1002',
        specialization: ['Electrical', 'AC/Heating', 'Brakes'],
        experience: 5,
        rating: 4.6,
        totalRatings: 32,
        location: {
            latitude: 34.0522,
            longitude: -118.2437,
            address: 'Los Angeles, CA',
            serviceRadius: 25
        },
        availability: {
            isAvailable: true,
            workingHours: {
                monday: { start: '07:00', end: '17:00', isWorking: true },
                tuesday: { start: '07:00', end: '17:00', isWorking: true },
                wednesday: { start: '07:00', end: '17:00', isWorking: true },
                thursday: { start: '07:00', end: '17:00', isWorking: true },
                friday: { start: '07:00', end: '17:00', isWorking: true },
                saturday: { start: '08:00', end: '16:00', isWorking: true },
                sunday: { start: '09:00', end: '15:00', isWorking: true }
            },
            timezone: 'America/Los_Angeles'
        },
        certifications: [
            {
                name: 'ASE Electrical Systems',
                issuingBody: 'ASE',
                issueDate: new Date('2022-01-20'),
                expiryDate: new Date('2028-01-20'),
                certificateNumber: 'ASE-ELEC-2022-001'
            },
            {
                name: 'HVAC Certification',
                issuingBody: 'NATE',
                issueDate: new Date('2021-09-15'),
                expiryDate: new Date('2025-09-15'),
                certificateNumber: 'NATE-HVAC-2021-001'
            }
        ],
        businessInfo: {
            businessName: 'Alice\'s Auto Electrical',
            businessLicense: 'BL-2021-002',
            insuranceProvider: 'State Farm Commercial',
            insurancePolicyNumber: 'POL-2024-002',
            insuranceExpiry: new Date('2024-11-30')
        },
        performance: {
            jobsCompleted: 89,
            averageJobTime: 1.8,
            onTimeRate: 98,
            customerSatisfaction: 96,
            repeatCustomerRate: 82
        },
        pricing: {
            hourlyRate: 75,
            minimumCharge: 40,
            travelFee: 20,
            acceptsInsurance: true
        },
        equipment: [
            { name: 'Multimeter', type: 'diagnostic', condition: 'excellent' },
            { name: 'Oscilloscope', type: 'diagnostic', condition: 'good' },
            { name: 'AC Recovery Machine', type: 'specialty', condition: 'excellent' },
            { name: 'Brake Bleeder', type: 'repair', condition: 'good' }
        ],
        isVerified: true,
        verificationDate: new Date('2024-02-01'),
        backgroundCheckPassed: true,
        backgroundCheckDate: new Date('2024-01-28')
    },
    {
        username: 'charlieauto',
        email: 'charlie.auto@email.com',
        password: 'Mechanic123!',
        role: 'mechanic',
        status: 'approved',
        phoneNumber: '+1-555-1003',
        specialization: ['Suspension', 'Exhaust', 'General'],
        experience: 12,
        rating: 4.9,
        totalRatings: 78,
        location: {
            latitude: 41.8781,
            longitude: -87.6298,
            address: 'Chicago, IL',
            serviceRadius: 35
        },
        availability: {
            isAvailable: true,
            workingHours: {
                monday: { start: '08:00', end: '18:00', isWorking: true },
                tuesday: { start: '08:00', end: '18:00', isWorking: true },
                wednesday: { start: '08:00', end: '18:00', isWorking: true },
                thursday: { start: '08:00', end: '18:00', isWorking: true },
                friday: { start: '08:00', end: '18:00', isWorking: true },
                saturday: { start: '09:00', end: '16:00', isWorking: true },
                sunday: { start: '10:00', end: '14:00', isWorking: false }
            },
            timezone: 'America/Chicago'
        },
        certifications: [
            {
                name: 'ASE Master Technician',
                issuingBody: 'ASE',
                issueDate: new Date('2018-05-10'),
                expiryDate: new Date('2024-05-10'),
                certificateNumber: 'ASE-2018-002'
            },
            {
                name: 'Suspension Specialist',
                issuingBody: 'ASE',
                issueDate: new Date('2019-08-20'),
                expiryDate: new Date('2025-08-20'),
                certificateNumber: 'ASE-SUSP-2019-001'
            }
        ],
        businessInfo: {
            businessName: 'Charlie\'s Complete Auto',
            businessLicense: 'BL-2018-003',
            insuranceProvider: 'Allstate Commercial',
            insurancePolicyNumber: 'POL-2024-003',
            insuranceExpiry: new Date('2024-10-15')
        },
        performance: {
            jobsCompleted: 234,
            averageJobTime: 3.2,
            onTimeRate: 94,
            customerSatisfaction: 97,
            repeatCustomerRate: 85
        },
        pricing: {
            hourlyRate: 90,
            minimumCharge: 60,
            travelFee: 30,
            acceptsInsurance: true
        },
        equipment: [
            { name: 'Alignment Machine', type: 'specialty', condition: 'excellent' },
            { name: 'Spring Compressor', type: 'repair', condition: 'good' },
            { name: 'Exhaust Pipe Bender', type: 'specialty', condition: 'excellent' },
            { name: 'Lift System', type: 'general', condition: 'excellent' }
        ],
        isVerified: true,
        verificationDate: new Date('2024-01-20'),
        backgroundCheckPassed: true,
        backgroundCheckDate: new Date('2024-01-15')
    },
    {
        username: 'davidrepair',
        email: 'david.repair@email.com',
        password: 'Mechanic123!',
        role: 'mechanic',
        status: 'pending',
        phoneNumber: '+1-555-1004',
        specialization: ['General', 'Brakes'],
        experience: 3,
        rating: 4.2,
        totalRatings: 15,
        location: {
            latitude: 29.7604,
            longitude: -95.3698,
            address: 'Houston, TX',
            serviceRadius: 20
        },
        availability: {
            isAvailable: true,
            workingHours: {
                monday: { start: '09:00', end: '17:00', isWorking: true },
                tuesday: { start: '09:00', end: '17:00', isWorking: true },
                wednesday: { start: '09:00', end: '17:00', isWorking: true },
                thursday: { start: '09:00', end: '17:00', isWorking: true },
                friday: { start: '09:00', end: '17:00', isWorking: true },
                saturday: { start: '10:00', end: '15:00', isWorking: true },
                sunday: { start: '10:00', end: '14:00', isWorking: false }
            },
            timezone: 'America/Chicago'
        },
        certifications: [
            {
                name: 'ASE Brake Systems',
                issuingBody: 'ASE',
                issueDate: new Date('2023-03-10'),
                expiryDate: new Date('2029-03-10'),
                certificateNumber: 'ASE-BRAKE-2023-001'
            }
        ],
        businessInfo: {
            businessName: 'David\'s Auto Service',
            businessLicense: 'BL-2023-004',
            insuranceProvider: 'Geico Commercial',
            insurancePolicyNumber: 'POL-2024-004',
            insuranceExpiry: new Date('2024-09-30')
        },
        performance: {
            jobsCompleted: 23,
            averageJobTime: 2.1,
            onTimeRate: 91,
            customerSatisfaction: 88,
            repeatCustomerRate: 65
        },
        pricing: {
            hourlyRate: 65,
            minimumCharge: 35,
            travelFee: 15,
            acceptsInsurance: false
        },
        equipment: [
            { name: 'Brake Lathe', type: 'repair', condition: 'good' },
            { name: 'Basic Tool Set', type: 'general', condition: 'good' },
            { name: 'Jack and Stands', type: 'general', condition: 'excellent' }
        ],
        isVerified: false,
        backgroundCheckPassed: false
    }
];

const sampleVehicles = [
    // Vehicles for John Doe
    {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        vin: '1HGBH41JXMN109186',
        licensePlate: 'ABC123',
        color: 'Silver',
        mileage: 45000,
        isPrimary: true,
        status: 'active',
        purchaseDate: new Date('2020-03-15'),
        lastServiceDate: new Date('2024-01-10'),
        nextServiceDue: new Date('2024-07-10'),
        insurance: {
            provider: 'State Farm',
            policyNumber: 'SF-2024-001',
            expiryDate: new Date('2024-12-31')
        }
    },
    {
        make: 'Honda',
        model: 'Civic',
        year: 2018,
        vin: '2HGBH41JXMN109187',
        licensePlate: 'XYZ789',
        color: 'Blue',
        mileage: 62000,
        isPrimary: false,
        status: 'active',
        purchaseDate: new Date('2018-06-20'),
        lastServiceDate: new Date('2023-11-15'),
        nextServiceDue: new Date('2024-05-15'),
        insurance: {
            provider: 'Geico',
            policyNumber: 'GE-2024-001',
            expiryDate: new Date('2024-11-30')
        }
    },
    // Vehicles for Sarah Smith
    {
        make: 'BMW',
        model: 'X5',
        year: 2021,
        vin: '3HGBH41JXMN109188',
        licensePlate: 'DEF456',
        color: 'Black',
        mileage: 28000,
        isPrimary: true,
        status: 'active',
        purchaseDate: new Date('2021-09-10'),
        lastServiceDate: new Date('2024-02-05'),
        nextServiceDue: new Date('2024-08-05'),
        insurance: {
            provider: 'Progressive',
            policyNumber: 'PR-2024-001',
            expiryDate: new Date('2024-10-15')
        }
    },
    // Vehicles for Mike Johnson
    {
        make: 'Ford',
        model: 'F-150',
        year: 2019,
        vin: '4HGBH41JXMN109189',
        licensePlate: 'GHI789',
        color: 'Red',
        mileage: 55000,
        isPrimary: true,
        status: 'active',
        purchaseDate: new Date('2019-04-25'),
        lastServiceDate: new Date('2024-01-20'),
        nextServiceDue: new Date('2024-07-20'),
        insurance: {
            provider: 'Allstate',
            policyNumber: 'AL-2024-001',
            expiryDate: new Date('2024-12-15')
        }
    },
    {
        make: 'Chevrolet',
        model: 'Malibu',
        year: 2017,
        vin: '5HGBH41JXMN109190',
        licensePlate: 'JKL012',
        color: 'White',
        mileage: 78000,
        isPrimary: false,
        status: 'active',
        purchaseDate: new Date('2017-08-15'),
        lastServiceDate: new Date('2023-12-10'),
        nextServiceDue: new Date('2024-06-10'),
        insurance: {
            provider: 'Farmers',
            policyNumber: 'FA-2024-001',
            expiryDate: new Date('2024-09-20')
        }
    },
    // Vehicle for Emily Davis
    {
        make: 'Nissan',
        model: 'Altima',
        year: 2022,
        vin: '6HGBH41JXMN109191',
        licensePlate: 'MNO345',
        color: 'Gray',
        mileage: 15000,
        isPrimary: true,
        status: 'active',
        purchaseDate: new Date('2022-11-30'),
        lastServiceDate: new Date('2024-01-05'),
        nextServiceDue: new Date('2024-07-05'),
        insurance: {
            provider: 'Liberty Mutual',
            policyNumber: 'LM-2024-001',
            expiryDate: new Date('2024-11-30')
        }
    }
];

async function clearDatabase() {
    console.log('🗑️  Clearing existing data...');

    // Clear in reverse order to handle dependencies
    await Vehicle.deleteMany({});
    await Admin.deleteMany({});
    await Customer.deleteMany({});
    await Mechanic.deleteMany({});

    console.log('✅ Database cleared');
}

async function seedAdmins() {
    console.log('👑 Seeding admin users...');

    for (const adminData of sampleAdmins) {
        const admin = new Admin(adminData);
        await admin.save();
        console.log(`   ✅ Created admin: ${admin.username} (${admin.clearanceLevel})`);
    }

    console.log(`✅ Created ${sampleAdmins.length} admin users`);
}

async function seedCustomers() {
    console.log('👥 Seeding customer users...');

    const createdCustomers = [];
    for (const customerData of sampleCustomers) {
        const customer = new Customer(customerData);
        await customer.save();
        createdCustomers.push(customer);
        console.log(`   ✅ Created customer: ${customer.username} (${customer.status})`);
    }

    console.log(`✅ Created ${sampleCustomers.length} customer users`);
    return createdCustomers;
}

async function seedMechanics() {
    console.log('🔧 Seeding mechanic users...');

    const createdMechanics = [];
    for (const mechanicData of sampleMechanics) {
        const mechanic = new Mechanic(mechanicData);
        await mechanic.save();
        createdMechanics.push(mechanic);
        console.log(`   ✅ Created mechanic: ${mechanic.username} (${mechanic.status}) - ${mechanic.specialization.join(', ')}`);
    }

    console.log(`✅ Created ${sampleMechanics.length} mechanic users`);
    return createdMechanics;
}

async function seedVehicles(customers) {
    console.log('🚗 Seeding vehicles...');

    const createdVehicles = [];
    let vehicleIndex = 0;

    // Assign vehicles to customers
    const vehicleAssignments = [
        { customerIndex: 0, vehicleCount: 2 }, // John Doe gets 2 vehicles
        { customerIndex: 1, vehicleCount: 1 }, // Sarah Smith gets 1 vehicle
        { customerIndex: 2, vehicleCount: 2 }, // Mike Johnson gets 2 vehicles
        { customerIndex: 3, vehicleCount: 1 }  // Emily Davis gets 1 vehicle
    ];

    for (const assignment of vehicleAssignments) {
        const customer = customers[assignment.customerIndex];

        for (let i = 0; i < assignment.vehicleCount; i++) {
            const vehicleData = {
                ...sampleVehicles[vehicleIndex],
                customer: customer._id
            };

            const vehicle = new Vehicle(vehicleData);
            await vehicle.save();
            createdVehicles.push(vehicle);
            console.log(`   ✅ Created vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model} for ${customer.username}`);
            vehicleIndex++;
        }
    }

    console.log(`✅ Created ${createdVehicles.length} vehicles`);
    return createdVehicles;
}

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/auto-app');
        console.log('✅ Connected to database');

        // Clear existing data
        await clearDatabase();

        // Seed data
        await seedAdmins();
        const customers = await seedCustomers();
        const mechanics = await seedMechanics();
        const vehicles = await seedVehicles(customers);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   👑 Admins: ${sampleAdmins.length}`);
        console.log(`   👥 Customers: ${sampleCustomers.length}`);
        console.log(`   🔧 Mechanics: ${sampleMechanics.length}`);
        console.log(`   🚗 Vehicles: ${vehicles.length}`);

        console.log('\n🔐 Default passwords for all users:');
        console.log('   Admins: Admin123!, Super123!, Senior123!');
        console.log('   Customers: Customer123!');
        console.log('   Mechanics: Mechanic123!');
        console.log('\n⚠️  IMPORTANT: Change all default passwords in production!');

    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from database');
    }
}

// Run the seeding script
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
