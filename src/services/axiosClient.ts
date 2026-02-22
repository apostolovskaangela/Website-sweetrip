import { API_CONFIG } from '@/src/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { localAxiosAdapter } from '@/src/services/localApi/adapter';

// Base URL - adjust based on your environment
const BASE_URL = API_CONFIG.BASE_URL;

// Log the API URL being used (only in development)
if (__DEV__) {
  console.log('🌐 API Base URL:', BASE_URL);
  console.log('📱 Platform:', Platform.OS);
}

// Create axios instance
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  // Route requests to a local SQLite-backed API (no network / no Laravel).
  adapter: localAxiosAdapter,
  // Ensure non-2xx statuses reject (so callers hit their catch paths).
  validateStatus: (status) => status >= 200 && status < 300,
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
    async (config) => {
    try {
      const token = await AsyncStorage.getItem('AUTH_TOKEN');
      if (__DEV__) console.log('🔐 AUTH_TOKEN from storage:', token ? `${token.slice(0, 10)}…` : null);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // For FormData requests, remove Content-Type header to let axios set it with boundary
      // Check if data is FormData (works in both web and React Native)
      const isFormData = config.data instanceof FormData || 
                        (typeof FormData !== 'undefined' && config.data?.constructor?.name === 'FormData') ||
                        (config.data && typeof config.data.append === 'function');
      
      if (isFormData) {
        delete config.headers['Content-Type'];
        if (__DEV__) {
          console.log('📎 FormData detected, removed Content-Type header');
        }
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear auth data and redirect to login
      try {
        await AsyncStorage.removeItem('AUTH_TOKEN');
        await AsyncStorage.removeItem('USER_DATA');
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

