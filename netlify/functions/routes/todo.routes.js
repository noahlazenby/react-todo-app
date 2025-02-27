const express = require('express');
const todoController = require('../controllers/todo.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Test route that doesn't require authentication
router.get('/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Todo API test endpoint is working'
  });
});

// Protect all other routes
router.use(authMiddleware.protect);

// Routes
router
  .route('/')
  .get(todoController.getAllTodos)
  .post(todoController.createTodo);

router
  .route('/:id')
  .get(todoController.getTodo)
  .patch(todoController.updateTodo)
  .delete(todoController.deleteTodo);

module.exports = router; 