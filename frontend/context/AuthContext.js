import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAuthToken } from '../services/api';
import { setActiveUser } from '../utils/userStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        const response = await api.get('/auth/me');
        setUser(response.data);
        setActiveUser(response.data.id || response.data._id);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Auth check error:', error.message);
      await AsyncStorage.removeItem('token');
      setAuthToken(null);
      setActiveUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      await AsyncStorage.setItem('token', token);
      setAuthToken(token);
      setUser(user);
      setActiveUser(user.id || user._id);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please check your connection.',
      };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      await AsyncStorage.removeItem('token');
      setAuthToken(null);
      setActiveUser(null);
      setUser(null);
      setIsLoggedIn(false);
      return { success: true };
    } catch (error) {
      console.error('Register error:', error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed. Please check your connection.',
      };
    }
  };

  // ⭐ NEW: Update User after Profile Edit
  const updateUser = (newUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...newUserData,
    }));
    console.log('✅ AuthContext user updated:', newUserData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setAuthToken(null);
    setActiveUser(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        login,
        register,
        updateUser, // 👈 Export කරන්න
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};