const axios = require('axios');

// API base URL
const API_URL = 'http://localhost:5000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

/**
 * Log success message
 */
const logSuccess = (message) => {
  console.log(`${colors.green}✓ SUCCESS: ${message}${colors.reset}`);
};

/**
 * Log error message
 */
const logError = (message, error) => {
  console.error(`${colors.red}✗ ERROR: ${message}${colors.reset}`);
  if (error) {
    console.error(`${colors.red}Details: ${error.message || error}${colors.reset}`);
  }
};

/**
 * Log section header
 */
const logSection = (message) => {
  console.log(`\n${colors.yellow}=== ${message} ===${colors.reset}\n`);
};

/**
 * Test server root endpoint
 */
async function testServerRoot() {
  try {
    logSection('Testing Server Root Endpoint');
    const response = await axios.get(`${API_URL}/`);
    logSuccess(`Server is running. Response: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    logError('Failed to connect to server', error);
    return false;
  }
}

/**
 * Test todo test endpoint (unprotected)
 */
async function testTodoTestEndpoint() {
  try {
    logSection('Testing Todo Test Endpoint (Unprotected)');
    const response = await axios.get(`${API_URL}/api/todos/test`);
    logSuccess(`Todo test endpoint is working. Response: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    logError('Failed to access todo test endpoint', error);
    return false;
  }
}

/**
 * Test auth routes without authentication (should fail)
 */
async function testAuthRoutesWithoutAuth() {
  try {
    logSection('Testing Auth Routes Without Authentication (Expected to Fail)');
    
    try {
      await axios.get(`${API_URL}/api/auth/me`);
      logError('Get current user succeeded without authentication (unexpected)');
    } catch (error) {
      logSuccess('Get current user failed without authentication (expected)');
    }
    
    return true;
  } catch (error) {
    logError('Test failed unexpectedly', error);
    return false;
  }
}

/**
 * Test todo routes without authentication (should fail)
 */
async function testTodoRoutesWithoutAuth() {
  try {
    logSection('Testing Todo Routes Without Authentication (Expected to Fail)');
    
    try {
      await axios.get(`${API_URL}/api/todos`);
      logError('Get todos succeeded without authentication (unexpected)');
    } catch (error) {
      logSuccess('Get todos failed without authentication (expected)');
    }
    
    return true;
  } catch (error) {
    logError('Test failed unexpectedly', error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`\n${colors.blue}Starting Simple API Tests for ${API_URL}${colors.reset}\n`);
  
  // Test server connection
  const serverRunning = await testServerRoot();
  if (!serverRunning) {
    logError('Server is not running. Aborting tests.');
    return;
  }
  
  // Test todo test endpoint (unprotected)
  await testTodoTestEndpoint();
  
  // Test auth routes without authentication (should fail)
  await testAuthRoutesWithoutAuth();
  
  // Test todo routes without authentication (should fail)
  await testTodoRoutesWithoutAuth();
  
  console.log(`\n${colors.green}All tests completed!${colors.reset}\n`);
}

// Run the tests
runTests().catch(error => {
  console.error('Test suite error:', error);
}); 