# Plant Backend Authentication System

This is a Node.js backend authentication system using PostgreSQL and pgAdmin for the Plant application.

## Features

- User registration and login
- JWT authentication
- Password hashing with bcrypt
- PostgreSQL database integration
- Express.js REST API

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- pgAdmin (for database management)

## Setup Instructions

### 1. Database Setup

1. Open pgAdmin and connect to your PostgreSQL server
2. Create a new database named `plant_db`
3. Run the SQL script in `config/init.sql` to create the necessary tables

### 2. Environment Configuration

Update the `.env` file with your database credentials and JWT secret:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=plant_db
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

PORT=5000
NODE_ENV=development

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ "username": "user", "email": "user@example.com", "password": "password123" }`

- `POST /api/auth/login` - Login and get JWT token
  - Body: `{ "email": "user@example.com", "password": "password123" }`

- `GET /api/auth/profile` - Get user profile (requires authentication)
  - Header: `Authorization: Bearer YOUR_JWT_TOKEN`

### User

- `GET /api/users/me` - Get current user information (requires authentication)
  - Header: `Authorization: Bearer YOUR_JWT_TOKEN`

## Authentication Flow

1. User registers with username, email, and password
2. Password is hashed using bcrypt before storing in the database
3. User logs in with email and password
4. Server validates credentials and returns a JWT token
5. Client includes the JWT token in the Authorization header for protected routes
6. Server verifies the token and grants access to protected resources

## Project Structure

```
backend/
├── config/             # Configuration files
│   ├── db.config.js    # Database connection
│   └── init.sql        # Database initialization script
├── controllers/        # Request handlers
│   └── auth.controller.js
├── middleware/         # Custom middleware
│   └── auth.middleware.js
├── models/             # Database models
│   └── user.model.js
├── routes/             # API routes
│   ├── auth.routes.js
│   └── user.routes.js
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
├── README.md           # Documentation
└── server.js           # Entry point
```