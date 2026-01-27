import { useState, useCallback } from 'react';
import api from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const callApi = useCallback(async (method, endpoint, requestData = null) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      switch (method.toLowerCase()) {
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
          response = await api.patch(endpoint, requestData);
          break;
        case 'delete':
          response = await api.delete(endpoint);
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