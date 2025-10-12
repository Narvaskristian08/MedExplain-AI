// Test script to check backend connectivity
import fetch from 'node-fetch';

const testBackend = async () => {
  console.log('🔍 Testing backend connectivity...\n');
  
  try {
    // Test 1: Basic connectivity
    console.log('1. Testing basic connectivity...');
    const healthResponse = await fetch('http://localhost:5000');
    const healthText = await healthResponse.text();
    console.log(`✅ Backend is running: ${healthText}\n`);
    
    // Test 2: Registration endpoint
    console.log('2. Testing registration endpoint...');
    const registrationData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    };
    
    const registerResponse = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData)
    });
    
    const registerResult = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ Registration endpoint working:');
      console.log(JSON.stringify(registerResult, null, 2));
    } else {
      console.log('❌ Registration failed:');
      console.log(`Status: ${registerResponse.status}`);
      console.log(`Error: ${registerResult.message}`);
    }
    
  } catch (error) {
    console.log('❌ Backend connection failed:');
    console.log(`Error: ${error.message}`);
    console.log('\nPossible solutions:');
    console.log('1. Make sure backend is running: npm run dev:backend');
    console.log('2. Check if MongoDB is running');
    console.log('3. Verify .env file exists in backend directory');
  }
};

testBackend();
