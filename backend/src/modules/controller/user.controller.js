// src/modules/controller/user.controller.js
import User from "../auth/model/user.model.js";
import Document from "../documents/model/document.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/jwt.js";
import logger from "../../utils/logger.js";
import mongoose from "mongoose";

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, firstName, middleName, lastName, occupation, institutionName } = req.body;

    // Validate input
    if (!name || !email || !password) {
      logger.warn("Missing required fields in registerUser");
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn(`Invalid email format: ${email}`);
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password strength validation
    if (password.length < 6) {
      logger.warn("Password too short");
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Validate personnel fields
    if (role === "personnel") {
      if (!firstName || !lastName || !occupation || !institutionName) {
        logger.warn("Missing required personnel fields");
        return res.status(400).json({
          message: "First name, last name, occupation, and institution name are required for personnel",
        });
      }
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Email already registered: ${email}`);
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      firstName,
      middleName,
      lastName,
      occupation,
      institutionName,
    });

    await newUser.save();
    logger.info(`User registered: ${email}, role: ${role}`);

    // Generate JWT token
    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        middleName: newUser.middleName,
        lastName: newUser.lastName,
        occupation: newUser.occupation,
        institutionName: newUser.institutionName,
        verified: newUser.verified,
      },
    });
  } catch (err) {
    logger.error(`Error registering user: ${err.message}`);
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
};

// Get all users (no password returned)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Get user profile (protected route)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

// Logout user
export const logoutUser = async (req, res) => {
  try {
    // Get user info from the authenticated request
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Since we're using JWT, logout is primarily handled client-side by removing the token
    // The server can log the logout event for audit purposes
    console.log(`User ${userId} logged out at ${new Date().toISOString()}`);
    
    // In a more advanced setup, you might want to implement token blacklisting
    // by storing invalidated tokens in Redis or a database
    
    res.status(200).json({ 
      message: "Logout successful",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      message: "Error logging out", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const verifyUser = async (req, res) => {
  try { // Checker for Personnel Verification
    if (req.user.role !== "admin") {
      logger.warn(`Unauthorized verification attempt by user: ${req.user._id}`);
      return res.status(403).json({ message: "Admin access required" });
    }

    const { userId, verified } = req.body;
    if (!userId || typeof verified !== "boolean") {
      logger.warn("Invalid verification request: missing userId or verified");
      return res.status(400).json({ message: "userId and verified (boolean) are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found for verification: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "personnel") {
      logger.warn(`Verification attempted on non-personnel user: ${userId}`);
      return res.status(400).json({ message: "Only personnel can be verified" });
    }

    user.verified = verified;
    await user.save();
    logger.info(`User verified: ${userId}, verified: ${verified}`);

    res.status(200).json({
      message: `User ${verified ? "verified" : "unverified"} successfully`,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        verified: user.verified,
      },
    });
  } catch (err) {
    logger.error(`Error verifying user: ${err.message}`);
    res.status(500).json({ message: "Error verifying user", error: err.message });
  }
};

// Get User Document History
export const getUserHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, dateFrom, dateTo } = req.query;

    // Log incoming ID for debugging
    logger.info(`Attempting to fetch history for userId: ${id}`);

    // Validate ObjectId
    if (!mongoose.isValidObjectId(id)) {
      logger.warn(`Invalid user ID format: ${id}`);
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Build query
    const query = { userId: id };
    if (dateFrom) {
      query.createdAt = { $gte: new Date(dateFrom) };
    }
    if (dateTo) {
      query.createdAt = { ...query.createdAt, $lte: new Date(dateTo) };
    }

    // Parse pagination params
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      logger.warn(`Invalid pagination params: page=${page}, limit=${limit}`);
      return res.status(400).json({ message: "Invalid page or limit" });
    }

    // Query documents with user population
    const documents = await Document.find(query)
      .select("simplifiedText createdAt")
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Format response to include user id and name
    const formattedDocuments = documents.map(doc => ({
      user: {
        id: doc.userId._id,
        name: doc.userId.name
      },
      simplifiedText: doc.simplifiedText || "Not simplified",
      createdAt: doc.createdAt
    }));

    // Get total count for pagination
    const total = await Document.countDocuments(query);

    logger.info(`Fetched history for user: ${id}, page: ${pageNum}, limit: ${limitNum}, found: ${documents.length}`);

    res.status(200).json({
      message: "User history retrieved successfully",
      documents: formattedDocuments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    logger.error(`Error fetching user history: ${err.message}`);
    res.status(500).json({ message: "Error fetching user history", error: err.message });
  }
};