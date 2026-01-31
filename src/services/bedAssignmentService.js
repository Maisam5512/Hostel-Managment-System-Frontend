// services/bedAssignmentService.js
import api from './api';

export const bedAssignmentService = {
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