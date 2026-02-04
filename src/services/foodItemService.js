import api from './api';

export const foodItemService = {
  // Create food item
  create: async (data) => {
    try {
      //console.log('📤 Creating food item:', data);
      const response = await api.post('/food-items', data);
      //console.log('📥 Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all food items
  getAll: async (params = {}) => {
    try {
      //console.log('🔍 Fetching food items with params:', params);
      const response = await api.get('/food-items', { params });
      //console.log('📥 Fetch response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Fetch error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get food item by ID
  getById: async (id) => {
    const response = await api.get(`/food-items/${id}`);
    return response.data;
  },

  // Update food item
  update: async (id, data) => {
    const response = await api.put(`/food-items/${id}`, data);
    return response.data;
  },

  // Delete (soft) food item
  delete: async (id) => {
    const response = await api.delete(`/food-items/${id}`);
    return response.data;
  }
};