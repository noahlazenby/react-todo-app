const serverless = require('serverless-http');
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
  console.log(`[DEBUG] ${req.method} ${req.path}`);
  
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
