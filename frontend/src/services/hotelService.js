import api from './api';

export const hotelService = {
  async getMyHotels() {
    try {
      const response = await api.get('/hotels/my');
      return response.data?.data || [];
    } catch {
      return [];
    }
  },

  async registerHotel(hotelData) {
    const response = await api.post('/hotels', hotelData);
    return response.data;
  },

  async getAdminHotels() {
    try {
      const response = await api.get('/admin/hotels');
      return response.data?.data || [];
    } catch {
      return [];
    }
  },

  async verifyHotel(hotelId, verified) {
    const response = await api.patch(`/admin/hotels/${hotelId}/verify`, null, {
      params: { verified }
    });
    return response.data;
  }
};
