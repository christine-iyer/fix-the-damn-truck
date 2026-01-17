const axios = require('axios');

// Test configuration
const SERVER_URL = 'http://localhost:5001';
const API_URL = `${SERVER_URL}/api`;

// Test data
const testServiceRequest = {
    mechanicId: "68f902c8e08a2d374be7c592", // You'll need a real mechanic ID
    vehicleData: {
        make: "Pontiac",
        model: "Grand Am", 
        year: 2000,
        mileage: 150000,
        color: "Silver",
        licensePlate: "ABC123"
    },
    description: "Oil change and tire rotation needed",
    serviceType: "maintenance",
    priority: "medium", 
    question: "Can you do this Thursday afternoon?",
    preferredDate: "2025-10-31",
    preferredTime: "2:00 PM",
    location: "customer_location",
    address: {
        street: "123 Main St",
        city: "Springfield",
        state: "IL",
        zipCode: "62701"
    }
};

// Test customer login data (you'll need real credentials)
const testCustomer = {
    email: "customer@test.com",
    password: "password123"
};

async function testServiceRequestCreation() {
    try {
        console.log('🚀 Starting Service Request Test...\n');

        // Step 1: Login as customer to get auth token
        console.log('1. Attempting customer login...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, testCustomer);
        const authToken = loginResponse.data.token;
        console.log('✅ Login successful\n');

        // Step 2: Create service request with automatic vehicle creation
        console.log('2. Creating service request with vehicle data...');
        const serviceRequestResponse = await axios.post(
            `${API_URL}/service-requests`,
            testServiceRequest,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Service request created successfully!');
        console.log('📋 Response:', JSON.stringify(serviceRequestResponse.data, null, 2));

        // Step 3: Verify vehicle was created
        console.log('\n3. Checking if vehicle was created...');
        const serviceRequest = serviceRequestResponse.data.serviceRequest;
        if (serviceRequest.vehicle) {
            console.log('✅ Vehicle automatically created and linked!');
            console.log('🚗 Vehicle Info:', {
                id: serviceRequest.vehicle._id,
                make: serviceRequest.vehicle.make,
                model: serviceRequest.vehicle.model,
                year: serviceRequest.vehicle.year,
                isPrimary: serviceRequest.vehicle.isPrimary
            });
        }

        console.log('\n🎉 Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('\n💡 Tip: Make sure you have a valid customer account with email: customer@test.com');
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Tip: Make sure your server is running on port 5001');
        }
    }
}

// Alternative test with curl command generation
function generateCurlCommand() {
    console.log('\n📝 Manual cURL Test Command:');
    console.log('First login to get token:');
    console.log(`curl -X POST ${API_URL}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testCustomer)}'`);
    
    console.log('\nThen create service request (replace YOUR_TOKEN):');
    console.log(`curl -X POST ${API_URL}/service-requests \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '${JSON.stringify(testServiceRequest, null, 2)}'`);
}

// Run tests
console.log('🔧 Auto-App Service Request Test Suite\n');
console.log('Choose test method:');
console.log('1. Automated test (requires axios)');
console.log('2. Generate cURL commands for manual testing\n');

// Run automated test if axios is available, otherwise show curl commands
testServiceRequestCreation().catch(() => {
    console.log('\n📝 Falling back to manual test commands...');
    generateCurlCommand();
});