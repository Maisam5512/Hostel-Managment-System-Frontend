import { useState, useCallback } from 'react';
import api from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // FIX: Default value ko null ki jagah undefined rakhein
  const callApi = useCallback(async (method, endpoint, requestData = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      const lowerMethod = method.toLowerCase();

      // Switch case mein check karein ke body kis mein bhejni hai
      switch (lowerMethod) {
        case 'get':
          response = await api.get(endpoint);
          break;
        case 'post':
          response = await api.post(endpoint, requestData);
          break;
        case 'put':
          response = await api.put(endpoint, requestData);
          break;
        case 'patch':
          // Agar requestData undefined hoga, to Axios body nahi bhejay ga
          response = await api.patch(endpoint, requestData);
          break;
        case 'delete':
          // Delete mein agar data bhejni ho to { data: requestData } use hota hai
          response = await api.delete(endpoint, { data: requestData });
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      setData(response);
      return response;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    data,
    callApi,
    reset: () => {
      setError(null);
      setData(null);
    },
  };
};