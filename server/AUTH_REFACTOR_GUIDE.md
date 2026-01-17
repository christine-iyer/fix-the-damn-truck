# Authentication System Refactor Guide

## Overview
The authentication system has been refactored to move business logic from routes to controllers and implement a unified registration system for all user roles.

## Key Changes

### 1. **Function-Based Controller Architecture**
- **Before**: Business logic was embedded in route handlers
- **After**: Business logic moved to dedicated functions in `authController.js`
- **Benefits**: Better separation of concerns, easier testing, reusable logic, cleaner functional approach

### 2. **Unified Registration System**
- **Before**: Separate endpoints for each role (`/signup/customer`, `/signup/mechanic`, `/signup/admin`)
- **After**: Single unified endpoint (`/register`) that handles all roles
- **Role Selection**: Role determined by user choice in request body, not by endpoint
- **Clean Design**: No unnecessary legacy endpoints or complexity

### 3. **Enhanced Authentication Features**
- **Profile Management**: Get and update user profiles
- **Password Management**: Change password functionality with strong validation
- **Status Validation**: Check user approval status during login
- **Better Error Handling**: Comprehensive validation and error messages using Joi
- **Role-Based Next Steps**: Clear guidance for different user types after registration
- **Strong Password Policy**: 8-25 characters with uppercase, lowercase, numbers, and symbols
- **Joi Integration**: Robust validation library for comprehensive input validation

## Validation Requirements

### Joi Integration
The system now uses **Joi** for comprehensive validation, providing:
- **Robust Email Validation**: RFC-compliant email validation with TLD checking
- **Strong Password Validation**: Pattern-based validation with detailed error messages
- **Username Validation**: Alphanumeric-only usernames with length constraints
- **Role Validation**: Enum-based role validation
- **Custom Error Messages**: User-friendly validation error messages
- **API Integration**: Static validation method for controller use

### Strong Password Policy
All passwords must meet the following requirements:
- **Length**: 8-25 characters
- **Lowercase**: At least one lowercase letter (a-z)
- **Uppercase**: At least one uppercase letter (A-Z)
- **Number**: At least one number (0-9)
- **Symbol**: At least one symbol (!@#$%^&*()_+-=[]{}|;:,.<>?)

### Password Examples
- ✅ **Valid**: `Password123!`, `MyPass123@`, `Secure123#`
- ❌ **Invalid**: `password123!` (no uppercase), `PASSWORD123!` (no lowercase), `Password!` (no number), `Password123` (no symbol)

### Email Validation
All email addresses must meet the following requirements:
- **RFC Compliance**: Follows RFC 5321 email standards
- **TLD Validation**: Must have valid top-level domain
- **Domain Segments**: Minimum 2 segments (domain.tld), maximum 5 segments
- **Length**: Maximum 254 characters (RFC limit)
- **Structure**: Proper local@domain format

### Email Examples
- ✅ **Valid**: `user@example.com`, `test.email@domain.co.uk`, `user+tag@example.org`
- ❌ **Invalid**: `invalid-email` (no @), `user@` (no domain), `user@example` (no TLD)

### Username Validation
All usernames must meet the following requirements:
- **Characters**: Only letters and numbers (alphanumeric)
- **Length**: 3-30 characters
- **No Special Characters**: No spaces, symbols, or special characters

### Username Examples
- ✅ **Valid**: `testuser123`, `john_doe`, `admin2024`
- ❌ **Invalid**: `ab` (too short), `test_user` (underscore), `user@name` (special characters)

## API Endpoints

### Registration Endpoints

#### Single Registration Endpoint
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "phoneNumber": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345"
  }
}
```

**Response:**
```json
{
  "message": "Customer account created successfully",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "customer",
    "status": "pending",
    "phoneNumber": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345"
    }
  },
  "nextSteps": "Your account is pending approval. You will be notified once approved."
}
```

**Error Response (Invalid Role):**
```json
{
  "error": "Invalid role. Must be admin, customer, or mechanic",
  "validRoles": ["admin", "customer", "mechanic"]
}
```

### Login Endpoint
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "customer",
    "status": "approved"
  }
}
```

### Profile Management Endpoints

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer jwt_token_here
```

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "phoneNumber": "+1987654321",
  "address": {
    "city": "New City"
  }
}
```

#### Change Password
```http
PUT /auth/change-password
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer jwt_token_here
```

## Role-Specific Registration Data

### Customer Registration
```json
{
  "username": "customer_name",
  "email": "customer@example.com",
  "password": "password123",
  "role": "customer",
  "phoneNumber": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345"
  },
  "preferences": {
    "preferredContactMethod": "email",
    "notificationSettings": {
      "emailNotifications": true,
      "smsNotifications": false
    }
  }
}
```

### Mechanic Registration
```json
{
  "username": "mechanic_name",
  "email": "mechanic@example.com",
  "password": "password123",
  "role": "mechanic",
  "phoneNumber": "+1234567890",
  "specialization": ["Engine", "Transmission"],
  "experience": 5,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Mechanic St, City, State"
  },
  "businessInfo": {
    "businessName": "ABC Auto Repair",
    "businessLicense": "LIC123456"
  }
}
```

### Admin Registration
```json
{
  "username": "admin_name",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin",
  "permissions": ["read", "write", "delete", "manage_users"],
  "departments": ["general", "customer_service"],
  "clearanceLevel": "senior"
}
```

## Error Handling

### Validation Errors
```json
{
  "error": "Validation failed",
  "details": [
    "Username must be at least 3 characters long",
    "Email is required"
  ]
}
```

### Authentication Errors
```json
{
  "error": "Invalid credentials"
}
```

### Authorization Errors
```json
{
  "error": "Account pending approval. Please wait for admin approval."
}
```

## Security Features

### 1. **Input Validation**
- Required field validation
- Email format validation
- Password strength requirements
- Role validation

### 2. **Status Checking**
- Pending approval check for customers/mechanics
- Banned account detection
- Admin accounts bypass approval

### 3. **Password Security**
- Automatic password hashing
- Current password verification for changes
- Minimum password length enforcement

### 4. **JWT Token Management**
- Secure token generation
- Token expiration (1 day)
- User information in token payload

## Migration from Old System

### Client-Side Changes Required

#### 1. Update Registration Calls
```javascript
// Before
fetch('/auth/signup/customer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

// After
fetch('/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer'
  })
});
```

#### 2. Handle New Response Format
```javascript
// Before
const response = await fetch('/auth/signup/customer', options);
const { token } = await response.json();

// After
const response = await fetch('/auth/register', options);
const { token, user, message } = await response.json();
```

### Backward Compatibility
- Existing JWT tokens remain valid
- No changes required for login functionality
- **Breaking Change**: Legacy role-specific endpoints removed for cleaner API design

## Benefits of Refactoring

### 1. **Maintainability**
- Business logic separated from routing
- Easier to test individual components
- Clear separation of concerns
- Clean functional programming approach

### 2. **Scalability**
- Easy to add new authentication features
- Reusable controller functions
- Consistent error handling
- Simple function imports and exports

### 3. **User Experience**
- Unified registration process
- Better error messages
- Profile management capabilities

### 4. **Security**
- Enhanced validation using Joi library for robust input validation
- Status-based access control
- Secure password management with strong password policy
- RFC-compliant email validation with TLD checking
- Username validation (alphanumeric only)
- Password requirements: 8-25 characters with uppercase, lowercase, numbers, and symbols
- Comprehensive error handling with detailed validation messages

## Testing

The refactored system includes comprehensive validation and error handling:
- ✅ Registration validation
- ✅ Role validation
- ✅ Login validation
- ✅ Password change validation
- ✅ Authentication requirement checks

## Next Steps

1. Update client-side code to use new endpoints
2. Test with real user data
3. Implement additional profile management features
4. Add password reset functionality
5. Consider implementing refresh tokens for better security
