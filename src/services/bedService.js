import api from './api';

export const bedService = {
  getAllBeds: async () => {
    try {
      const response = await api.get('/beds');
      return response;
    } catch (error) {
      console.error('Error fetching beds:', error);
      throw error;
    }
  },

  getBedById: async (id) => {
    try {
      const response = await api.get(`/beds/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching bed:', error);
      throw error;
    }
  },

  getBedsByRoom: async (roomId) => {
    try {
      const response = await api.get(`/beds/room/${roomId}`);
      return response;
    } catch (error) {
      console.error('Error fetching beds by room:', error);
      throw error;
    }
  },

  createBed: async (bedData) => {
    try {
      const response = await api.post('/beds', bedData);
      return response;
    } catch (error) {
      console.error('Error creating bed:', error);
      throw error;
    }
  },

  updateBed: async (id, bedData) => {
    try {
      const response = await api.put(`/beds/${id}`, bedData);
      return response;
    } catch (error) {
      console.error('Error updating bed:', error);
      throw error;
    }
  },

  updateBedStatus: async (id, status) => {
    try {
      const response = await api.patch(`/beds/${id}/status`, { status:status });
      return response;
    } catch (error) {
      console.error('Error updating bed status:', error);
      throw error;
    }
  },

  deleteBed: async (id) => {
    try {
      const response = await api.delete(`/beds/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting bed:', error);
      throw error;
    }
  },
};