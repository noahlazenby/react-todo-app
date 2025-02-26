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
  Chip,
  Tooltip
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Label as LabelIcon
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

function TodoItem({ todo, onDelete, onToggle, onEdit }) {
  // Get category icon, default to LabelIcon if not found
  const getCategoryIcon = (categoryId) => {
    return CATEGORY_ICONS[categoryId] || <LabelIcon fontSize="small" />;
  };

  // Get category color, default to default if not found
  const getCategoryColor = (categoryId) => {
    return CATEGORY_COLORS[categoryId] || 'default';
  };

  // Format the category label
  const formatCategoryLabel = (category) => {
    if (!category) return 'Uncategorized';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

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
            onChange={() => onToggle(todo.id, !todo.completed)}
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
            
            {todo.category && (
              <Tooltip title={`Category: ${formatCategoryLabel(todo.category)}`}>
                <Chip
                  size="small"
                  label={formatCategoryLabel(todo.category)}
                  color={getCategoryColor(todo.category)}
                  icon={getCategoryIcon(todo.category)}
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
              </Tooltip>
            )}
            
            {todo.created_at && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.7rem',
                  opacity: todo.completed ? 0.6 : 0.8
                }}
              >
                {new Date(todo.created_at).toLocaleString()}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', ml: 2, gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit?.(todo)}
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
            onClick={() => onDelete(todo.id)}
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