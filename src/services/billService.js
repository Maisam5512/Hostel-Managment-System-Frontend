import api from './api';

export const billService = {
  // Get all bills with optional filters
  getAll: async (params = {}) => {
    try {
      console.log('Fetching bills with params:', params);
      const response = await api.get('/bills', { params });
      console.log('Bills API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching bills:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Error message:', error.message);
      }
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Get single bill by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/bills/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bill by ID:', error);
      throw error.response?.data || error;
    }
  },

  // Create new bill
  create: async (billData) => {
    try {
      console.log('Creating bill with data:', billData);
      const response = await api.post('/bills', billData);
      console.log('Create bill response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating bill:', error);
      if (error.response) {
        console.error('Server error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      throw error.response?.data || error;
    }
  },

  // Update bill (items/remarks)
  update: async (id, updateData) => {
    try {
      const response = await api.put(`/bills/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating bill:', error);
      throw error.response?.data || error;
    }
  },

  // Add payment to bill
  addPayment: async (id, amount) => {
    try {
      const response = await api.post(`/bills/${id}/payment`, { amount });
      return response.data;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error.response?.data || error;
    }
  },

  // Delete bill
  delete: async (id) => {
    try {
      const response = await api.delete(`/bills/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw error.response?.data || error;
    }
  }
};