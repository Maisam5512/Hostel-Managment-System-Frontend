import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error or server not responding');
      throw new Error('Network error. Please check your connection.');
    }
    
    const { status, data } = error.response;
    
    // Handle specific status codes
    if (status === 401) {
      // Unauthorized - clear token and redirect
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    if (status === 403) {
      throw new Error('Access denied. You do not have permission.');
    }
    
    if (status === 404) {
      throw new Error('Resource not found.');
    }
    
    if (status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    // Use server error message or default
    const errorMessage = data?.message || error.message || 'An error occurred';
    throw new Error(errorMessage);
  }
);

export default api;