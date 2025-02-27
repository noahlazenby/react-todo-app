const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const serverDir = path.join(__dirname, '../server');
const netlifyFunctionsDir = path.join(__dirname, '../netlify/functions');

// Create the necessary directories
const createDirectoryIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};

// Create main directories
createDirectoryIfNotExists(netlifyFunctionsDir);
createDirectoryIfNotExists(path.join(netlifyFunctionsDir, 'routes'));
createDirectoryIfNotExists(path.join(netlifyFunctionsDir, 'controllers'));
createDirectoryIfNotExists(path.join(netlifyFunctionsDir, 'middleware'));
createDirectoryIfNotExists(path.join(netlifyFunctionsDir, 'utils'));
createDirectoryIfNotExists(path.join(netlifyFunctionsDir, 'config'));

// Function to copy a file with logging
const copyFile = (source, destination) => {
  try {
    fs.copyFileSync(source, destination);
    console.log(`Copied ${source} to ${destination}`);
  } catch (error) {
    console.error(`Error copying ${source} to ${destination}:`, error);
  }
};

// Copy route files
copyFile(
  path.join(serverDir, 'routes/auth.routes.js'),
  path.join(netlifyFunctionsDir, 'routes/auth.routes.js')
);
copyFile(
  path.join(serverDir, 'routes/todo.routes.js'),
  path.join(netlifyFunctionsDir, 'routes/todo.routes.js')
);

// Copy controller files
copyFile(
  path.join(serverDir, 'controllers/auth.controller.js'),
  path.join(netlifyFunctionsDir, 'controllers/auth.controller.js')
);
copyFile(
  path.join(serverDir, 'controllers/todo.controller.js'),
  path.join(netlifyFunctionsDir, 'controllers/todo.controller.js')
);

// Copy middleware files
copyFile(
  path.join(serverDir, 'middleware/auth.middleware.js'),
  path.join(netlifyFunctionsDir, 'middleware/auth.middleware.js')
);

// Copy utility files
copyFile(
  path.join(serverDir, 'utils/AppError.js'),
  path.join(netlifyFunctionsDir, 'utils/AppError.js')
);
copyFile(
  path.join(serverDir, 'utils/catchAsync.js'),
  path.join(netlifyFunctionsDir, 'utils/catchAsync.js')
);

// Copy config files
copyFile(
  path.join(serverDir, 'config/supabase.js'),
  path.join(netlifyFunctionsDir, 'config/supabase.js')
);

// Create or update api.js file for Netlify Functions
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
    ? ['https://tinytodolist.netlify.app', 'https://*.netlify.app', 'http://localhost:3000'] 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(morgan('dev')); // HTTP request logger

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(\`[DEBUG] \${req.method} \${req.path}\`);
  
  // Only log headers and body in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEBUG] Headers:', JSON.stringify(req.headers));
    console.log('[DEBUG] Body:', JSON.stringify(req.body));
  }
  
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

// Import routes
try {
  const authRoutes = require('./routes/auth.routes');
  app.use('/auth', authRoutes);
  console.log('[DEBUG] Auth routes loaded successfully');
} catch (error) {
  console.error('[ERROR] Failed to load auth routes:', error);
  
  // Fallback middleware for auth routes
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
  
  // Fallback middleware for todo routes
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
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    status: 'error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Export the serverless function
module.exports.handler = serverless(app);
`;

fs.writeFileSync(path.join(netlifyFunctionsDir, 'api.js'), apiJsContent);
console.log(`Created ${path.join(netlifyFunctionsDir, 'api.js')}`);

// Create or update package.json for Netlify Functions
const packageJsonContent = {
  name: "todo-app-api-functions",
  version: "1.0.0",
  description: "Serverless functions for Todo App API",
  main: "api.js",
  dependencies: {
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

fs.writeFileSync(
  path.join(netlifyFunctionsDir, 'package.json'),
  JSON.stringify(packageJsonContent, null, 2)
);
console.log(`Created ${path.join(netlifyFunctionsDir, 'package.json')}`);

// Copy .env file for local development
try {
  if (fs.existsSync(path.join(__dirname, '../.env'))) {
    copyFile(
      path.join(__dirname, '../.env'),
      path.join(netlifyFunctionsDir, '.env')
    );
  } else {
    console.log('No .env file found to copy.');
  }
} catch (error) {
  console.error('Error copying .env file:', error);
}

// Install dependencies in the functions directory
console.log('Installing dependencies in the functions directory...');
try {
  execSync('cd netlify/functions && npm install', { stdio: 'inherit' });
  console.log('Dependencies installed successfully!');
} catch (error) {
  console.error('Error installing dependencies:', error);
}

console.log('Server files copied to netlify/functions successfully!'); 