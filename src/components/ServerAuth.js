import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/apiService';
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
  Email as EmailIcon,
  MarkEmailRead as VerifyEmailIcon
} from '@mui/icons-material';

function ServerAuth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Clear any stale tokens when component mounts
  useEffect(() => {
    // Clear localStorage token when switching to Node.js backend
    localStorage.removeItem('token');
    
    // Clear any error message
    setError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setVerificationRequired(false);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Please fill in all fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (isLogin) {
        // Handle login with our API service
        const response = await authAPI.login(email, password);
        
        // Check if email verification is required
        if (response.data?.data?.emailVerificationRequired) {
          setVerificationRequired(true);
          setVerificationEmail(response.data.data.email || email);
          setLoading(false);
          return;
        }
        
        // Check for user in the correct location in the response structure
        if (response && response.data && response.data.data && response.data.data.user) {
          onLogin(response.data.data.user);
        } else {
          console.error('Login response structure:', response.data);
          throw new Error('Login failed. Please check your credentials.');
        }
      } else {
        // Handle signup with our API service
        const response = await authAPI.signup(email, password);
        
        // Check if email verification is required
        if (response.data?.data?.emailVerificationRequired) {
          setVerificationRequired(true);
          setVerificationEmail(response.data.data.user.email || email);
          setLoading(false);
          return;
        }
        
        // Check for user in the correct location in the response structure
        if (response && response.data && response.data.data && response.data.data.user) {
          onLogin(response.data.data.user);
        } else {
          console.error('Signup response structure:', response.data);
          throw new Error('Signup failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // Handle specific error messages
      if (error.response?.data?.message) {
        setError(error.response.data.message);
        
        // Check if the error is related to email verification
        if (error.response.data?.data?.emailVerificationRequired) {
          setVerificationRequired(true);
          setVerificationEmail(error.response.data.data.email || email);
        }
      } else if (error.message.includes('token')) {
        setError('Authentication error. Please try again.');
        // Clear any stale tokens
        localStorage.removeItem('token');
      } else {
        setError(error.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Call resend verification endpoint (you'll need to implement this)
      await authAPI.resendVerification(verificationEmail);
      setError('');
      // Show success message
      alert(`Verification email has been resent to ${verificationEmail}`);
    } catch (error) {
      console.error('Error resending verification:', error);
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If verification is required, show verification screen
  if (verificationRequired) {
    return (
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <VerifyEmailIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
            Verify Your Email
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body1">
            We've sent a verification email to <strong>{verificationEmail}</strong>.
            Please check your inbox and click the verification link to activate your account.
          </Typography>
        </Alert>
        
        <Stack spacing={2}>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={handleResendVerification}
            disabled={loading}
            sx={{ borderRadius: 2, py: 1.2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Resend Verification Email'}
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={() => {
              setVerificationRequired(false);
              setIsLogin(true);
            }}
            sx={{ borderRadius: 2 }}
          >
            Back to Sign In
          </Button>
        </Stack>
      </Paper>
    );
  }

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

export default ServerAuth; 