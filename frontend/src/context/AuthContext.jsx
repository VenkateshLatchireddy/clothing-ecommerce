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
      const storedUser = sessionStorage.getItem('user');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        try {
          const response = await authAPI.getMe();
          if (response.data.success) {
            setUser(response.data.user);
            sessionStorage.setItem('user', JSON.stringify(response.data.user));
          } else {
            throw new Error('Invalid token');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          sessionStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      sessionStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Sending login request to backend...');
      const response = await authAPI.login({ email, password });
      console.log('📨 Backend response:', response.data);

      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ User logged in and stored in sessionStorage');
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
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
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
    setUser(null);
    sessionStorage.removeItem('user');
    localStorage.removeItem('guestCart');
    console.log('✅ User logged out and sessionStorage cleared');
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