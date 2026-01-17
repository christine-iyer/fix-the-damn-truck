# AutoApp Backend

This is the backend for the AutoApp MERN stack project. It provides RESTful API endpoints for user authentication and management using MongoDB Atlas, Express, JWT, and bcrypt.

## Features
- User authentication (signup & login) for three user types: Customer, Mechanic, Admin
- Passwords securely hashed with bcrypt
- JWT-based authentication for protected routes
- MongoDB Atlas cloud database connection
- Separate signup endpoints for each user type

## Endpoints

### Signup
- `POST /api/auth/signup/customer` — Register a new customer
- `POST /api/auth/signup/mechanic` — Register a new mechanic
- `POST /api/auth/signup/admin` — Register a new admin

### Login
- `POST /api/auth/login` — Login for any user type

## User Models
- **Customer:** `customerName`, `email`, `password`, `userType`, `serviceRequests`
- **Mechanic:** `mechanicName`, `email`, `password`, `userType`, `serviceRequests`
- **Admin:** `adminUserName`, `email`, `password`, `userType`

## Setup
1. Clone the repository
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the `server` directory with:
   ```env
   MONGO_URI=your-mongodb-atlas-connection-string
   PORT=5001
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```sh
   npx nodemon server.js
   ```

## Testing Endpoints
- Use the provided `AutoApp.postman_collection.json` to test endpoints in Postman.
- Make sure your MongoDB Atlas cluster is running and your IP is whitelisted.
- If you want to run the entire Postman collection, simply run :
```sh
npm install -g newman
```
 and then 

 ```sh
 newman run AutoApp.postman_collectionjson
 ```              

## Notes
- All passwords are hashed before storage.
- JWT tokens are returned on successful signup and login.
- The backend is ready for integration with a React frontend.

---
For any issues, check your MongoDB connection string, ensure your IP is whitelisted in Atlas, and review server logs for errors.
