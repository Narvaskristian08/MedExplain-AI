# Backend API Server

A Node.js/Express.js backend API server with MongoDB integration, JWT authentication, and user management system.

## Project Structure

```
backend/
├── src/
│   ├── app.js                 # Main application entry point
│   ├── config/               # Configuration files
│   ├── middleware/           # Custom middleware
│   │   └── auth.js          # Authentication & authorization
│   ├── modules/             # Feature modules
│   │   ├── auth/           # Authentication module
│   │   │   ├── model/      # Database models
│   │   │   └── routes/     # Route definitions
│   │   └── controller/     # Business logic controllers
│   └── utils/              # Utility functions
│       └── jwt.js         # JWT token utilities
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation
```bash
cd backend
npm install
```

### Environment Setup
Create a `.env` file in the backend root:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/your-database-name
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### Running the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### Creating Admin Users
```bash
# Create an admin user (interactive)
npm run create-admin

# Or run directly
node scripts/create-admin.js

# Show help
node scripts/create-admin.js --help
```

The admin creation script will:
- Connect to your MongoDB database
- Prompt for admin details (name, email, password)
- Validate email format and password strength
- Check if user already exists
- Hash the password securely
- Create the admin user with 'admin' role
- Display confirmation with user details

**Example Usage:**
```bash
$ npm run create-admin
🔧 Admin User Creation Tool
============================

Connecting to MongoDB...
Connected to MongoDB

Enter admin name: John Admin
Enter admin email: admin@example.com
Enter admin password: ********
Confirm password: ********

Hashing password...
Creating admin user...

Admin user created successfully!
=====================================
Name: John Admin
Email: admin@example.com
Role: admin
Created: 2024-01-15T10:30:00.000Z
=====================================

You can now login with this admin account!
```

## 🏗️ Adding New Features

### 1. Creating a New Module

When adding a new feature (e.g., "products"), follow this structure:

#### Step 1: Create the Module Directory
```bash
mkdir -p src/modules/products/{model,routes}
```

#### Step 2: Create the Model
Create `src/modules/products/model/product.model.js`:
```javascript
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
```

#### Step 3: Create the Controller
Create `src/modules/products/controller/product.controller.js`:
```javascript
import Product from "../model/product.model.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('createdBy', 'name email');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email');
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    
    // Validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      createdBy: req.user.id // From authenticated user
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user owns the product or is admin
    if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user owns the product or is admin
    if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};
```

#### Step 4: Create the Routes
Create `src/modules/products/routes/product.routes.js`:
```javascript
import { Router } from "express";
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "../../controller/product.controller.js";
import { authenticateToken, authorizeRole } from "../../../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", getProducts);           // GET /api/products
router.get("/:id", getProduct);         // GET /api/products/:id

// Protected routes (require authentication)
router.post("/", authenticateToken, createProduct);                    // POST /api/products
router.put("/:id", authenticateToken, updateProduct);                  // PUT /api/products/:id
router.delete("/:id", authenticateToken, deleteProduct);               // DELETE /api/products/:id

// Admin only routes
router.get("/admin/all", authenticateToken, authorizeRole(['admin']), getProducts);

export default router;
```

#### Step 5: Register Routes in App
Update `src/app.js`:
```javascript
// Add this import
import productRoutes from "./modules/products/routes/product.routes.js";

// Add this route registration
app.use("/api/products", productRoutes);
```

### 2. Adding New Middleware

Create custom middleware in `src/middleware/`:

#### Example: Request Logger Middleware
Create `src/middleware/logger.js`:
```javascript
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
};

export const responseTime = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`Response time: ${duration}ms`);
  });
  next();
};
```

Use in `app.js`:
```javascript
import { requestLogger, responseTime } from "./middleware/logger.js";

app.use(requestLogger);
app.use(responseTime);
```

### 3. Adding New Utility Functions

Create utilities in `src/utils/`:

#### Example: Email Validation Utility
Create `src/utils/validation.js`:
```javascript
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};
```

### 4. Database Configuration

#### Environment Variables
Add to your `.env` file:
```env
# Database
MONGO_URI=mongodb://localhost:27017/your-app-name
DB_NAME=your-app-name

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

#### Database Connection Options
Update `src/app.js` for better connection handling:
```javascript
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
.then(() => {
  console.log("MongoDB Connected Successfully");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.error("Database connection error:", err);
  process.exit(1);
});
```

## 🔐 Authentication & Authorization

### Using Authentication Middleware
```javascript
import { authenticateToken, authorizeRole } from "../../middleware/auth.js";

// Require authentication
router.get("/protected", authenticateToken, someController);

// Require specific role
router.get("/admin-only", authenticateToken, authorizeRole(['admin']), adminController);

// Require multiple roles
router.get("/staff", authenticateToken, authorizeRole(['admin', 'user']), staffController);
```

### Creating Protected Routes
```javascript
// In your controller
export const protectedAction = async (req, res) => {
  try {
    // Access user info from req.user (set by authenticateToken middleware)
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Your protected logic here
    res.json({ message: "Protected action successful", userId });
  } catch (error) {
    res.status(500).json({ message: "Error in protected action", error: error.message });
  }
};
```

## Testing Your API

### Using Postman/Thunder Client
1. **Register a user**: `POST /api/users/register`
2. **Login**: `POST /api/users/login` (save the token)
3. **Test protected routes**: Include `Authorization: Bearer <token>` header

### Example API Calls
```bash
# Register
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Protected route
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Best Practices

### 1. Error Handling
```javascript
export const someController = async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};
```

### 2. Input Validation
```javascript
export const createItem = async (req, res) => {
  try {
    const { name, email, age } = req.body;
    
    // Validation
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    // Continue with logic...
  } catch (error) {
    // Error handling
  }
};
```

### 3. Response Formatting
```javascript
// Success response
res.status(200).json({
  success: true,
  message: "Operation successful",
  data: result,
  timestamp: new Date().toISOString()
});

// Error response
res.status(400).json({
  success: false,
  message: "Validation error",
  errors: validationErrors
});
```

## Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a production MongoDB URI
3. Set strong JWT secrets
4. Configure CORS for your frontend domain

### Production Scripts
Add to `package.json`:
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "build": "echo 'No build step needed for Node.js'"
  }
}
```

##  Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for cloud database

## Contributing

1. Follow the established folder structure
2. Add proper error handling
3. Include input validation
4. Write clear comments
5. Test your endpoints before committing


