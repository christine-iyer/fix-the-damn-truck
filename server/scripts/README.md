# Database Seeding Scripts

This directory contains scripts to populate your Auto App database with sample data.

## Available Scripts

### 1. `seedDatabase.js` - Full Database Seeding
Populates the database with comprehensive sample data for all user roles.

**Usage:**
```bash
npm run seed
# or
npm run seed:full
```

**What it creates:**
- **3 Admin users** with different clearance levels:
  - Director-level admin with full permissions
  - Supervisor-level admin with user management permissions
  - Senior-level admin with limited permissions
- **4 Customer users** with different statuses:
  - 3 approved customers with complete profiles
  - 1 pending customer
- **4 Mechanic users** with different specializations:
  - Engine/Transmission specialist (8 years experience)
  - Electrical/AC specialist (5 years experience)
  - Suspension/Exhaust specialist (12 years experience)
  - General mechanic (3 years experience, pending approval)
- **6 Vehicles** assigned to customers with realistic data

### 2. `createFirstAdmin.js` - Bootstrap Admin
Creates the initial admin user to bootstrap the system.

**Usage:**
```bash
npm run create-admin
```

## Default Credentials

All seeded users use predictable passwords for testing:

### Admins
- `admin1@autoapp.com` / `Admin123!` (Director)
- `supervisor1@autoapp.com` / `Super123!` (Supervisor)
- `senior1@autoapp.com` / `Senior123!` (Senior)

### Customers
- `john.doe@email.com` / `Customer123!` (username: johndoe)
- `sarah.smith@email.com` / `Customer123!` (username: sarahsmith)
- `mike.johnson@email.com` / `Customer123!` (username: mikejohnson)
- `emily.davis@email.com` / `Customer123!` (username: emilydavis)

### Mechanics
- `bob.mechanic@email.com` / `Mechanic123!` (username: bobmechanic)
- `alice.tech@email.com` / `Mechanic123!` (username: alicetech)
- `charlie.auto@email.com` / `Mechanic123!` (username: charlieauto)
- `david.repair@email.com` / `Mechanic123!` (username: davidrepair)

## Important Notes

⚠️ **Security Warning**: These are default passwords for development/testing only. **NEVER use these passwords in production!**

## Database Requirements

Make sure your MongoDB connection is properly configured in your `.env` file:
```
MONGO_URI=mongodb://localhost:27017/auto-app
# or for MongoDB Atlas:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/auto-app
```

## Script Behavior

- **Clears existing data**: The seed script will delete all existing users and vehicles before creating new ones
- **Handles relationships**: Vehicles are properly linked to their respective customers
- **Realistic data**: All sample data includes realistic addresses, phone numbers, certifications, etc.
- **Status variety**: Users are created with different approval statuses to test various scenarios

## Customization

You can modify the sample data arrays in `seedDatabase.js` to:
- Add more users of any role
- Change user details (names, emails, addresses, etc.)
- Modify vehicle information
- Adjust mechanic specializations and certifications
- Update admin permissions and departments

## Troubleshooting

If you encounter issues:

1. **Connection errors**: Verify your MongoDB connection string in `.env`
2. **Validation errors**: Check that all required fields are provided in the sample data
3. **Permission errors**: Ensure your MongoDB user has read/write permissions
4. **Duplicate key errors**: The script clears existing data first, but if it fails partway through, you may need to manually clear the database

## Development Workflow

1. **Initial setup**: Run `npm run create-admin` to create your first admin
2. **Full seeding**: Run `npm run seed` to populate with comprehensive test data
3. **Testing**: Use the seeded data to test your application features
4. **Reset**: Re-run `npm run seed` anytime you need fresh test data
