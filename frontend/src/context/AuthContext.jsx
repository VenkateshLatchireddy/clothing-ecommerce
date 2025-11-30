import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check both localStorage and sessionStorage for backward compatibility
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (storedUser && token) {
        const userData = JSON.parse(storedUser);
        
        try {
          const response = await authAPI.getMe();
          if (response.data.success) {
            setUser(response.data.user);
            // Ensure token is in localStorage for production
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', token);
          } else {
            throw new Error('Invalid token');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Sending login request to backend...');
      const response = await authAPI.login({ email, password });
      console.log('📨 Backend response:', response.data);

      if (response.data.success) {
        const userData = response.data.user;
        const token = response.data.token;
        
        if (!token) {
          throw new Error('No token received from server');
        }

        // Set user state
        setUser(userData);
        
        // Store in localStorage for production (persists across refreshes)
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        
        console.log('✅ User logged in and token stored');
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('❌ Login request failed:', error);
      const backendError = error.response?.data?.message;
      
      return {
        success: false,
        message: backendError || 'Invalid email or password'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register({ name, email, password });
      
      if (response.data.success) {
        const userData = response.data.user;
        const token = response.data.token;
        
        if (!token) {
          throw new Error('No token received from server');
        }

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      const backendError = error.response?.data?.message;
      
      return {
        success: false,
        message: backendError || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    clearAuthData();
    localStorage.removeItem('guestCart');
    console.log('✅ User logged out and storage cleared');
    window.location.href = '/';
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};