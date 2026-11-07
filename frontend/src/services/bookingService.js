import api from './api';

export const bookingService = {
  async createBooking(bookingPayload) {
    const response = await api.post('/bookings', bookingPayload);
    return response.data;
  },

  async getMyBookings() {
    try {
      const response = await api.get('/bookings/my');
      return response.data?.data || [];
    } catch {
      return [];
    }
  },

  async getBookingByRef(reference) {
    const response = await api.get(`/bookings/${reference}`);
    return response.data;
  },

  async confirmBooking(bookingId) {
    const response = await api.post(`/bookings/${bookingId}/confirm`);
    return response.data;
  },

  async cancelBooking(bookingId) {
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  }
};
