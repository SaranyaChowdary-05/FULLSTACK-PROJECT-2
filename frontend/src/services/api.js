import axios from 'axios';

// Use the same hostname the browser is on, so it works from both desktop AND mobile
// Use localhost if hostname is missing, otherwise use current hostname
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const eventService = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
};

export const bookingService = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getUserBookings: (userId) => api.get(`/bookings/user/${userId}`),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
  refund: (id) => api.post(`/bookings/${id}/refund`),
};

export const waitlistService = {
  join: (data) => api.post('/waitlist/join', data),
  getForEvent: (eventId) => api.get(`/waitlist/event/${eventId}`),
  getForUser: (userId) => api.get(`/waitlist/user/${userId}`),
  claim: (id) => api.post(`/waitlist/${id}/claim`),
};

export const recommendationService = {
  getInterests: (userId) => api.get(`/users/${userId}/interests`),
  saveInterests: (userId, interests) => api.post(`/users/${userId}/interests`, { interests }),
  trackInteraction: (userId, eventId, type) => api.post(`/users/${userId}/interactions`, { eventId, type }),
  getRecommendations: (userId) => api.get(`/users/${userId}/recommendations`),
};

export const chatService = {
  sendMessage: (message, history, userId) => api.post('/chat', { message, history, userId }),
};

export const adminPredictionService = {
  getPredictions: () => api.get('/admin/events/predictions'),
  updateCapacity: (eventId, capacity) => api.patch(`/events/${eventId}/capacity`, { capacity }),
  getInsights: () => api.get('/admin/events/insights'),
};

export const forecastService = {
  getForecasts: () => api.get('/admin/events/forecast'),
};

export default api;
