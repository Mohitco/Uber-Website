# Uber Website Backend

This is the backend service for the Uber Website project, built with Node.js, Express, and MongoDB.

## Project Structure

```
Backend/
├── app.js          # Express app configuration
├── server.js       # Server initialization
├── config/
│   └── db.js       # Database configuration
├── controller/
│   └── user_controller.js    # User route handlers
├── model/
│   └── user_model.js        # User mongoose schema
├── routes/
│   └── user_routes.js       # User route definitions
└── services/
    └── user_services.js     # User business logic
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
```

3. Start the server:
```bash
npm start
```

The server will start running at `http://localhost:3000`.

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### 1. Register User
- **Endpoint**: `POST /register/user`
- **Description**: Register a new user
- **Request Body**:
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
- **Validation**:
  - Email must be valid
  - First name must be at least 3 characters
  - Password must be at least 6 characters

#### 2. Login User
- **Endpoint**: `POST /login/user`
- **Description**: Authenticate existing user
- **Request Body**:
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```
- **Validation**:
  - Email must be valid
  - Password must be at least 6 characters

## Data Flow

1. **Request Flow**:
   - Client makes HTTP request → Express Router → Controller → Service → Model → Database
   - Database → Model → Service → Controller → Client Response

2. **Authentication Flow**:
   - User registration:
     1. Request validated using express-validator
     2. Password hashed using bcrypt
     3. User created in database
     4. JWT token generated and returned

   - User login:
     1. Request validated
     2. User credentials verified
     3. JWT token generated and returned

## Security Features

1. Password Hashing:
   - Passwords are hashed using bcrypt before storage
   - Passwords are never stored in plain text

2. JWT Authentication:
   - Secure token generation using JWT
   - Tokens signed with secret key

3. Input Validation:
   - Request validation using express-validator
   - Data sanitization and validation before processing

## Models

### User Model

```javascript
{
    fullname: {
        firstname: String,  // required, min 3 chars
        lastname: String    // min 3 chars
    },
    email: String,         // required, unique, min 5 chars
    password: String,      // required, not returned in queries
    socketId: String       // optional
}
```

## Error Handling

The API implements proper error handling for:
- Invalid input data
- Authentication failures
- Database errors
- Server errors

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- express-validator
- cors
- dotenv

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request