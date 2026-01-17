#!/bin/bash

echo "🔧 Auto-App Service Request Endpoint Test"
echo "========================================"
echo ""

# Check if server is running
echo "1. Checking if server is running..."
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
    echo "✅ Server is running on port 5001"
else
    echo "❌ Server not responding. Please start with: cd server && npm start"
    exit 1
fi

echo ""
echo "2. Testing service request endpoint structure..."

# Test without auth (should get 401)
echo "   Testing auth requirement..."
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5001/api/service-requests)
if [ "$response" = "401" ]; then
    echo "✅ Auth middleware working (401 Unauthorized)"
else
    echo "⚠️  Expected 401, got $response"
fi

echo ""
echo "3. Manual testing instructions:"
echo "   A. First, create/login a customer account:"
echo "      POST /api/auth/register or /api/auth/login"
echo ""
echo "   B. Then test service request creation:"
echo "      POST /api/service-requests with your auth token"
echo ""
echo "   C. Expected behavior:"
echo "      - Vehicle should be automatically created"
echo "      - Service request should be linked to vehicle"
echo "      - Response should include populated vehicle data"
echo ""
echo "📝 Full cURL example:"
echo ""
echo "# Login first:"
echo "curl -X POST http://localhost:5001/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"your@email.com\",\"password\":\"yourpassword\"}'"
echo ""
echo "# Create service request (replace YOUR_TOKEN):"
echo "curl -X POST http://localhost:5001/api/service-requests \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "  -d '{"
echo "    \"vehicleData\": {"
echo "      \"make\": \"Toyota\","
echo "      \"model\": \"Camry\","
echo "      \"year\": 2020"
echo "    },"
echo "    \"description\": \"Oil change needed\","
echo "    \"serviceType\": \"maintenance\""
echo "  }'"
echo ""
echo "🎯 Expected response: Service request with auto-created vehicle!"