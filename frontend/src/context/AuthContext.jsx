import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { getAuthItem, setAuthItem, removeAuthItem, clearAuthStorageBoth } from '../utils/authStorage';

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
      // Use sessionStorage only so auth doesn't persist across closed tabs
      const storedUser = getAuthItem('user');
      const token = getAuthItem('token');

      // If older localStorage tokens exist, clear them to avoid unexpected persisted logins
      // Remove old localStorage tokens to avoid accidental persistence
      try { localStorage.removeItem('token'); localStorage.removeItem('user'); } catch {}
      
      if (storedUser && token) {
        const userData = JSON.parse(storedUser);
        
        try {
          const response = await authAPI.getMe();
          if (response.data.success) {
            setUser(response.data.user);
              // Ensure token is stored in session storage (doesn't persist across tab close)
              setAuthItem('user', JSON.stringify(response.data.user));
              setAuthItem('token', token);
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
    // Remove from both to be safe
    clearAuthStorageBoth();
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
        
        // Store in sessionStorage so login doesn't persist after tab close
        setAuthItem('user', JSON.stringify(userData));
        setAuthItem('token', token);
        
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
        setAuthItem('user', JSON.stringify(userData));
        setAuthItem('token', token);
        
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