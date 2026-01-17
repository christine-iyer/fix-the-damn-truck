# Model Refactoring Migration Guide

## Overview
The models have been refactored from separate `Admin`, `Customer`, and `Mechanic` models to a unified `User` model with inheritance using Mongoose discriminators.

## Technical Implementation

### 1. **Mongoose Discriminators**
- **Base Schema**: `User` schema with common fields (username, email, password, role, status)
- **Discriminator Key**: `role` field determines the user type
- **Child Models**: `Admin`, `Customer`, `Mechanic` inherit from `User`

### 2. **Key Changes**

#### File Structure
```
models/
├── User.js          # Base User schema and model
├── Admin.js         # Admin discriminator with admin-specific fields
├── Customer.js      # Customer discriminator with customer-specific fields
├── Mechanic.js      # Mechanic discriminator with mechanic-specific fields
└── ServiceRequest.js # Service request model
```

#### Model Structure
```javascript
// Before: Separate models
const Admin = require('./models/Admin');
const Customer = require('./models/Customer');
const Mechanic = require('./models/Mechanic');

// After: Unified model with inheritance (separate files)
const User = require('./models/User');
const Admin = require('./models/Admin');
const Customer = require('./models/Customer');
const Mechanic = require('./models/Mechanic');
```

#### Field Changes
- `adminUserName` → `username`
- `customerName` → `username`
- `mechanicName` → `username`
- `userType` → `role` (with enum validation)

#### Database Structure
- All users stored in single `users` collection
- Discriminator field `__t` automatically added by Mongoose
- Role-specific fields stored in same document

### 3. **Benefits**

#### Code Simplification
- **Single Authentication**: One login endpoint for all user types
- **Unified Queries**: Query all users or filter by role
- **DRY Principle**: No duplicate code for common fields
- **Consistent API**: Same endpoints handle different user types

#### Performance Improvements
- **Single Collection**: Faster queries across user types
- **Index Optimization**: Single set of indexes for all users
- **Aggregation**: Easier to build complex queries

### 4. **API Changes**

#### Signup Endpoints
```javascript
// Before
POST /auth/signup/customer
{ "customerName": "John", "email": "john@example.com", "password": "123456" }

// After
POST /auth/signup/customer
{ "username": "John", "email": "john@example.com", "password": "123456" }
```

#### Login Endpoint
- No changes to request format
- Now uses unified User model for authentication

#### User Management
- All user operations now work with unified User model
- Role filtering available in queries
- Statistics include all user types

### 5. **Database Migration**

#### Existing Data
If you have existing data, you'll need to migrate:

```javascript
// Migration script example
const migrateUsers = async () => {
  // Migrate customers
  const customers = await Customer.find({});
  for (const customer of customers) {
    await User.create({
      username: customer.customerName,
      email: customer.email,
      password: customer.password,
      role: 'customer',
      status: customer.status,
      serviceRequests: customer.serviceRequests,
      __t: 'customer'
    });
  }
  
  // Similar for mechanics and admins...
};
```

### 6. **Usage Examples**

#### Creating Users
```javascript
// Create customer
const customer = new Customer({
  username: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'customer'
});

// Create mechanic
const mechanic = new Mechanic({
  username: 'Jane Smith',
  email: 'jane@example.com',
  password: 'password123',
  role: 'mechanic',
  specialization: ['Engine', 'Transmission']
});
```

#### Querying Users
```javascript
// Get all users
const allUsers = await User.find({});

// Get users by role
const customers = await User.find({ role: 'customer' });

// Get users by status
const approvedUsers = await User.find({ status: 'approved' });

// Complex aggregation
const stats = await User.aggregate([
  { $group: { _id: '$role', count: { $sum: 1 } } }
]);
```

### 7. **ServiceRequest Updates**
- References now point to `User` model instead of specific models
- Populate still works correctly with role-specific data

### 8. **Backward Compatibility**
- JWT tokens remain the same format
- API endpoints maintain same structure
- Client-side code should work with minimal changes

### 9. **Expanded Role Capabilities**

#### Admin Model Features
- **Permissions System**: Granular permission control (read, write, delete, manage_users, etc.)
- **Department Management**: Multi-department access control
- **Clearance Levels**: Hierarchical access (basic, senior, supervisor, director)
- **Security Features**: Two-factor authentication, account locking, login tracking

#### Customer Model Features
- **Vehicle Management**: Multiple vehicles with VIN tracking
- **Loyalty Program**: Points system and spending tracking
- **Preferences**: Contact methods, notifications, language settings
- **Address Management**: Full address with emergency contacts
- **Service History**: Complete service request tracking

#### Mechanic Model Features
- **Professional Credentials**: Certifications with expiry tracking
- **Specialization System**: Multiple specializations with validation
- **Availability Management**: Working hours and location-based availability
- **Performance Metrics**: Job completion rates, customer satisfaction
- **Business Information**: Insurance, licensing, equipment tracking
- **Pricing Management**: Hourly rates, travel fees, insurance acceptance

### 10. **Benefits of Separate Files**

#### Maintainability
- **Focused Development**: Each role's capabilities in dedicated files
- **Easier Testing**: Role-specific unit tests
- **Clear Separation**: Business logic separated by user type
- **Scalability**: Easy to add new role-specific features

#### Team Collaboration
- **Parallel Development**: Multiple developers can work on different roles
- **Reduced Conflicts**: Less chance of merge conflicts
- **Code Ownership**: Clear responsibility for each role's features

## Next Steps
1. Test the new model structure
2. Update any client-side code that references old field names
3. Consider running migration script for existing data
4. Update documentation and API specs
5. Implement role-specific business logic using the new methods
6. Add validation for role-specific fields in your API endpoints
