#!/usr/bin/env node

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import readline from "readline";
import User from "../src/modules/auth/model/user.model.js";

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Helper function to ask for password (hidden input)
const askPassword = (question) => {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    process.stdin.on('data', function(char) {
      char = char + '';
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
};

// Main function to create admin user
const createAdminUser = async () => {
  try {
    console.log('🔧 Admin User Creation Tool');
    console.log('============================\n');

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Get user input
    const name = await askQuestion('Enter admin name: ');
    if (!name.trim()) {
      console.log('❌ Name is required');
      process.exit(1);
    }

    const email = await askQuestion('Enter admin email: ');
    if (!email.trim()) {
      console.log('❌ Email is required');
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User with this email already exists');
      process.exit(1);
    }

    const password = await askPassword('Enter admin password: ');
    if (!password.trim()) {
      console.log('❌ Password is required');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      process.exit(1);
    }

    const confirmPassword = await askPassword('Confirm password: ');
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      process.exit(1);
    }

    // Hash password
    console.log('\nHashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('=====================================');
    console.log(`Name: ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`Created: ${adminUser.createdAt}`);
    console.log('=====================================\n');

    console.log('🎉 You can now login with this admin account!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    // Close database connection and readline
    await mongoose.connection.close();
    rl.close();
  }
};

// Handle script arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔧 Admin User Creation Tool

Usage:
  npm run create-admin
  node scripts/create-admin.js

Options:
  --help, -h    Show this help message

This script will guide you through creating an admin user.
Make sure your .env file is configured with MONGO_URI.
  `);
  process.exit(0);
}

// Check if MONGO_URI is set
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  console.log('Please set MONGO_URI in your .env file');
  process.exit(1);
}

// Run the script
createAdminUser();
