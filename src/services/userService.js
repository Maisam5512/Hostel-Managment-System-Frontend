import api from './api';

export const userService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  toggleUserStatus: async (id) => {
    try {
      const response = await api.patch(`/users/${id}/status`);
      return response;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },
};