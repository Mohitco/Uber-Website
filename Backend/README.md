# Uber Website — Backend

This repository contains the backend API for the "Uber Website" project. It's a small Node.js + Express application using MongoDB (Mongoose) for persistence. The backend provides user authentication (register, login, profile, logout) with JWT-based tokens and token blacklisting for logout.

## Table of contents
- Project structure
- Prerequisites
- Environment variables
- Install & run
- API reference (endpoints, payloads, responses)
- Data model
- Request / response & data flow
- Security & notes
- Troubleshooting

## Project structure

```
Backend/
├── app.js                # Express app configuration
├── server.js             # Server initialization
├── config/
│   └── db.js             # Database connection
├── controller/
│   └── user_controller.js# Route handlers for user actions
├── middleware/
│   └── auth.middleware.js# JWT auth + token blacklist check
├── model/
│   ├── user_model.js     # Mongoose user schema + helper methods
│   └── blacklistToken.js # Token blacklist schema
├── routes/
│   └── user_routes.js    # Route definitions + validation rules
└── services/
    └── user_services.js  # Business logic (createUser, etc.)
```

## Prerequisites

- Node.js (v14+ recommended)
- npm
- MongoDB URI (local or cloud)

## Environment variables

Create a `.env` file at the project root (Backend/). Required variables:

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/uber-website
JWT_SECRET=your_jwt_secret_here
```

## Install & run

Install dependencies and start the server (PowerShell / cmd compatible):

```powershell
npm install
npm start
```

By default the app listens on `http://localhost:4000`. The API base path is `/api/v1`.

Base URL: http://localhost:4000/api/v1

## API Reference

All endpoints are under `/api/v1`.

### 1) Register — Create a new user
- Endpoint: POST /register/user
- Description: Register a new user. Validates input, hashes password, creates user, returns JWT and created user (without password).

Request headers:
- Content-Type: application/json

Request body example:

```json
{
  "fullname": { "firstname": "John", "lastname": "Doe" },
  "email": "john@example.com",
  "password": "password123"
}
```

Validation rules (from `routes/user_routes.js`):
- `email` must be a valid email
- `fullname.firstname` min length 3
- `password` min length 6

Successful response (201):

```json
{
  "message": "user Sucessfully created",
  "info": {
    "token": "<jwt-token>",
    "user": { "_id": "...", "fullname": { "firstname": "John", "lastname": "Doe" }, "email": "john@example.com", "socketId": null }
  }
}
```

Errors:
- 400: Validation errors
- 500: Server / DB errors (unique email violation, etc.)

Implementation notes:
- `user_controller.register` uses `express-validator` to check inputs, `userModel.hashPassword()` (bcrypt) to hash the password, `userService.createUser()` to create the DB record, and `user.generateAuthToken()` to sign a JWT.

### 2) Login — Authenticate user
- Endpoint: POST /login/user
- Description: Authenticate a user by email and password. Returns JWT and user data. Also sets a cookie named `token`.

Request headers:
- Content-Type: application/json

Request body example:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Successful response (200):

```json
{
  "message": "user Sucessfully logged in",
  "info": {
    "token": "<jwt-token>",
    "user": { "_id": "...", "fullname": { "firstname": "John", "lastname": "Doe" }, "email": "john@example.com", "socketId": null }
  }
}
```

Notes:
- The server sets an HTTP cookie `token` containing the JWT: `res.cookie('token', token);`
- The user password is selected (`.select('+password')`) for comparison but is not returned in the response.

Errors:
- 400: Invalid credentials or user not found
- 400: Validation errors

### 3) Get Profile — Protected route
- Endpoint: GET /user/profile
- Description: Returns the authenticated user's profile.

Authentication:
- Requires valid JWT token, either in cookie `token` or in `Authorization` header as `Bearer <token>`.

Successful response (200):

```json
{
  "user": { "_id": "...", "fullname": { "firstname": "John", "lastname": "Doe" }, "email": "john@example.com", "socketId": null }
}
```

Errors:
- 401: No token or invalid token

Middleware behavior (`middleware/auth.middleware.js`):
- Reads token from `req.cookies.token` or `Authorization` header
- Checks `BlacklistToken` collection — if found, rejects
- Verifies JWT (`jwt.verify(..., JWT_SECRET)`)
- Loads user from DB and attaches to `req.user`

### 4) Logout — Blacklist token and clear cookie
- Endpoint: GET /logout/user
- Description: Clears the cookie and stores the current token in `blacklistToken` collection so it cannot be reused.

Behavior:
- `res.clearCookie('token')` clears cookie
- The token (from cookie or Authorization header) is saved into `BlacklistToken` model so subsequent requests using that token fail auth (token schema has an expiry TTL of 24 hours)

Successful response (200):

```json
{ "message": "User logged out successfully" }
```

Errors:
- 500: If blacklist write fails

## Data model

User model (`model/user_model.js`) — fields and helpers:

Schema shape:

```js
{
  fullname: {
    firstname: { type: String, required: true, minlength: 3 },
    lastname: { type: String, minlength: 3 }
  },
  email: { type: String, required: true, unique: true, minlength: 5 },
  password: { type: String, required: true, select: false },
  socketId: { type: String }
}
```

Helpers / methods:
- `userModel.hashPassword(password)` — static, uses bcrypt.hash(password, 10)
- `user.comparePassword(password)` — instance method, compares via bcrypt.compare
- `user.generateAuthToken()` — instance method, signs JWT with `JWT_SECRET` and 24h expiry

BlacklistToken model (`model/blacklistToken.js`):
- `token` string, unique
- `createdAt` with TTL index set to expire after 86400 seconds (24h) — tokens will be removed automatically

## Request / response & data flow

High-level flow for register/login/profile requests:

1. Client sends HTTP request to Express route (e.g., POST /api/v1/register/user)
2. Route-level validators (express-validator) validate request body
3. Controller receives validated input and uses service/model functions
   - For register: controller hashes password, calls service to create user
   - For login: controller finds user, compares password
4. Controller generates JWT using `user.generateAuthToken()` and returns it in the response body and (for login) as a cookie
5. For protected routes, `auth.middleware` extracts token (cookie or Authorization header), checks blacklist collection, verifies JWT, fetches user from DB, and sets `req.user` for controllers to use

Sequence diagram (text):

Client -> Router -> Controller -> Service -> Model -> MongoDB
MongoDB -> Model -> Service -> Controller -> Router -> Client

Auth sequence for protected route:

Client (sends cookie or Authorization header) -> auth.middleware
auth.middleware -> BlacklistToken.findOne(token)
if blacklisted -> 401
else jwt.verify -> userModel.findById(decoded.id) -> attach user to req

## Security & notes

- Passwords are hashed with bcrypt; never stored in plain text.
- JWTs are signed with `JWT_SECRET`. Keep the secret safe and rotate as necessary.
- Logout is implemented using token blacklisting (temporary blacklist stored for 24h). This prevents reuse of tokens after logout.
- The server sets an authentication cookie on login. For API clients, you can instead send the token in the `Authorization: Bearer <token>` header.

Potential improvements:
- Set `httpOnly`, `secure`, `sameSite` flags on cookies for better security.
- Add refresh tokens if longer sessions are needed.
- Add rate limiting to login/register endpoints.

## Troubleshooting

- 401 on protected route: Ensure the `token` cookie is present or send `Authorization: Bearer <token>` header. Also check blacklist collection.
- 500 or duplicate key error on register: The email is already registered.
- DB connection errors: Ensure `MONGODB_URI` is correct and MongoDB is running.

## Example requests (curl / PowerShell)

Register:

```powershell
curl -X POST http://localhost:4000/api/v1/register/user -H "Content-Type: application/json" -d '{"fullname": {"firstname":"John","lastname":"Doe"},"email":"john@example.com","password":"password123"}'
```

Login:

```powershell
curl -X POST http://localhost:4000/api/v1/login/user -H "Content-Type: application/json" -d '{"email":"john@example.com","password":"password123"}' -c cookie.txt
```

Get profile (using saved cookie):

```powershell
curl http://localhost:4000/api/v1/user/profile -b cookie.txt
```

Logout:

```powershell
curl http://localhost:4000/api/v1/logout/user -b cookie.txt
```

## Final notes

This README documents the current implementation of user auth in this backend. If you update controllers, routes, or auth behavior, please keep this README in sync.

---

