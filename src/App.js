import React, { useState, useEffect } from 'react';
import ServerTodoList from './components/ServerTodoList';
import ServerAuth from './components/ServerAuth';
import { authAPI } from './services/apiService';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button,
  CircularProgress
} from '@mui/material';
import { 
  Logout as LogoutIcon
} from '@mui/icons-material';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      // Check Node.js server auth
      try {
        // Only check if we have a token
        const token = localStorage.getItem('token');
        console.log('Checking authentication with token:', token ? 'Token exists' : 'No token found');
        
        if (token) {
          const response = await authAPI.getCurrentUser();
          console.log('Node.js auth response:', response.data);
          
          // Check for user in the correct location in the response structure
          if (response.data && response.data.data && response.data.data.user) {
            console.log('User authenticated successfully:', response.data.data.user);
            setUser(response.data.data.user);
          } else {
            console.error('User not found in response:', response.data);
            setUser(null);
            localStorage.removeItem('token');
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
        // Clear token if there's an auth error
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleLogin = (user) => {
    setUser(user);
  };
  
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still remove token even if logout API fails
      localStorage.removeItem('token');
    }
    setUser(null);
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="600" 
          color="text.primary"
        >
          Todo App
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              disabled={loading}
            >
              Logout
            </Button>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {user ? (
            <ServerTodoList />
          ) : (
            <ServerAuth onLogin={handleLogin} />
          )}
        </Paper>
      )}
    </Container>
  );
}

export default App;
