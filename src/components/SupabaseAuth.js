import React, { useState } from 'react';
import supabase from '../supabaseClient';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Stack, 
  Alert, 
  Link, 
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  Login as LoginIcon, 
  PersonAdd as SignUpIcon,
  Visibility, 
  VisibilityOff,
  Email as EmailIcon
} from '@mui/icons-material';

function SupabaseAuth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Please fill in all fields');
      }

      if (isLogin) {
        // Handle login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        onLogin(data.user);
      } else {
        // Handle signup with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) throw error;
        
        if (data.user && !data.user.identities?.length) {
          throw new Error('Email already registered');
        }
        
        onLogin(data.user);
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 3 }}>
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom 
        textAlign="center" 
        fontWeight={600}
        color="text.primary"
        sx={{ mb: 3 }}
      >
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          <TextField
            fullWidth
            id="email"
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
            InputProps={{
              sx: { borderRadius: 2 },
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            fullWidth
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
            InputProps={{
              sx: { borderRadius: 2 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : 
              isLogin ? <LoginIcon /> : <SignUpIcon />
            }
            sx={{ 
              borderRadius: 2,
              py: 1.2
            }}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </Stack>
      </Box>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link
            component="button"
            variant="body2"
            onClick={() => setIsLogin(!isLogin)}
            underline="hover"
            color="primary"
            disabled={loading}
            sx={{ fontWeight: 500 }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}

export default SupabaseAuth; 