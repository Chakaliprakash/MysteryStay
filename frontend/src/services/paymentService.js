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
  },

  async createUpiPaymentOrder(bookingId) {
    const response = await api.post('/payments/upi/create-order', { bookingId });
    return response.data;
  },

  async verifyUpiPayment(paymentReference, upiTransactionId, remarks) {
    const response = await api.post('/payments/upi/verify', {
      paymentReference,
      upiTransactionId,
      remarks
    });
    return response.data;
  },

  async getUpiPaymentStatus(paymentReference) {
    const response = await api.get(`/payments/upi/status/${paymentReference}`);
    return response.data;
  }
};
