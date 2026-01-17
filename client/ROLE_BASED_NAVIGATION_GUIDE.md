# Role-Based Navigation Implementation Guide

## Overview

This implementation provides a complete role-based authentication and navigation system for your React Native/Expo app. After a user signs up, their role determines which home screen they are presented with.

## Key Features

✅ **Role-based Registration**: Users can select their role (Admin, Customer, Mechanic) during signup
✅ **Automatic Navigation**: Users are automatically redirected to their role-specific home screen after login/signup
✅ **Persistent Authentication**: User sessions are maintained using secure token storage
✅ **Unified Authentication**: Single registration endpoint handles all user types
✅ **Role-specific Fields**: Different registration fields based on user role
✅ **Secure Logout**: Proper session cleanup and token removal

## Architecture

### 1. Authentication Context (`contexts/AuthContext.tsx`)
- Manages global authentication state
- Handles login, registration, and logout
- Provides automatic role-based navigation
- Stores and validates JWT tokens securely

### 2. Role-Based Navigation Flow
```
User Signup/Login → AuthContext → Role Check → Automatic Redirect
├── Admin → /admin/home
├── Customer → /customer/home
└── Mechanic → /mechanic/home
```

### 3. Updated Components

#### Signup Screen (`app/auth/signup.tsx`)
- Role selection interface (Customer, Mechanic, Admin)
- Role-specific form fields
- Unified registration with your backend API
- Automatic navigation after successful registration

#### Login Screen (`app/auth/login.tsx`)
- Real authentication with your backend
- Automatic role-based navigation after login
- Loading states and error handling

#### Home Screens
- **Admin Home** (`app/admin/home.tsx`): Admin dashboard with user management features
- **Customer Home** (`app/customer/home.tsx`): Customer dashboard with service booking
- **Mechanic Home** (`app/mechanic/home.tsx`): Mechanic dashboard with job queue

## How It Works

### 1. User Registration Process
1. User selects their role (Customer, Mechanic, or Admin)
2. Fills out role-specific fields:
   - **Customer**: Full Name
   - **Mechanic**: Specialty (e.g., Engine, Brakes, Electrical)
   - **Admin**: Department
3. Submits registration to `/api/auth/register`
4. Receives JWT token and user data
5. **Automatically redirected** to role-specific home screen

### 2. User Login Process
1. User enters email and password
2. Authenticates with `/api/auth/login`
3. Receives JWT token and user data
4. **Automatically redirected** to role-specific home screen

### 3. Session Management
- JWT tokens stored securely using AsyncStorage
- Automatic token validation on app startup
- Persistent sessions across app restarts
- Secure logout with token cleanup

## Backend Integration

The implementation works with your existing backend:

### Registration Endpoint
```javascript
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "customer", // or "mechanic" or "admin"
  "customerName": "John Doe" // role-specific field
}
```

### Login Endpoint
```javascript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Response Format
```javascript
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

## Usage Examples

### 1. Customer Registration
```typescript
// User selects "Customer" role
// Fills out: username, email, password, full name
// Automatically redirected to /customer/home
```

### 2. Mechanic Registration
```typescript
// User selects "Mechanic" role
// Fills out: username, email, password, specialty
// Automatically redirected to /mechanic/home
```

### 3. Admin Registration
```typescript
// User selects "Admin" role
// Fills out: username, email, password, department
// Automatically redirected to /admin/home
```

## Security Features

- **JWT Token Storage**: Secure token storage using AsyncStorage
- **Token Validation**: Automatic token verification on app startup
- **Role-based Access**: Users can only access their role-specific screens
- **Secure Logout**: Complete session cleanup
- **Input Validation**: Client-side validation for all form fields

## Customization

### Adding New Roles
1. Update the `UserRole` type in `AuthContext.tsx`
2. Add role selection button in `signup.tsx`
3. Add role-specific fields in `renderRoleSpecificFields()`
4. Update navigation logic in `AuthContext.tsx`
5. Create new home screen component

### Modifying Role-specific Fields
Edit the `renderRoleSpecificFields()` function in `signup.tsx` to add/remove fields for each role.

### Customizing Home Screens
Each home screen can be customized with role-specific functionality:
- Admin: User management, system settings
- Customer: Service booking, history tracking
- Mechanic: Job queue, work orders

## Testing the Implementation

1. **Start your backend server** (port 5001)
2. **Run the client app**: `npm start` in the client directory
3. **Test registration**:
   - Try registering as each role type
   - Verify automatic navigation to correct home screen
4. **Test login**:
   - Login with existing credentials
   - Verify automatic navigation to correct home screen
5. **Test persistence**:
   - Close and reopen the app
   - Verify user stays logged in
6. **Test logout**:
   - Logout from any home screen
   - Verify return to welcome screen

## Benefits of This Approach

1. **User Experience**: Seamless role-based navigation
2. **Security**: Proper authentication and authorization
3. **Maintainability**: Centralized authentication logic
4. **Scalability**: Easy to add new roles and features
5. **Consistency**: Unified authentication across the app

This implementation provides a solid foundation for role-based authentication and navigation in your auto service app!
