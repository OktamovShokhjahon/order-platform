const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

module.exports = {
  getCategories: () => api.get('/categories'),
  getFoods: (params) => api.get('/foods', { params }),
  getOrders: (token) =>
    api.get('/orders', { headers: { Authorization: `Bearer ${token}` } }),
  getOrderById: (id, token) =>
    api.get(`/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
};
