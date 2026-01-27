import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Signup failed');
    }
  },

  getProfile: async (token) => {
    try {
      const response = await api.get('/users/profile');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch profile');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};