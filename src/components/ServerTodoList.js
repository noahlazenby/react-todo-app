import React, { useState, useEffect, useCallback } from 'react';
import { todoAPI } from '../services/apiService';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  CircularProgress,
  Divider,
  Chip,
  Stack,
  Paper
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

function ServerTodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(['personal', 'work', 'shopping']);
  const [allCategories, setAllCategories] = useState(['personal', 'work', 'shopping']);
  const [currentTodo, setCurrentTodo] = useState(null);

  // Function to sort todos: incomplete first (newest to oldest), then completed (newest to oldest)
  const sortTodos = (todosToSort) => {
    return [...todosToSort].sort((a, b) => {
      // First sort by completion status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1; // Incomplete items first
      }
      
      // Then sort by creation date (newest first)
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
  };

  // Function to extract unique categories from todos
  const extractCategories = (todos) => {
    if (!todos || todos.length === 0) return [];
    
    return [...new Set(todos
      .map(todo => todo.category)
      .filter(category => category !== null && category !== undefined))];
  };

  // Use useCallback to memoize the fetchTodos function
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // First, fetch all todos to get all categories (for the form)
      const allTodosResponse = await todoAPI.getAllTodos();
      
      if (allTodosResponse && allTodosResponse.data && allTodosResponse.data.data) {
        const allTodos = allTodosResponse.data.data.todos || [];
        // Extract all unique categories for the form
        const uniqueAllCategories = extractCategories(allTodos);
        setAllCategories(uniqueAllCategories);
        
        // If not filtering, use all todos
        if (selectedCategory === 'all') {
          setTodos(sortTodos(allTodos));
          setCategories(uniqueAllCategories);
        } else {
          // Otherwise, fetch filtered todos
          const filteredResponse = await todoAPI.getAllTodos(selectedCategory);
          
          if (filteredResponse && filteredResponse.data && filteredResponse.data.data) {
            const filteredTodos = filteredResponse.data.data.todos || [];
            setTodos(sortTodos(filteredTodos));
            
            // Extract categories from filtered todos for the filter chips
            const filteredCategories = extractCategories(filteredTodos);
            setCategories(filteredCategories);
          } else {
            setTodos([]);
          }
        }
      } else {
        setTodos([]);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to load todos'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]); // Add selectedCategory as a dependency

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]); // Now fetchTodos is a dependency

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTodos();
  };

  const handleAddTodo = async (text, category = 'personal') => {
    try {
      setError('');
      const response = await todoAPI.createTodo(text, category);
      
      if (response && response.data && response.data.data && response.data.data.todo) {
        const newTodo = response.data.data.todo;
        
        // Only add the new todo to the current list if it matches the filter
        if (selectedCategory === 'all' || selectedCategory === newTodo.category) {
          // Add new todo at the beginning of the list (newest first)
          setTodos(prevTodos => sortTodos([newTodo, ...prevTodos]));
        }
        
        // Update allCategories if new one is added
        if (!allCategories.includes(category)) {
          setAllCategories(prev => [...prev, category]);
        }
        
        // Update categories if new one is added and it matches the filter
        if (selectedCategory === 'all' && !categories.includes(category)) {
          setCategories(prev => [...prev, category]);
        }
      } else {
        throw new Error('Failed to add todo: Invalid response format');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to add todo'
      );
    }
  };

  const handleToggleTodo = async (id, completed) => {
    try {
      setError('');
      await todoAPI.toggleTodo(id, completed);
      
      // Update the todo in the list and resort
      setTodos(prevTodos => {
        const updatedTodos = prevTodos.map(todo => 
          todo.id === id ? { ...todo, completed } : todo
        );
        return sortTodos(updatedTodos);
      });
    } catch (error) {
      console.error('Error toggling todo:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to update todo'
      );
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      setError('');
      await todoAPI.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete todo'
      );
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Add the handleEditTodo function
  const handleEditTodo = (todo) => {
    setCurrentTodo(todo);
  };

  // Add the handleUpdateTodo function
  const handleUpdateTodo = async (id, text, category) => {
    try {
      setError('');
      const response = await todoAPI.updateTodo(id, text, category);
      
      if (response && response.data && response.data.data && response.data.data.todo) {
        const updatedTodo = response.data.data.todo;
        
        // Check if the category has changed and if it matches the current filter
        const shouldShowInCurrentView = selectedCategory === 'all' || 
                                       selectedCategory === updatedTodo.category;
        
        // Update the todo in the list
        setTodos(prevTodos => {
          // If the updated todo should be shown in the current view
          if (shouldShowInCurrentView) {
            return sortTodos(prevTodos.map(todo => 
              todo.id === id ? { ...updatedTodo } : todo
            ));
          } else {
            // Remove the todo from the current view if it no longer matches the filter
            return sortTodos(prevTodos.filter(todo => todo.id !== id));
          }
        });
        
        // Update allCategories if a new category is added
        if (category && !allCategories.includes(category)) {
          setAllCategories(prev => [...prev, category]);
        }
        
        // Update categories if in 'all' view and a new category is added
        if (selectedCategory === 'all' && category && !categories.includes(category)) {
          setCategories(prev => [...prev, category]);
        }
        
        setCurrentTodo(null); // Clear the current todo after update
      } else {
        throw new Error('Failed to update todo: Invalid response format');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to update todo'
      );
    }
  };

  // Helper function to safely format category names
  const formatCategoryLabel = (category) => {
    if (!category) return 'Uncategorized';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        maxWidth: 800,
        mx: 'auto'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h5" 
          component="h2" 
          fontWeight={600}
          color="text.primary"
        >
          My Tasks
        </Typography>
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ borderRadius: 2 }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      <TodoForm 
        onAddTodo={handleAddTodo} 
        categories={allCategories} 
        currentTodo={currentTodo}
        onUpdateTodo={handleUpdateTodo}
      />
      
      <Box sx={{ my: 3 }}>
        <Typography 
          variant="subtitle1" 
          component="div" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            color: 'text.secondary',
            fontWeight: 500
          }}
        >
          <CategoryIcon sx={{ mr: 1 }} />
          Filter by category:
        </Typography>
        
        <Stack 
          direction="row" 
          spacing={1} 
          sx={{ 
            flexWrap: 'wrap', 
            gap: 1,
            '& > *': { mb: 1 }
          }}
        >
          <Chip
            label="All"
            clickable
            color={selectedCategory === 'all' ? 'primary' : 'default'}
            onClick={() => handleCategorySelect('all')}
            variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
          />
          
          {allCategories.map(category => (
            <Chip
              key={category || 'uncategorized'}
              label={formatCategoryLabel(category)}
              clickable
              color={selectedCategory === category ? 'primary' : 'default'}
              onClick={() => handleCategorySelect(category)}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : todos.length === 0 ? (
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ textAlign: 'center', my: 4 }}
        >
          {selectedCategory === 'all' 
            ? 'No tasks yet. Add one above!' 
            : `No tasks in the "${selectedCategory}" category.`}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
              onEdit={handleEditTodo}
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
}

export default ServerTodoList; 