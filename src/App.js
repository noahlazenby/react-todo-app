import React, { useState, useEffect } from 'react';
import SupabaseTodoList from './components/SupabaseTodoList';
import SupabaseAuth from './components/SupabaseAuth';
import supabase from './supabaseClient';
import { Container, Typography, Box, Paper } from '@mui/material';

function App() {
  const [user, setUser] = useState(null);
  
  // Check if user is already logged in with Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  const handleLogin = (user) => {
    setUser(user);
  };
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    setUser(null);
  };
  
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="600" color="text.primary">
          Todo App
        </Typography>
      </Box>

      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {user ? (
          <SupabaseTodoList user={user} onLogout={handleLogout} />
        ) : (
          <SupabaseAuth onLogin={handleLogin} />
        )}
      </Paper>
    </Container>
  );
}

export default App;
