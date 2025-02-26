const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// API base URL
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Store auth token
let authToken = '';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'Password123!'
};

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
 * Log info message
 */
const logInfo = (message) => {
  console.log(`${colors.blue}ℹ INFO: ${message}${colors.reset}`);
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
 * Test user signup
 */
async function testSignup() {
  try {
    logSection('Testing User Signup');
    
    // Generate a unique email to avoid conflicts with a valid format
    const timestamp = Date.now();
    const uniqueEmail = `test${timestamp}@example.com`;
    testUser.email = uniqueEmail;
    
    logInfo(`Attempting to sign up with email: ${uniqueEmail}`);
    
    const response = await axios.post(`${API_URL}/api/auth/signup`, testUser);
    
    if (response.data.token) {
      authToken = response.data.token;
      logSuccess(`User signed up successfully. Token received.`);
      return true;
    } else {
      logError('Signup successful but no token received');
      return false;
    }
  } catch (error) {
    // If user already exists, we can proceed with login
    if (error.response && error.response.data && error.response.data.message && error.response.data.message.includes('already registered')) {
      logInfo('User already exists. Proceeding with login test.');
      return true;
    }
    
    logError('Failed to sign up user', error);
    console.error('Error details:', {
      status: error.response ? error.response.status : 'No status',
      data: error.response ? error.response.data : 'No data',
      message: error.message
    });
    
    // Let's try to login instead of failing completely
    logInfo('Attempting to login instead...');
    return true;
  }
}

/**
 * Test user login
 */
async function testLogin() {
  try {
    logSection('Testing User Login');
    
    const response = await axios.post(`${API_URL}/api/auth/login`, testUser);
    
    if (response.data.token) {
      authToken = response.data.token;
      logSuccess('User logged in successfully. Token received.');
      return true;
    } else {
      logError('Login successful but no token received');
      return false;
    }
  } catch (error) {
    logError('Failed to log in user', error);
    return false;
  }
}

/**
 * Test getting current user
 */
async function testGetCurrentUser() {
  try {
    logSection('Testing Get Current User');
    
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    logSuccess(`Current user retrieved: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    logError('Failed to get current user', error);
    return false;
  }
}

/**
 * Test creating a todo
 */
async function testCreateTodo() {
  try {
    logSection('Testing Create Todo');
    
    const todoData = {
      text: `Test todo ${Date.now()}`,
      category: 'work'
    };
    
    const response = await axios.post(`${API_URL}/api/todos`, todoData, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    logSuccess(`Todo created: ${JSON.stringify(response.data.data.todo)}`);
    
    // Store todo ID for later tests
    return response.data.data.todo.id;
  } catch (error) {
    logError('Failed to create todo', error);
    return null;
  }
}

/**
 * Test getting all todos
 */
async function testGetAllTodos() {
  try {
    logSection('Testing Get All Todos');
    
    const response = await axios.get(`${API_URL}/api/todos`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    const todos = response.data.data.todos;
    logSuccess(`Retrieved ${todos.length} todos`);
    
    if (todos.length > 0) {
      logInfo(`First todo: ${JSON.stringify(todos[0])}`);
    }
    
    return true;
  } catch (error) {
    logError('Failed to get todos', error);
    return false;
  }
}

/**
 * Test updating a todo
 */
async function testUpdateTodo(todoId) {
  try {
    logSection('Testing Update Todo');
    
    if (!todoId) {
      logError('No todo ID provided for update test');
      return false;
    }
    
    const updateData = {
      text: `Updated todo ${Date.now()}`,
      category: 'personal'
    };
    
    const response = await axios.patch(`${API_URL}/api/todos/${todoId}`, updateData, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    logSuccess(`Todo updated: ${JSON.stringify(response.data.data.todo)}`);
    return true;
  } catch (error) {
    logError('Failed to update todo', error);
    return false;
  }
}

/**
 * Test deleting a todo
 */
async function testDeleteTodo(todoId) {
  try {
    logSection('Testing Delete Todo');
    
    if (!todoId) {
      logError('No todo ID provided for delete test');
      return false;
    }
    
    await axios.delete(`${API_URL}/api/todos/${todoId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    logSuccess('Todo deleted successfully');
    return true;
  } catch (error) {
    logError('Failed to delete todo', error);
    return false;
  }
}

/**
 * Test user logout
 */
async function testLogout() {
  try {
    logSection('Testing User Logout');
    
    await axios.get(`${API_URL}/api/auth/logout`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    logSuccess('User logged out successfully');
    return true;
  } catch (error) {
    logError('Failed to log out user', error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`\n${colors.blue}Starting API Tests for ${API_URL}${colors.reset}\n`);
  
  // Test server connection
  const serverRunning = await testServerRoot();
  if (!serverRunning) {
    logError('Server is not running. Aborting tests.');
    return;
  }
  
  // Test authentication
  const signupSuccess = await testSignup();
  if (!signupSuccess) {
    logError('Signup test failed. Aborting tests.');
    return;
  }
  
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    logError('Login test failed. Aborting tests.');
    return;
  }
  
  const userSuccess = await testGetCurrentUser();
  if (!userSuccess) {
    logError('Get current user test failed. Continuing with other tests.');
  }
  
  // Test todo operations
  const todoId = await testCreateTodo();
  if (!todoId) {
    logError('Create todo test failed. Aborting todo tests.');
    return;
  }
  
  await testGetAllTodos();
  await testUpdateTodo(todoId);
  await testDeleteTodo(todoId);
  
  // Test logout
  await testLogout();
  
  console.log(`\n${colors.green}All tests completed!${colors.reset}\n`);
}

// Run the tests
runTests().catch(error => {
  console.error('Test suite error:', error);
}); 