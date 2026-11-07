import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.data?.accessToken) {
      localStorage.setItem('mysterystay_token', response.data.data.accessToken);
      localStorage.setItem('mysterystay_user', JSON.stringify({
        userId: response.data.data.userId,
        email: response.data.data.email,
        fullName: response.data.data.fullName,
        role: response.data.data.role
      }));
    }
    return response.data;
  },

  async register(fullName, email, password, phone, role = 'ROLE_CUSTOMER') {
    const response = await api.post('/auth/register', {
      fullName,
      email,
      password,
      phone,
      role
    });
    return response.data;
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('mysterystay_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('mysterystay_token');
  },

  logout() {
    localStorage.removeItem('mysterystay_token');
    localStorage.removeItem('mysterystay_user');
  }
};
