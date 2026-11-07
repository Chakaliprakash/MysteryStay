import api from './api';

export const paymentService = {
  async createPaymentOrder(bookingId) {
    const response = await api.post('/payments/create-order', { bookingId });
    return response.data;
  },

  async verifyPayment(orderId, paymentId, signature) {
    const response = await api.post('/payments/verify', {
      orderId,
      paymentId,
      signature
    });
    return response.data;
  },

  async getPaymentByBookingId(bookingId) {
    const response = await api.get(`/payments/booking/${bookingId}`);
    return response.data;
  }
};
