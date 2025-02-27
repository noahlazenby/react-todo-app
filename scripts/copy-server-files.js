const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to copy from server to netlify/functions
const directories = [
  'routes',
  'controllers',
  'middleware',
  'utils',
  'config'
];

// Create base netlify/functions directory if it doesn't exist
const functionsDir = path.join(__dirname, '..', 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
}

// Copy each directory
directories.forEach(dir => {
  const sourceDir = path.join(__dirname, '..', 'server', dir);
  const targetDir = path.join(functionsDir, dir);
  
  // Skip if source directory doesn't exist
  if (!fs.existsSync(sourceDir)) {
    console.log(`Source directory ${sourceDir} does not exist. Skipping.`);
    return;
  }
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy all files from source to target
  const files = fs.readdirSync(sourceDir);
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    // Skip directories
    if (fs.statSync(sourcePath).isDirectory()) {
      console.log(`Skipping directory ${sourcePath}`);
      return;
    }
    
    // Copy file
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${sourcePath} to ${targetPath}`);
  });
});

// Create api.js file for Netlify Functions
const apiJsContent = `const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tinytodolist.netlify.app', '*'] 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(morgan('dev')); // HTTP request logger

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(\`[DEBUG] \${req.method} \${req.path}\`);
  console.log('[DEBUG] Headers:', JSON.stringify(req.headers));
  console.log('[DEBUG] Body:', JSON.stringify(req.body));
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the Todo API',
    routes: {
      auth: '/auth',
      todos: '/todos'
    }
  });
});

// Check if route files exist
const routesDir = path.join(__dirname, 'routes');
const authRoutesPath = path.join(routesDir, 'auth.routes.js');
const todoRoutesPath = path.join(routesDir, 'todo.routes.js');

console.log('[DEBUG] Routes directory exists:', fs.existsSync(routesDir));
console.log('[DEBUG] Auth routes file exists:', fs.existsSync(authRoutesPath));
console.log('[DEBUG] Todo routes file exists:', fs.existsSync(todoRoutesPath));

// Import routes
try {
  const authRoutes = require('./routes/auth.routes');
  app.use('/auth', authRoutes);
  console.log('[DEBUG] Auth routes loaded successfully');
} catch (error) {
  console.error('[ERROR] Failed to load auth routes:', error);
  app.use('/auth', (req, res) => {
    res.status(500).json({ 
      message: 'Auth routes failed to load',
      error: error.message
    });
  });
}

try {
  const todoRoutes = require('./routes/todo.routes');
  app.use('/todos', todoRoutes);
  console.log('[DEBUG] Todo routes loaded successfully');
} catch (error) {
  console.error('[ERROR] Failed to load todo routes:', error);
  app.use('/todos', (req, res) => {
    res.status(500).json({ 
      message: 'Todo routes failed to load',
      error: error.message
    });
  });
}

// 404 handler
app.use((req, res, next) => {
  console.log('[DEBUG] 404 Not Found:', req.method, req.path);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err,
    path: req.path,
    method: req.method
  });
});

// Export the serverless function
module.exports.handler = serverless(app);`;

// Write api.js file
const apiJsPath = path.join(functionsDir, 'api.js');
fs.writeFileSync(apiJsPath, apiJsContent);
console.log(`Created ${apiJsPath}`);

// Create package.json file for Netlify Functions
const packageJsonContent = {
  "name": "todo-app-api-functions",
  "version": "1.0.0",
  "description": "Serverless functions for Todo App API",
  "main": "api.js",
  "dependencies": {
    "@supabase/supabase-js": "^2.38.4",
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "serverless-http": "^3.2.0",
    "validator": "^13.11.0"
  }
};

// Write package.json file
const packageJsonPath = path.join(functionsDir, 'package.json');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
console.log(`Created ${packageJsonPath}`);

// Create .env file for Netlify Functions with environment variables
const envContent = `
NODE_ENV=${process.env.NODE_ENV || 'development'}
JWT_SECRET=${process.env.JWT_SECRET || 'your-secret-key'}
JWT_EXPIRES_IN=${process.env.JWT_EXPIRES_IN || '1d'}
JWT_REFRESH_EXPIRES_IN=${process.env.JWT_REFRESH_EXPIRES_IN || '7d'}
SUPABASE_URL=${process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || ''}
SUPABASE_ANON_KEY=${process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || ''}
`;

// Write .env file
const envPath = path.join(functionsDir, '.env');
fs.writeFileSync(envPath, envContent);
console.log(`Created ${envPath}`);

// Install dependencies in the Netlify Functions directory
console.log('Installing dependencies in the Netlify Functions directory...');
try {
  execSync('npm install', { cwd: functionsDir, stdio: 'inherit' });
  console.log('Dependencies installed successfully!');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
}

console.log('Server files copied to netlify/functions successfully!'); 