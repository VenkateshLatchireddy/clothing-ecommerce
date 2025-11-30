import axios from 'axios';

// Remove /api from here - backend URL only
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,  // Remove /api from here
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),  // Keep /api here
  login: (credentials) => api.post('/api/auth/login', credentials),  // Keep /api here
  logout: () => api.post('/api/auth/logout'),  // Keep /api here
  getMe: () => api.get('/api/auth/me'),  // Keep /api here
};

export const productsAPI = {
  getProducts: (params = {}) => api.get('/api/products', { params }),  // Keep /api here
  getProduct: (id) => api.get(`/api/products/${id}`),  // Keep /api here
};

export const cartAPI = {
  getCart: () => api.get('/api/cart'),  // Keep /api here
  addToCart: (item) => api.post('/api/cart/add', item),  // Keep /api here
  updateCart: (item) => api.put('/api/cart/update', item),  // Keep /api here
  removeFromCart: (item) => api.delete('/api/cart/remove', { data: item }),  // Keep /api here
  clearCart: () => api.delete('/api/cart/clear'),  // Keep /api here
};

export const ordersAPI = {
  createOrder: (orderData) => api.post('/api/orders', orderData),  // Keep /api here
  getOrders: () => api.get('/api/orders'),  // Keep /api here
  getOrder: (id) => api.get(`/api/orders/${id}`),  // Keep /api here
};

export default api;