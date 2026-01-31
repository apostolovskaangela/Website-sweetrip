import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../axiosClient';
import Offline from '../offline';

const STORAGE_KEYS = {
  TOKEN: 'AUTH_TOKEN',
  USER: 'USER_DATA',
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    roles: string[];
  };
  token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export const authApi = {
  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await axiosClient.post<LoginResponse>('/login', data);

      // Store token and user data
      if (response.data.token) {
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (err: any) {
      // Network/offline fallback: allow login if we have stored credentials for this email
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const storedJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        if (storedJson && storedToken) {
          const storedUser = JSON.parse(storedJson);
          if (storedUser.email === data.email) {
            // return stored user and token (offline login)
            if (__DEV__) console.log('⚡ Offline login used for', data.email);
            return { user: storedUser, token: storedToken } as LoginResponse;
          }
        }
      }
      throw err;
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await axiosClient.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and queued offline requests
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      try {
        await Offline.clearQueue();
      } catch (e) {
        if (__DEV__) console.warn('Failed to clear offline queue on logout', e);
      }
    }
  },

  /**
   * Get current authenticated user
   */
  getUser: async (): Promise<User> => {
    try {
      const response = await axiosClient.get<User>('/user');
      // update stored copy
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
      } catch (e) {
        if (__DEV__) console.warn('Failed to update stored user', e);
      }
      return response.data;
    } catch (err: any) {
      if (__DEV__) console.warn('getUser failed, returning stored user if present', err?.message || err);
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (stored) return JSON.parse(stored);
      throw err;
    }
  },

  /**
   * Alias for getUser (matches guide naming)
   */
  getCurrentUser: async (): Promise<User> => {
    return authApi.getUser();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    return !!token;
  },

  /**
   * Get stored user data
   */
  getStoredUser: async (): Promise<User | null> => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  },
};


