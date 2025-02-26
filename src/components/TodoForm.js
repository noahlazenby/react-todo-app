import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Stack,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon, 
  Update as UpdateIcon, 
  Close as CloseIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  AddCircleOutline as AddCategoryIcon
} from '@mui/icons-material';

// Default category icons mapping
const CATEGORY_ICONS = {
  work: <WorkIcon fontSize="small" />,
  personal: <PersonIcon fontSize="small" />,
  shopping: <ShoppingIcon fontSize="small" />,
  education: <SchoolIcon fontSize="small" />,
  home: <HomeIcon fontSize="small" />
};

// Default category colors
const CATEGORY_COLORS = {
  work: 'primary',
  personal: 'secondary',
  shopping: 'success',
  education: 'info',
  home: 'warning'
};

function TodoForm({ onAddTodo, currentTodo, onUpdateTodo, disabled, categories = ['personal', 'work'] }) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('personal'); // Default category
  const [isEditing, setIsEditing] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

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
      onUpdateTodo?.(currentTodo.id, text, category);
    } else {
      onAddTodo(text, category);
      setText(''); // Clear the input after adding
      // Keep the same category selected for convenience
    }
  };

  const handleCategoryChange = (categoryId) => {
    setCategory(categoryId);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewCategory('');
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.toLowerCase())) {
      onAddTodo(`Created new category: ${newCategory}`, newCategory.toLowerCase());
      setCategory(newCategory.toLowerCase());
    }
    handleCloseDialog();
  };

  // Get icon for a category, or default to PersonIcon if not found
  const getCategoryIcon = (categoryId) => {
    return CATEGORY_ICONS[categoryId] || <PersonIcon fontSize="small" />;
  };

  // Get color for a category, or default to default if not found
  const getCategoryColor = (categoryId) => {
    return CATEGORY_COLORS[categoryId] || 'default';
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
              disabled={disabled || !text.trim()}
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
                  if (currentTodo && onUpdateTodo) {
                    onUpdateTodo(currentTodo.id, currentTodo.text, currentTodo.category); // Cancel the edit
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
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Category:</span>
            <IconButton 
              size="small" 
              color="primary" 
              onClick={handleOpenDialog}
              sx={{ ml: 1 }}
            >
              <AddCategoryIcon fontSize="small" />
            </IconButton>
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
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                color={getCategoryColor(cat)}
                icon={getCategoryIcon(cat)}
                variant={category === cat ? "filled" : "outlined"}
                onClick={() => handleCategoryChange(cat)}
                sx={{ 
                  fontWeight: category === cat ? 500 : 400,
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

      {/* Dialog for adding new category */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <MuiTextField
            autoFocus
            margin="dense"
            id="category"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleAddCategory} 
            color="primary"
            disabled={!newCategory.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TodoForm; 