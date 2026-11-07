import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const checkSystemHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
