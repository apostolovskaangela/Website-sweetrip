import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from "../axiosClient";
import { enqueueRequest } from '../offline';

export interface Vehicle {
  id: number;
  registration_number: string;
  notes?: string;
  is_active: boolean;
  manager_id?: number;
}

// src/services/api.ts
export const vehiclesApi = {
  list: async (): Promise<any[]> => {
    const cacheKey = '/vehicles';
    try {
      const response = await axiosClient.get("/vehicles");
      const list = response.data.vehicles;
      try {
        await AsyncStorage.setItem(`cache:${cacheKey}`, JSON.stringify(list));
      } catch (e) {
        if (__DEV__) console.warn('Failed to cache vehicles list', e);
      }
      return list;
    } catch (err: any) {
      if (__DEV__) console.warn('Vehicles list failed, returning cached if present', err?.message || err);
      const cached = await AsyncStorage.getItem(`cache:${cacheKey}`);
      if (cached) return JSON.parse(cached);
      throw err;
    }
  },

  get: async (id: number) => {
    const cacheKey = `/vehicles/${id}`;
    try {
      const response = await axiosClient.get(`/vehicles/${id}`);
      try {
        await AsyncStorage.setItem(`cache:${cacheKey}`, JSON.stringify(response.data.vehicle));
      } catch (e) {
        if (__DEV__) console.warn('Failed to cache vehicle', e);
      }
      return response.data.vehicle;
    } catch (err: any) {
      if (__DEV__) console.warn('Vehicle fetch failed, returning cache if present', err?.message || err);
      const cached = await AsyncStorage.getItem(`cache:${cacheKey}`);
      if (cached) return JSON.parse(cached);
      throw err;
    }
  },

  create: async (data: any) => {
    try {
      const response = await axiosClient.post("/vehicles", data);
      return response.data.vehicle;
    } catch (err: any) {
      await enqueueRequest({ method: 'POST', url: '/vehicles', body: data });
      const temp: any = { id: -Date.now(), ...data };
      return temp;
    }
  },

  update: async (id: number, data: any) => {
    try {
      const response = await axiosClient.put(`/vehicles/${id}`, data);
      return response.data.vehicle;
    } catch (err: any) {
      await enqueueRequest({ method: 'PUT', url: `/vehicles/${id}`, body: data });
      return { id, ...data };
    }
  },

  delete: async (id: number) => {
    try {
      await axiosClient.delete(`/vehicles/${id}`);
    } catch (err: any) {
      await enqueueRequest({ method: 'DELETE', url: `/vehicles/${id}` });
    }
  },
};
