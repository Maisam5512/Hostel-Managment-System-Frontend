import api from './api';

export const feeService = {
  // Get all fee records
  getAllFees: async () => {
    try {
      const response = await api.get('/fees');
      return response;
    } catch (error) {
      console.error('Error fetching fees:', error);
      throw error;
    }
  },

  // Get fee by ID
  getFeeById: async (id) => {
    try {
      const response = await api.get(`/fees/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching fee:', error);
      throw error;
    }
  },

  // Get fees by member
  getFeesByMember: async (memberId) => {
    try {
      const response = await api.get(`/fees/member/${memberId}`);
      return response;
    } catch (error) {
      console.error('Error fetching member fees:', error);
      throw error;
    }
  },

  // Create new fee record
  createFee: async (feeData) => {
    try {
      const response = await api.post('/fees', feeData);
      return response;
    } catch (error) {
      console.error('Error creating fee:', error);
      throw error;
    }
  },

  // Record payment
  recordPayment: async (feeId, paymentData) => {
    try {
      const response = await api.post(`/fees/${feeId}/payments`, paymentData);
      return response;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  },

  // Generate invoice
  generateInvoice: async (feeId) => {
    try {
      const response = await api.get(`/fees/${feeId}/invoice`);
      return response;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  },

  // Send payment reminder
  sendReminder: async (memberId) => {
    try {
      const response = await api.post(`/fees/reminders/${memberId}`);
      return response;
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  },

  // Get fee summary
  getFeeSummary: async () => {
    try {
      const response = await api.get('/fees/summary');
      return response;
    } catch (error) {
      console.error('Error fetching fee summary:', error);
      throw error;
    }
  },

  // Update fee status
  updateFeeStatus: async (feeId, status) => {
    try {
      const response = await api.patch(`/fees/${feeId}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating fee status:', error);
      throw error;
    }
  },

  // Delete fee record
  deleteFee: async (feeId) => {
    try {
      const response = await api.delete(`/fees/${feeId}`);
      return response;
    } catch (error) {
      console.error('Error deleting fee:', error);
      throw error;
    }
  },
};