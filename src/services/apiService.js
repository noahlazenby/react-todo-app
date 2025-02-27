import axios from 'axios';

// API base URL - use environment variable or default to localhost in development
// In production, the API will be at /.netlify/functions/api
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api'
  : process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Allow cookies to be sent and received
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      // Clear token
      localStorage.removeItem('token');
      console.error('Authentication error:', error.response.data.message || 'Session expired');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Register a new user
  signup: async (email, password) => {
    try {
      const response = await api.post('/auth/signup', { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response;
    } catch (error) {
      console.error('Signup error:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Login a user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Resend verification email
  resendVerification: async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response;
    } catch (error) {
      console.error('Resend verification error:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Logout a user
  logout: async () => {
    try {
      await api.get('/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error.response?.data?.message || error.message);
      // Still remove token even if API call fails
      localStorage.removeItem('token');
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      console.error('Get current user error:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// Todo API
export const todoAPI = {
  // Get all todos
  getAllTodos: async (category = null) => {
    try {
      const url = category ? `/todos?category=${category}` : '/todos';
      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error('Get todos error:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Get a single todo
  getTodo: async (id) => {
    try {
      const response = await api.get(`/todos/${id}`);
      return response;
    } catch (error) {
      console.error('Get todo error:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Create a new todo
  createTodo: async (text, category = 'personal') => {
    try {
      const response = await api.post('/todos', { text, category });
      return response;
    } catch (error) {
      console.error('Create todo error:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Update a todo
  updateTodo: async (id, text, category) => {
    try {
      const response = await api.patch(`/todos/${id}`, { text, category });
      return response;
    } catch (error) {
      console.error('Update todo error:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Toggle todo completion status
  toggleTodo: async (id, completed) => {
    try {
      const response = await api.patch(`/todos/${id}`, { completed });
      return response;
    } catch (error) {
      console.error('Toggle todo error:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Delete a todo
  deleteTodo: async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      return true;
    } catch (error) {
      console.error('Delete todo error:', error.response?.data?.message || error.message);
      throw error;
    }
  },
};

// Create a named API object for export
const apiService = {
  auth: authAPI,
  todos: todoAPI,
};

// Export the API service
export default apiService; 