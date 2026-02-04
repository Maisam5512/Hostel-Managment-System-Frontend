import api from './api';

export const foodOrderService = {
  // Create food order
  create: async (data) => {
    try {
      //console.log('📤 [foodOrderService] Creating order:', data);
      const response = await api.post('/food-orders', data);
      //console.log('📥 [foodOrderService] Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [foodOrderService] Create error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all food orders
  getAll: async (params = {}) => {
    try {
      //console.log('🔍 [foodOrderService] Fetching orders with params:', params);
      const response = await api.get('/food-orders', { params });
      //console.log('📥 [foodOrderService] Get response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [foodOrderService] Get error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get food orders by member
  getByMember: async (memberId) => {
    const response = await api.get(`/food-orders/member/${memberId}`);
    return response.data;
  },

  // Update food order
  update: async (id, data) => {
    const response = await api.put(`/food-orders/${id}`, data);
    return response.data;
  },

  // Update billing status
  updateBillingStatus: async (id, isBilled) => {
    try {
      //console.log(`💰 [foodOrderService] Updating billing status for ${id} to ${isBilled}`);
      const response = await api.put(`/food-orders/${id}/billing`, { isBilled });
      //console.log('📥 [foodOrderService] Billing update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [foodOrderService] Billing update error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete food order
  delete: async (id) => {
    const response = await api.delete(`/food-orders/${id}`);
    return response.data;
  }
};