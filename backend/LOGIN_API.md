# Login API Documentation

## Overview
This backend provides a complete authentication system with JWT tokens, user registration, login, and protected routes.

## Environment Variables
Create a `.env` file in the backend root directory with the following variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/your-database-name

# Server
PORT=5000

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
```

## API Endpoints

### Public Routes

#### 1. Register User
- **POST** `/api/users/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "intern" // optional, defaults to "intern"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "intern"
    }
  }
  ```

#### 2. Login User
- **POST** `/api/users/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "intern"
    }
  }
  ```

#### 3. Logout User
- **POST** `/api/users/logout`
- **Response:**
  ```json
  {
    "message": "Logout successful"
  }
  ```

### Protected Routes
All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

#### 4. Get User Profile
- **GET** `/api/users/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "intern"
    }
  }
  ```

#### 5. Get All Users (Supervisor Only)
- **GET** `/api/users`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Supervisor role required
- **Response:**
  ```json
  [
    {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "intern"
    }
  ]
  ```

## Features


### User Roles
- **user**: Default role, can access profile
- **admin**: Can access all users list and profile

### Error Handling
- Proper HTTP status codes
- Detailed error messages
- Input validation errors
- Authentication errors
- Authorization errors

## Usage Examples

### Frontend Integration

#### Login
```javascript
const login = async (email, password) => {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store token in localStorage or secure storage
    localStorage.setItem('token', data.token);
    return data.user;
  } else {
    throw new Error(data.message);
  }
};
```

#### Making Authenticated Requests
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
};
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with your configuration

3. Start the server:
   ```bash
   npm run dev
   ```

4. The server will run on `http://localhost:5000`

## Testing the API

You can test the API using tools like Postman or curl:

```bash
# Register a user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get profile (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer TOKEN"
```

