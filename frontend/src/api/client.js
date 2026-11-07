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

// Room Types & Inventory (Phase 4)
export const fetchRoomTypesByHotel = async (hotelId) => {
  const response = await api.get(`/hotels/${hotelId}/room-types`);
  return response.data;
};

export const createRoomType = async (hotelId, roomTypeData) => {
  const response = await api.post(`/hotels/${hotelId}/room-types`, roomTypeData);
  return response.data;
};

export const seedRoomInventory = async (hotelId, roomTypeId, seedData) => {
  const response = await api.post(`/hotels/${hotelId}/room-types/${roomTypeId}/inventory`, seedData);
  return response.data;
};

export const checkRoomAvailability = async (roomTypeId, checkInDate, checkOutDate, roomCount = 1) => {
  const response = await api.get(`/room-types/${roomTypeId}/availability`, {
    params: { checkInDate, checkOutDate, roomCount }
  });
  return response.data;
};

// Mystery Deals (Phase 5)
export const fetchPublicDeals = async () => {
  const response = await api.get('/deals');
  return response.data;
};

export const fetchDealById = async (dealId) => {
  const response = await api.get(`/deals/${dealId}`);
  return response.data;
};

export const createMysteryDeal = async (dealData) => {
  const response = await api.post('/deals', dealData);
  return response.data;
};

export const fetchMyDeals = async () => {
  const response = await api.get('/deals/my');
  return response.data;
};

// Search & DSA Recommendations (Phase 6)
export const searchMysteryDeals = async (searchParams) => {
  const response = await api.get('/search/deals', { params: searchParams });
  return response.data;
};

export const fetchBestStayWindow = async (dealId, stayLength = 3) => {
  const response = await api.get(`/search/deals/${dealId}/best-window`, {
    params: { stayLength }
  });
  return response.data;
};

// Bookings & Concurrency Engine (Phase 7)
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const fetchMyBookings = async () => {
  const response = await api.get('/bookings/my');
  return response.data;
};

export const fetchBookingByRef = async (reference) => {
  const response = await api.get(`/bookings/${reference}`);
  return response.data;
};

export const confirmBooking = async (bookingId) => {
  const response = await api.post(`/bookings/${bookingId}/confirm`);
  return response.data;
};

export const cancelBooking = async (bookingId) => {
  const response = await api.post(`/bookings/${bookingId}/cancel`);
  return response.data;
};

export default api;
