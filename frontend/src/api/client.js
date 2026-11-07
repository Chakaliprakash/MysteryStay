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
      localStorage.removeItem('mystery_access_token');
      localStorage.removeItem('mystery_user');
    }
    return Promise.reject(error);
  }
);

// System Health
export const checkSystemHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Auth
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

// Amenities
export const fetchAmenities = async () => {
  const response = await api.get('/amenities');
  return response.data;
};

// Hotels
export const createHotel = async (hotelData) => {
  const response = await api.post('/hotels', hotelData);
  return response.data;
};

export const fetchMyHotels = async () => {
  const response = await api.get('/hotels/my');
  return response.data;
};

export const fetchAdminHotels = async () => {
  const response = await api.get('/admin/hotels');
  return response.data;
};

export const verifyHotelAdmin = async (hotelId, verify = true) => {
  const response = await api.patch(`/admin/hotels/${hotelId}/verify?verify=${verify}`);
  return response.data;
};

export default api;
