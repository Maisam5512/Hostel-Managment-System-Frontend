import api from './api';

export const memberService = {
  getAllMembers: async () => {
    try {
      const response = await api.get('/members');
      return response;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  getMemberById: async (id) => {
    try {
      const response = await api.get(`/members/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching member:', error);
      throw error;
    }
  },

  createMember: async (memberData) => {
    try {
      const response = await api.post('/members', memberData);
      return response;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  updateMember: async (id, memberData) => {
    try {
      const response = await api.put(`/members/${id}`, memberData);
      return response;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  },

  updateMemberStatus: async (id, status) => {
    try {
      const response = await api.patch(`/members/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating member status:', error);
      throw error;
    }
  },

  deleteMember: async (id) => {
    try {
      const response = await api.delete(`/members/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  },

  getAvailableBeds: async () => {
    try {
      const response = await api.get('/beds?status=AVAILABLE');
      return response;
    } catch (error) {
      console.error('Error fetching available beds:', error);
      throw error;
    }
  },

  assignBedToMember: async (memberId, bedId) => {
    try {
      const response = await api.patch(`/members/${memberId}/assign-bed`, { bedId });
      return response;
    } catch (error) {
      console.error('Error assigning bed:', error);
      throw error;
    }
  },

  unassignBedFromMember: async (memberId) => {
    try {
      const response = await api.patch(`/members/${memberId}/unassign-bed`);
      return response;
    } catch (error) {
      console.error('Error unassigning bed:', error);
      throw error;
    }
  },
};