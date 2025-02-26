const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Table name in Supabase
const TABLE_NAME = 'todos';

/**
 * Get all todos for the current user
 */
exports.getAllTodos = catchAsync(async (req, res, next) => {
  // Get category filter from query params
  const { category } = req.query;
  
  // Build query
  let query = supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });
  
  // Apply category filter if provided
  if (category) {
    query = query.eq('category', category);
  }
  
  // Execute query
  const { data, error } = await query;
  
  if (error) {
    return next(new AppError('Error fetching todos', 500));
  }
  
  res.status(200).json({
    status: 'success',
    results: data.length,
    data: {
      todos: data
    }
  });
});

/**
 * Get a single todo by ID
 */
exports.getTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();
  
  if (error) {
    return next(new AppError('Todo not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      todo: data
    }
  });
});

/**
 * Create a new todo
 */
exports.createTodo = catchAsync(async (req, res, next) => {
  const { text, category = 'personal' } = req.body;
  
  if (!text) {
    return next(new AppError('Please provide todo text', 400));
  }
  
  try {
    console.log('Creating todo with data:', {
      text,
      category,
      user_id: req.user.id
    });
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{
        text,
        category,
        completed: false,
        user_id: req.user.id
      }])
      .select();
    
    if (error) {
      console.error('Supabase error creating todo:', error);
      return next(new AppError(`Error creating todo: ${error.message}`, 400));
    }
    
    if (!data || data.length === 0) {
      return next(new AppError('Todo was created but no data was returned', 500));
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        todo: data[0]
      }
    });
  } catch (err) {
    console.error('Unexpected error creating todo:', err);
    return next(new AppError(`Unexpected error: ${err.message}`, 500));
  }
});

/**
 * Update a todo
 */
exports.updateTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { text, category, completed } = req.body;
  
  // Check if todo exists and belongs to user
  const { data: existingTodo, error: findError } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();
  
  if (findError) {
    return next(new AppError('Todo not found or not authorized', 404));
  }
  
  // Update todo
  const updateData = {};
  if (text !== undefined) updateData.text = text;
  if (category !== undefined) updateData.category = category;
  if (completed !== undefined) updateData.completed = completed;
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updateData)
    .eq('id', id)
    .select();
  
  if (error) {
    return next(new AppError('Error updating todo', 400));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      todo: data[0]
    }
  });
});

/**
 * Delete a todo
 */
exports.deleteTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Check if todo exists and belongs to user
  const { data: existingTodo, error: findError } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();
  
  if (findError) {
    return next(new AppError('Todo not found or not authorized', 404));
  }
  
  // Delete todo
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);
  
  if (error) {
    return next(new AppError('Error deleting todo', 400));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
}); 