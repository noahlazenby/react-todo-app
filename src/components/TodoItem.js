import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Checkbox, 
  Box, 
  Button, 
  IconButton,
  alpha,
  Chip
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Work as WorkIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Define categories with their properties - same as in TodoForm
const CATEGORIES = {
  work: { 
    label: 'Work', 
    color: 'primary', 
    icon: <WorkIcon fontSize="small" /> 
  },
  personal: { 
    label: 'Personal', 
    color: 'secondary', 
    icon: <PersonIcon fontSize="small" /> 
  }
};

function TodoItem({ todo, deleteTodo, toggleComplete, editTodo }) {
  // Get category details, default to personal if not specified
  const category = CATEGORIES[todo.category || 'personal'];

  return (
    <Card 
      variant="outlined"
      sx={{ 
        borderRadius: 2,
        transition: 'all 0.3s',
        borderColor: todo.completed ? 'success.light' : 'divider',
        bgcolor: theme => todo.completed ? alpha(theme.palette.success.light, 0.1) : 'background.paper',
        '&:hover': {
          boxShadow: 1,
          borderColor: todo.completed ? 'success.main' : 'primary.light',
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <Checkbox
            checked={todo.completed}
            onChange={() => toggleComplete(todo.id)}
            color="primary"
            sx={{ 
              p: 1, 
              color: todo.completed ? 'success.main' : 'primary.main',
              '&.Mui-checked': {
                color: 'success.main',
              },
            }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                ...(todo.completed && {
                  textDecoration: 'line-through',
                  color: 'text.disabled',
                }),
              }}
            >
              {todo.text}
            </Typography>
            <Chip
              size="small"
              label={category.label}
              color={category.color}
              icon={category.icon}
              variant="outlined"
              sx={{ 
                alignSelf: 'flex-start',
                height: '24px',
                '& .MuiChip-label': {
                  px: 1,
                  fontSize: '0.75rem',
                },
                '& .MuiChip-icon': {
                  fontSize: '0.875rem',
                  ml: 0.5,
                },
                opacity: todo.completed ? 0.6 : 1
              }}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', ml: 2, gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => editTodo(todo)}
            disabled={todo.completed}
            color="primary"
            sx={{
              minWidth: 0,
              px: 1.5,
              py: 0.5,
              ...(todo.completed && {
                opacity: 0.5,
              }),
            }}
          >
            Edit
          </Button>
          <IconButton
            size="small"
            color="error"
            onClick={() => deleteTodo(todo.id)}
            aria-label="delete"
            sx={{ p: 0.5 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TodoItem; 