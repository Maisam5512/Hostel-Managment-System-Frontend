import api from './api';

export const roomService = {
  getAllRooms: async () => {
    try {
      const response = await api.get('/rooms');
      return response;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  getRoomById: async (id) => {
    try {
      const response = await api.get(`/rooms/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  createRoom: async (roomData) => {
    try {
      const response = await api.post('/rooms', roomData);
      return response;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  updateRoom: async (id, roomData) => {
    try {
      const response = await api.put(`/rooms/${id}`, roomData);
      return response;
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  updateRoomStatus: async (id, status) => {
    try {
      const response = await api.patch(`/rooms/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating room status:', error);
      throw error;
    }
  },

  deleteRoom: async (id) => {
    try {
      const response = await api.delete(`/rooms/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },
};