import React, { useState, useEffect, useCallback } from 'react';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import UserProfile from './UserProfile';
import supabase from '../supabaseClient';
import * as todoService from '../services/todoService';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  CircularProgress,
  Chip,
  Stack,
  Divider,
  Paper
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

// Define categories with their properties
const CATEGORIES = [
  { 
    id: 'work', 
    label: 'Work', 
    color: 'primary', 
    icon: <WorkIcon fontSize="small" /> 
  },
  { 
    id: 'personal', 
    label: 'Personal', 
    color: 'secondary', 
    icon: <PersonIcon fontSize="small" /> 
  }
];

function SupabaseTodoList({ user, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to force re-renders
  const [activeFilters, setActiveFilters] = useState([]); // Store active category filters

  // Apply filters to todos
  useEffect(() => {
    if (activeFilters.length === 0) {
      // No filters, show all todos
      setFilteredTodos(todos);
    } else {
      // Filter todos by selected categories
      setFilteredTodos(todos.filter(todo => 
        activeFilters.includes(todo.category || 'personal')
      ));
    }
  }, [todos, activeFilters]);

  // Function to refresh todos
  const refreshTodos = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Manually refreshing todos...');
      
      const data = await todoService.getTodos();
      console.log('Refreshed todos:', data);
      
      setTodos(data);
      setRefreshKey(prev => prev + 1); // Increment refresh key to force re-render
    } catch (error) {
      console.error('Error refreshing todos:', error);
      setError('Failed to refresh tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load todos from Supabase when component mounts or refresh key changes
  useEffect(() => {
    let isMounted = true;
    
    async function fetchTodos() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await todoService.getTodos();
        
        if (isMounted) {
          console.log('Setting todos in state:', data);
          setTodos(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching todos:', error);
        if (isMounted) {
          setError('Failed to load tasks. Please try again later.');
          setLoading(false);
        }
      }
    }

    if (user) {
      fetchTodos();
      
      // Set up real-time subscription for todos
      const channel = supabase
        .channel('public:todos')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'todos',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('Real-time update received:', payload);
            
            // Force a refresh instead of trying to update state directly
            refreshTodos();
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, refreshKey, refreshTodos]); // Add refreshKey to dependencies

  // Add a new todo
  const addTodo = async (text, category) => {
    try {
      setError(null);
      setLoading(true);
      await todoService.addTodo(text, category);
      
      // Explicitly refresh todos after adding
      await refreshTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Failed to add task. Please try again.');
      setLoading(false);
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      setError(null);
      setLoading(true);
      await todoService.deleteTodo(id);
      
      // If we're editing the todo that was deleted, clear the current todo
      if (currentTodo && currentTodo.id === id) {
        setCurrentTodo(null);
      }
      
      // Explicitly refresh todos after deleting
      await refreshTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete task. Please try again.');
      setLoading(false);
    }
  };

  // Toggle the completed status of a todo
  const toggleComplete = async (id) => {
    try {
      setError(null);
      const todo = todos.find(t => t.id === id);
      if (todo) {
        setLoading(true);
        await todoService.toggleTodoComplete(id, todo.completed);
        
        // Explicitly refresh todos after toggling
        await refreshTodos();
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
      setError('Failed to update task. Please try again.');
      setLoading(false);
    }
  };

  // Start editing a todo
  const editTodo = (todo) => {
    setCurrentTodo(todo);
  };

  // Update a todo
  const updateTodo = async (id, text, category) => {
    try {
      setError(null);
      setLoading(true);
      await todoService.updateTodoText(id, text, category);
      setCurrentTodo(null);
      
      // Explicitly refresh todos after updating
      await refreshTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update task. Please try again.');
      setLoading(false);
    }
  };

  // Toggle a category filter
  const toggleCategoryFilter = (categoryId) => {
    setActiveFilters(prev => {
      if (prev.includes(categoryId)) {
        // Remove the filter
        return prev.filter(id => id !== categoryId);
      } else {
        // Add the filter
        return [...prev, categoryId];
      }
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h5" 
        component="h2" 
        sx={{ 
          mb: 3, 
          textAlign: 'center', 
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        My To-Do List
      </Typography>
      
      {user && <UserProfile user={{ username: user.email }} onLogout={onLogout} />}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}
      
      <TodoForm 
        addTodo={addTodo} 
        currentTodo={currentTodo} 
        updateTodo={updateTodo}
        disabled={loading}
      />
      
      <Box sx={{ mt: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 1, 
              display: 'flex', 
              alignItems: 'center', 
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <FilterIcon 
              color="action" 
              fontSize="small" 
              sx={{ mr: 1, opacity: 0.7 }} 
            />
            <Stack direction="row" spacing={1} alignItems="center">
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.label}
                  color={cat.color}
                  icon={cat.icon}
                  variant={activeFilters.includes(cat.id) ? "filled" : "outlined"}
                  onClick={() => toggleCategoryFilter(cat.id)}
                  size="small"
                  sx={{ 
                    transition: 'all 0.2s',
                    fontWeight: activeFilters.includes(cat.id) ? 500 : 400
                  }}
                />
              ))}
              {activeFilters.length > 0 && (
                <>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                  <Button
                    size="small"
                    startIcon={<ClearIcon fontSize="small" />}
                    onClick={clearFilters}
                    color="inherit"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Clear
                  </Button>
                </>
              )}
            </Stack>
          </Paper>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={refreshTodos}
            disabled={loading}
            color="primary"
            sx={{
              borderRadius: 6,
              px: 2
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh Tasks'}
          </Button>
        </Box>
        
        {loading && filteredTodos.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            py: 4,
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress size={32} color="primary" />
            <Typography variant="body2" color="primary" sx={{ fontStyle: 'italic' }}>
              Loading your tasks...
            </Typography>
          </Box>
        ) : filteredTodos.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ fontStyle: 'italic' }}
            >
              {activeFilters.length > 0 
                ? 'No tasks found with the selected filters.' 
                : 'No tasks yet! Add one above.'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                deleteTodo={deleteTodo}
                toggleComplete={toggleComplete}
                editTodo={editTodo}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default SupabaseTodoList; 