import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../axiosClient';
import { enqueueRequest } from '../offline';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  manager_id?: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  manager_id?: number;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  password?: string; // Optional - if not provided, existing password is kept
}

export interface UsersListResponse {
  users: User[];
}

export const usersApi = {
  list: async (): Promise<User[]> => {
    const cacheKey = '/users';
    try {
      const response = await axiosClient.get<UsersListResponse>('/users');
      const list = response.data.users;
      try {
        await AsyncStorage.setItem(`cache:${cacheKey}`, JSON.stringify(list));
      } catch (e) {
        if (__DEV__) console.warn('Failed to cache users list', e);
      }
      return list;
    } catch (err: any) {
      if (__DEV__) console.warn('Users list failed, returning cache if present', err?.message || err);
      const cached = await AsyncStorage.getItem(`cache:${cacheKey}`);
      if (cached) return JSON.parse(cached);
      throw err;
    }
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    try {
      const response = await axiosClient.post<User>('/users', data);
      return response.data;
    } catch (err: any) {
      await enqueueRequest({ method: 'POST', url: '/users', body: data });
      return { id: -Date.now(), ...data } as unknown as User;
    }
  },

  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    try {
      const response = await axiosClient.put<User>(`/users/${id}`, data);
      return response.data;
    } catch (err: any) {
      await enqueueRequest({ method: 'PUT', url: `/users/${id}`, body: data });
      return { id, ...(data as object) } as unknown as User;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axiosClient.delete(`/users/${id}`);
    } catch (err: any) {
      await enqueueRequest({ method: 'DELETE', url: `/users/${id}` });
    }
  },
};


