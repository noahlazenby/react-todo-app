import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Stack,
  Chip,
  Typography
} from '@mui/material';
import { 
  Add as AddIcon, 
  Update as UpdateIcon, 
  Close as CloseIcon,
  Work as WorkIcon,
  Person as PersonIcon
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

function TodoForm({ addTodo, currentTodo, updateTodo, disabled }) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('personal'); // Default category
  const [isEditing, setIsEditing] = useState(false);

  // When currentTodo changes, update the form
  useEffect(() => {
    if (currentTodo) {
      setText(currentTodo.text);
      setCategory(currentTodo.category || 'personal');
      setIsEditing(true);
    } else {
      setText('');
      setCategory('personal');
      setIsEditing(false);
    }
  }, [currentTodo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Don't submit empty todos
    if (!text.trim()) return;
    
    if (isEditing && currentTodo) {
      updateTodo(currentTodo.id, text, category);
    } else {
      addTodo(text, category);
      setText(''); // Clear the input after adding
      // Keep the same category selected for convenience
    }
  };

  const handleCategoryChange = (categoryId) => {
    setCategory(categoryId);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a new task..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
            InputProps={{
              sx: { py: 0.5 }
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={disabled}
              startIcon={isEditing ? <UpdateIcon /> : <AddIcon />}
              sx={{
                height: '100%',
                borderRadius: 2,
                px: 3,
              }}
            >
              {isEditing ? 'Update' : 'Add'}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                disabled={disabled}
                startIcon={<CloseIcon />}
                onClick={() => {
                  setText('');
                  setIsEditing(false);
                  if (currentTodo) {
                    updateTodo(currentTodo.id, currentTodo.text, currentTodo.category); // Cancel the edit
                  }
                }}
                sx={{
                  height: '100%',
                  borderRadius: 2,
                }}
              >
                Cancel
              </Button>
            )}
          </Stack>
        </Stack>
        
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Category:
          </Typography>
          <Stack direction="row" spacing={1}>
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.label}
                color={cat.color}
                icon={cat.icon}
                variant={category === cat.id ? "filled" : "outlined"}
                onClick={() => handleCategoryChange(cat.id)}
                sx={{ 
                  fontWeight: category === cat.id ? 500 : 400,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 1
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export default TodoForm; 