import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Avatar, 
  Divider 
} from '@mui/material';
import { 
  Logout as LogoutIcon 
} from '@mui/icons-material';

function UserProfile({ user, onLogout }) {
  // Get first letter of username or email for avatar
  const getUserInitial = () => {
    const identifier = user.username || user.email || 'User';
    return identifier.charAt(0).toUpperCase();
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              width: 36,
              height: 36,
              fontSize: '1rem',
              fontWeight: 'bold',
              mr: 1.5
            }}
          >
            {getUserInitial()}
          </Avatar>
          <Typography variant="body1" color="text.primary" fontWeight={500}>
            {user.username || user.email}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={onLogout}
          startIcon={<LogoutIcon fontSize="small" />}
          sx={{ 
            borderRadius: 1.5,
            py: 0.5,
            fontSize: '0.8125rem',
          }}
        >
          Logout
        </Button>
      </Box>
      <Divider />
    </Box>
  );
}

export default UserProfile; 