import { API_CONFIG } from '@/src/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// Base URL - adjust based on your environment
const BASE_URL = API_CONFIG.BASE_URL;

// Log the API URL being used (only in development)
if (__DEV__) {
  console.log('🌐 API Base URL:', BASE_URL);
  console.log('📱 Platform:', Platform.OS);
  console.log('💡 If you see network errors, make sure:');
  console.log('   1. Backend is running on the configured port');
  console.log('   2. For physical devices, use your machine IP (not localhost)');
  console.log('   3. Update src/config/api.ts with correct URL');
}

// Create axios instance
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
    async (config) => {
    try {
      const token = await AsyncStorage.getItem('AUTH_TOKEN');
      console.log('🔐 AUTH_TOKEN from storage:', token);
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

    // Enhanced error logging for network issues
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('❌ Network Error Details:', {
        message: error.message,
        code: error.code,
        baseURL: BASE_URL,
        url: originalRequest?.url,
        fullURL: `${BASE_URL}${originalRequest?.url}`,
      });
      
      console.error('\n⚠️ TROUBLESHOOTING NETWORK ERROR:');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('1. ✅ Check if backend is running:');
      console.error('   Open browser: http://192.168.1.103:8000/api/login');
      console.error('   (Should show error, but confirms server is reachable)');
      console.error('');
      console.error('2. ✅ Laravel server must bind to 0.0.0.0 (not 127.0.0.1):');
      console.error('   Run: php artisan serve --host=0.0.0.0 --port=8000');
      console.error('   NOT: php artisan serve (this only binds to localhost)');
      console.error('');
      console.error('3. ✅ Check firewall settings:');
      console.error('   Windows: Allow port 8000 in Windows Firewall');
      console.error('   Mac/Linux: Check firewall rules');
      console.error('');
      console.error('4. ✅ Verify IP address:');
      console.error('   Current IP: 192.168.1.103');
      console.error('   Run "ipconfig" (Windows) or "ifconfig" (Mac/Linux) to verify');
      console.error('');
      console.error('5. ✅ Network connectivity:');
      console.error('   Device/emulator must be on same network as backend');
      console.error('   Try ping 192.168.1.103 from device/emulator');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

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

