import axios from 'axios';
import { getAuthItem, clearAuthStorageBoth } from '../utils/authStorage';

// Backend URL without /api
// When deploying, set VITE_API_URL environment variable to backend URL.
// If not set in production, attempt to fallback to the frontend origin + '/api' endpoint (same host).
const defaultDev = 'http://localhost:5000';
let API_URL = import.meta.env.VITE_API_URL || defaultDev;
if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  // Fallback to Render backend URL if Vite env not configured during build
  API_URL = 'https://clothing-ecommerce-r3jy.onrender.com';
  console.warn('⚠️ VITE_API_URL is not set in production build; falling back to Render backend URL. Set VITE_API_URL in Vercel to avoid rebuild hardcoding.');
}

console.log('🔗 API URL:', API_URL); // Debug log

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false, // Changed to false since we're using token-based auth
  timeout: 15000, // Increased timeout
});

// Request interceptor - FIXED for token-based auth
api.interceptors.request.use(
  (config) => {
    // Get token using our storage helper (session in dev, local in production)
    const token = getAuthItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No token found for request');
    }

    // Log the full URL that will be called for debugging (baseURL + url)
    try {
      const base = config.baseURL || API_URL;
      const path = config.url || '';
      console.log('📡 API Request:', base + path);
    } catch (e) {
      // ignore
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
    const url = error.config?.url;
    const base = error.config?.baseURL || API_URL;
    const status = error.response?.status;
    const data = error.response?.data;
    const fullUrl = `${base || ''}${url || ''}`;
    console.error('❌ API Error:', {
      url: fullUrl,
      status,
      data,
      headers: error.config?.headers
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 401 Unauthorized - clearing auth data');
      // Clear all auth data
      // Clear both storages for 401 condition
      clearAuthStorageBoth();
      
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