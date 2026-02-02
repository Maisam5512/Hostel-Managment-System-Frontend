import api from './api';

export const bedAssignmentService = {
  getAllBedAssignments: async () => {
    try {
      const response = await api.get('/bed-assignments');
      return response;
    } catch (error) {
      console.error('Error fetching bed assignments:', error);
      throw error;
    }
  },

  getBedAssignmentById: async (id) => {
    try {
      const response = await api.get(`/bed-assignments/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching bed assignment:', error);
      throw error;
    }
  },

  createBedAssignment: async (data) => {
    try {
      const response = await api.post('/bed-assignments', data);
      return response;
    } catch (error) {
      console.error('Error creating bed assignment:', error);
      throw error;
    }
  },

  closeBedAssignment: async (id) => {
    try {
      const response = await api.put(`/bed-assignments/${id}/close`);
      return response;
    } catch (error) {
      console.error('Error closing bed assignment:', error);
      throw error;
    }
  },

  updateBedAssignment: async (id, data) => {
    try {
      const response = await api.put(`/bed-assignments/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating bed assignment:', error);
      throw error;
    }
  },

  deleteBedAssignment: async (id) => {
    try {
      const response = await api.delete(`/bed-assignments/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting bed assignment:', error);
      throw error;
    }
  },

  getBedAssignmentsByMember: async (memberId) => {
    try {
      const response = await api.get(`/bed-assignments/member/${memberId}`);
      return response;
    } catch (error) {
      console.error('Error fetching bed assignments by member:', error);
      throw error;
    }
  }
};