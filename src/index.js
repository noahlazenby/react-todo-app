import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a dark gradient Apple-inspired theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0A84FF', // Brighter blue that stands out in dark mode
      light: '#5AC8FA',
      dark: '#0055AA',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF375F', // Vibrant pink/red
      light: '#FF6B8E',
      dark: '#CF2A4B',
      contrastText: '#ffffff',
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1E1E1E',   // Slightly lighter dark for cards
      gradient: 'linear-gradient(145deg, #1E1E1E 0%, #2D2D2D 100%)',
    },
    error: {
      main: '#FF453A', // Bright red for errors
    },
    warning: {
      main: '#FF9F0A', // Bright orange
    },
    info: {
      main: '#64D2FF', // Bright blue
    },
    success: {
      main: '#30D158', // Bright green
    },
    text: {
      primary: '#F5F5F7',
      secondary: '#AEAEB2',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    action: {
      active: '#F5F5F7',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // Apple doesn't use ALL CAPS for buttons
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // Slightly increased for better look in dark mode
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(145deg, #0A84FF 0%, #0055AA 100%)',
          '&:hover': {
            background: 'linear-gradient(145deg, #47A6FF 0%, #0A84FF 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(145deg, #FF375F 0%, #CF2A4B 100%)',
          '&:hover': {
            background: 'linear-gradient(145deg, #FF6B8E 0%, #FF375F 100%)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(145deg, #1E1E1E 0%, #2D2D2D 100%)',
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(145deg, #1E1E1E 0%, #2D2D2D 100%)',
        },
        elevation1: {
          boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.4)',
        },
        elevation2: {
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          caretColor: '#0A84FF', // Cursor color
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            background: 'rgba(10, 132, 255, 0.2)',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#AEAEB2',
          '&.Mui-checked': {
            color: '#30D158',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#F5F5F7',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
