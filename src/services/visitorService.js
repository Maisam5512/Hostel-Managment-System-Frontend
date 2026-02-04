// src/services/visitorService.js
import api from './api';

export const visitorService = {
  // Get all visitors
  getAllVisitors: (params = {}) => {
    return api.get('/visitors', { params });
  },

  // Get visitor by ID
  getVisitorById: (id) => {
    return api.get(`/visitors/${id}`);
  },

  // Check-in visitor
  checkInVisitor: (visitorData) => {
    return api.post('/visitors', visitorData);
  },

  // Check-out visitor
  checkOutVisitor: (id, remarks = '') => {
    return api.put(`/visitors/${id}/checkout`, { remarks });
  },

  // Delete visitor
  deleteVisitor: (id) => {
    return api.delete(`/visitors/${id}`);
  }
};