import axios from 'axios';

// Backend URL without /api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('🔗 API URL:', API_URL); // Debug log

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false, // Changed to false since we're using token-based auth
  timeout: 15000, // Increased timeout
});

// Request interceptor - FIXED for token-based auth
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (for production)
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No token found for request');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - IMPROVED error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 401 Unauthorized - clearing auth data');
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
};

export const productsAPI = {
  getProducts: (params = {}) => api.get('/api/products', { params }),
  getProduct: (id) => api.get(`/api/products/${id}`),
};

export const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addToCart: (item) => api.post('/api/cart/add', item),
  updateCart: (item) => api.put('/api/cart/update', item),
  removeFromCart: (item) => api.delete('/api/cart/remove', { data: item }),
  clearCart: () => api.delete('/api/cart/clear'),
};

export const ordersAPI = {
  createOrder: (orderData) => api.post('/api/orders', orderData),
  getOrders: () => api.get('/api/orders'),
  getOrder: (id) => api.get(`/api/orders/${id}`),
};

// Test connection
export const testConnection = () => api.get('/api/health');

export default api;