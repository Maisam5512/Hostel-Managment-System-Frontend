// services/roleService.js
import api from './api';

export const roleService = {
  getRoleById: (id) => api.get(`/roles/${id}`),
  // Optional: if your backend supports fetching role by code
  getRoleByCode: (code) => api.get(`/roles/code/${code}`),
};