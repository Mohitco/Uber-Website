# 🚗 Uber Website Backend

A RESTful API service built with Node.js, Express, and MongoDB that handles user and captain authentication, ride management, and real-time location tracking.

## 📑 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [API Documentation](#api-documentation)
   - [User Endpoints](#user-endpoints)
   - [Captain Endpoints](#captain-endpoints)
6. [Data Flow](#data-flow)
7. [Models](#models)
8. [Error Handling](#error-handling)
9. [Security](#security)

## 🎯 Features

- User and Captain authentication
- JWT-based authorization
- Token blacklisting for secure logout
- Real-time location tracking (socket support)
- Vehicle management for captains
- Input validation and sanitization
- Error handling and logging

## 💻 Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- bcrypt for password hashing
- Socket.IO (prepared)
- express-validator

## 📁 Project Structure

```
Backend/
├── app.js                # Express configuration and middleware
├── server.js             # Server initialization
├── config/
│   └── db.js            # Database connection
├── controller/
│   ├── user_controller.js    # User request handlers
│   └── captain_controller.js # Captain request handlers
├── middleware/
│   └── auth.middleware.js    # JWT verification & token blacklist
├── model/
│   ├── user_model.js        # User schema & methods
│   ├── captain.model.js     # Captain schema & methods
│   └── blacklistToken.js    # Token blacklist schema
├── routes/
│   ├── user_routes.js       # User endpoint definitions
│   └── captain_router.js    # Captain endpoint definitions
└── services/
    ├── user_services.js     # User business logic
    └── captain_service.js   # Captain business logic
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local or Atlas URI)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mohitco/Uber-Website.git
   cd Uber-Website/Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in the Backend directory:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/uber-website
   JWT_SECRET=your_secure_jwt_secret
   ```

4. Start the server:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start at `http://localhost:4000`

## 📡 API Documentation

Base URL: `http://localhost:4000/api/v1`

### User Endpoints

#### 1. Register User
- **URL**: POST `/register/user`
- **Description**: Create new user account
- **Auth**: Not required
- **Body**:
  ```json
  {
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response** (201):
  ```json
  {
    "message": "user Successfully created",
    "info": {
      "token": "<jwt-token>",
      "user": {
        "fullname": {
          "firstname": "John",
          "lastname": "Doe"
        },
        "email": "john@example.com"
      }
    }
  }
  ```

#### 2. Login User
- **URL**: POST `/login/user`
- **Description**: Authenticate user
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "message": "user Successfully logged in",
    "info": {
      "token": "<jwt-token>",
      "user": {
        "fullname": {
          "firstname": "John",
          "lastname": "Doe"
        },
        "email": "john@example.com"
      }
    }
  }
  ```

#### 3. Get User Profile
- **URL**: GET `/user/profile`
- **Auth**: Required
- **Headers**: `Authorization: Bearer <token>`
- **Success Response** (200):
  ```json
  {
    "user": {
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john@example.com"
    }
  }
  ```

#### 4. Logout User
- **URL**: GET `/logout/user`
- **Description**: Logout and blacklist token
- **Auth**: Required
- **Success Response** (200):
  ```json
  {
    "message": "User logged out successfully"
  }
  ```

### Captain Endpoints

#### 1. Register Captain
- **URL**: POST `/register/captain`
- **Description**: Register new captain with vehicle
- **Auth**: Not required
- **Body**:
  ```json
  {
    "fullname": {
      "firstname": "Mike",
      "lastname": "Johnson"
    },
    "email": "mike@example.com",
    "password": "password123",
    "vehicle": {
      "color": "Silver",
      "plateNumber": "KA01AB1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
  ```
- **Validation Rules**:
  - firstname: required, min 3 chars
  - email: valid email format
  - password: min 6 chars
  - vehicle.color: required
  - vehicle.plateNumber: required, unique
  - vehicle.capacity: 1-5
  - vehicle.vehicleType: ["car", "motorbike", "auto"]

- **Success Response** (201):
  ```json
  {
    "message": "Captain registered successfully",
    "info": {
      "token": "<jwt-token>",
      "captain": {
        "fullname": {
          "firstname": "Mike",
          "lastname": "Johnson"
        },
        "email": "mike@example.com",
        "status": "inactive",
        "vehicle": {
          "color": "Silver",
          "plateNumber": "KA01AB1234",
          "capacity": 4,
          "vehicleType": "car"
        }
      }
    }
  }
  ```

## 🔄 Data Flow

1. **Request Flow**:
   ```
   Client Request
        ↓
   Express Router (routes/*.js)
        ↓
   Input Validation (express-validator)
        ↓
   Authentication (if required)
        ↓
   Controller (controller/*.js)
        ↓
   Service Layer (services/*.js)
        ↓
   Model Layer (model/*.js)
        ↓
   MongoDB Database
   ```

2. **Authentication Flow**:
   ```
   JWT Token Received
        ↓
   Check Token Presence
        ↓
   Verify Token Signature
        ↓
   Check Blacklist
        ↓
   Load User/Captain
        ↓
   Attach to Request
   ```

## 📊 Models

### User Model
```javascript
{
  fullname: {
    firstname: { type: String, required: true, minLength: 3 },
    lastname: { type: String, minLength: 3 }
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  socketId: { type: String }
}
```

### Captain Model
```javascript
{
  fullname: {
    firstname: { type: String, required: true, minLength: 3 },
    lastname: { type: String, minLength: 3 }
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  status: { type: String, enum: ['active', 'inactive'] },
  vehicle: {
    color: { type: String, required: true },
    plateNumber: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true, min: 1, max: 5 },
    vehicleType: { type: String, enum: ['car', 'motorbike', 'auto'] }
  },
  location: {
    lat: Number,
    lng: Number
  },
  socketId: { type: String }
}
```

## ❌ Error Handling

Common error responses:

```javascript
// Validation Error (400)
{
  "errors": [{
    "msg": "Email is required",
    "param": "email",
    "location": "body"
  }]
}

// Authentication Error (401)
{
  "error": "No token, authorization denied"
}

// Duplicate Entry (400)
{
  "error": "Email already exists"
}
```

## 🔒 Security Features

1. **Password Security**
   - Bcrypt hashing (10 rounds)
   - Passwords never returned in responses
   - Password strength validation

2. **JWT Security**
   - 24-hour token expiry
   - Token blacklisting on logout
   - Secure token verification

3. **API Security**
   - Input validation & sanitization
   - CORS enabled
   - Rate limiting ready

## 🧪 Testing

Test the API using curl (PowerShell):

```powershell
# Register Captain
curl -X POST http://localhost:4000/api/v1/register/captain `
  -H "Content-Type: application/json" `
  -d '{
    "fullname": {
      "firstname": "Mike",
      "lastname": "Johnson"
    },
    "email": "mike@example.com",
    "password": "password123",
    "vehicle": {
      "color": "Silver",
      "plateNumber": "KA01AB1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }'

# Login User
curl -X POST http://localhost:4000/api/v1/login/user `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 📝 Development Notes

- Use `npm run dev` for development with nodemon
- JWT tokens are stored in cookies and can be sent via Authorization header
- Socket.IO integration is prepared for real-time features
- All dates use UTC timezone
- API versioning is implemented (current: v1)