// services/dashboardService.js
import api from './api';

export const dashboardService = {
  getDashboardStats: () => {
    return api.get('/dashboard/stats');
  },
  
  refreshDashboardStats: () => {
    return api.post('/dashboard/refresh');
  }
};