import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = 'http://192.168.1.5:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor - Token එක ස්වයංක්‍රීයව එකතු කරයි
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Errors Handle කිරීම
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('❌ API Error:', error.message);
    console.log('❌ API URL:', error.config?.url);
    if (error.code === 'ECONNABORTED') {
      console.log('❌ Request timeout - Backend එකට connect වෙන්න බැහැ');
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;