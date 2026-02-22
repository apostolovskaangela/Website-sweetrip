import AsyncStorage from '@react-native-async-storage/async-storage';
import * as dataService from '@/src/lib/sqlite/dataService';
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
    roles?: string[];
    role_id?: number;
  };
  token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  role_id?: number;
}

const ROLE_MAP: { [key: number]: string } = {
  1: 'ceo',
  2: 'manager',
  3: 'admin',
  4: 'driver',
};

export const authApi = {
  /**
   * Login user (local)
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const user = await dataService.getUserByEmail(data.email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // In development, we accept any password for testing
      // In production, you would verify the bcrypt password hash
      if (!__DEV__ && data.password !== user.password) {
        throw new Error('Invalid email or password');
      }

      const token = `local_token_${user.id}_${Date.now()}`;
      const roleName = ROLE_MAP[user.role_id] || 'user';

      const response: LoginResponse = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: [roleName],
          role_id: user.role_id,
        },
        token,
      };

      // Store token and user data
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

      if (__DEV__) {
        console.log('✅ Local login successful for', data.email);
      }

      return response;
    } catch (err: any) {
      if (__DEV__) console.error('Login error:', err);
      throw err;
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      // Clear local storage and queued offline requests
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      try {
        await Offline.clearQueue();
      } catch (e) {
        if (__DEV__) console.warn('Failed to clear offline queue on logout', e);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Get current authenticated user
   */
  getUser: async (): Promise<User> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        const user = JSON.parse(stored);
        return user;
      }
      throw new Error('No user data found');
    } catch (err: any) {
      if (__DEV__) console.warn('getUser failed:', err?.message || err);
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


