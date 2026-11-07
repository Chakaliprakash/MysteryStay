import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mystery_access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Clear token if expired and unauthorized
      localStorage.removeItem('mystery_access_token');
      localStorage.removeItem('mystery_user');
    }
    return Promise.reject(error);
  }
);

export const checkSystemHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logoutUser = async (refreshToken) => {
  const response = await api.post('/auth/logout', { refreshToken });
  localStorage.removeItem('mystery_access_token');
  localStorage.removeItem('mystery_user');
  return response.data;
};

export default api;
