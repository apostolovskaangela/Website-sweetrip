import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../axiosClient';
import { enqueueRequest } from '../offline';
import { checkInternetNow } from '@/src/services/internetStatus';
// SDK 54+ deprecates the legacy namespace exports from `expo-file-system`.
// Use the legacy API explicitly to avoid runtime errors in Expo Go / SDK 54.
import * as FileSystem from 'expo-file-system/legacy';

export interface Trip {
  id: number;
  trip_number: string;
  status: string;
  status_label: string;
  trip_date: string;
  destination_from: string;
  destination_to: string;
  mileage: number;
  a_code?: string;
  driver_description?: string;
  admin_description?: string;
  invoice_number?: string;
  amount?: number;
  cmr?: string | null;
  cmr_url?: string | null;
  driver?: {
    id: number;
    name: string;
    email: string;
  };
  vehicle?: {
    id: number;
    registration_number: string;
  };
  stops?: {
    id: number;
    destination: string;
    stop_order: number;
    notes?: string;
  }[];
}

export interface CreateTripRequest {
  trip_number: string;
  vehicle_id: number;
  driver_id: number;
  a_code?: string;
  destination_from: string;
  destination_to: string;
  status?: string;
  mileage?: number;
  driver_description?: string;
  admin_description?: string;
  trip_date: string;
  invoice_number?: string;
  amount?: number;
  stops?: {
    destination: string;
    stop_order: number;
    notes?: string;
  }[];
}

export interface UpdateTripRequest extends Partial<CreateTripRequest> {}

export interface TripsListResponse {
  trips: Trip[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface TripResponse {
  trip: Trip;
}

export interface CreateTripResponse {
  message: string;
  trip: Trip;
}

export interface TripCreateDataResponse {
  drivers: {
    id: number;
    name: string;
    email: string;
  }[];
  vehicles: {
    id: number;
    registration_number: string;
    make?: string;
    model?: string;
    is_active: boolean;
  }[];
}

export interface UpdateStatusRequest {
  status: 'not_started' | 'in_process' | 'started' | 'completed';
}

export interface UpdateStatusResponse {
  message: string;
  trip: {
    id: number;
    status: string;
    status_label: string;
  };
}

export const tripsApi = {
  list: async (page?: number): Promise<TripsListResponse> => {
    const params = page ? { page } : {};
    const cacheKey = `/trips${page ? `?page=${page}` : ''}`;
    try {
      const response = await axiosClient.get<TripsListResponse>('/trips', { params });
      try {
        await AsyncStorage.setItem(`cache:${cacheKey}`, JSON.stringify(response.data));
      } catch (e) {
        if (__DEV__) console.warn('Failed to cache trips list', e);
      }
      return response.data;
    } catch (err: any) {
      if (__DEV__) console.warn('Trips list request failed, returning cached data if available', err?.message || err);
      const cached = await AsyncStorage.getItem(`cache:${cacheKey}`);
      if (cached) return JSON.parse(cached);
      throw err;
    }
  },

  get: async (id: number): Promise<Trip> => {
    const cacheKey = `/trips/${id}`;
    try {
      const response = await axiosClient.get<TripResponse>(`/trips/${id}`);
      try {
        await AsyncStorage.setItem(`cache:${cacheKey}`, JSON.stringify(response.data.trip));
      } catch (e) {
        if (__DEV__) console.warn('Failed to cache trip', e);
      }
      return response.data.trip;
    } catch (err: any) {
      if (__DEV__) console.warn('Trip fetch failed, returning cached if present', err?.message || err);
      const cached = await AsyncStorage.getItem(`cache:${cacheKey}`);
      if (cached) return JSON.parse(cached);
      throw err;
    }
  },

  create: async (data: CreateTripRequest): Promise<CreateTripResponse> => {
    const isOffline = await checkInternetNow();
    if (isOffline) {
      await enqueueRequest({ method: 'POST', url: '/trips', body: data });
      const tempTrip: any = { id: -Date.now(), ...data };
      return { message: 'created_offline', trip: tempTrip } as unknown as CreateTripResponse;
    }
    try {
      const response = await axiosClient.post<CreateTripResponse>('/trips', data);
      return response.data;
    } catch (err: any) {
      // enqueue request to be synced later
      await enqueueRequest({ method: 'POST', url: '/trips', body: data });
      const tempTrip: any = { id: -Date.now(), ...data };
      return { message: 'created_offline', trip: tempTrip } as unknown as CreateTripResponse;
    }
  },

  update: async (id: number, data: UpdateTripRequest): Promise<CreateTripResponse> => {
    const isOffline = await checkInternetNow();
    if (isOffline) {
      await enqueueRequest({ method: 'PUT', url: `/trips/${id}`, body: data });
      const tempTrip: any = { id, ...data };
      return { message: 'updated_offline', trip: tempTrip } as unknown as CreateTripResponse;
    }
    try {
      const response = await axiosClient.put<CreateTripResponse>(`/trips/${id}`, data);
      return response.data;
    } catch (err: any) {
      await enqueueRequest({ method: 'PUT', url: `/trips/${id}`, body: data });
      const tempTrip: any = { id, ...data };
      return { message: 'updated_offline', trip: tempTrip } as unknown as CreateTripResponse;
    }
  },

  delete: async (id: number): Promise<void> => {
    const isOffline = await checkInternetNow();
    if (isOffline) {
      await enqueueRequest({ method: 'DELETE', url: `/trips/${id}` });
      return;
    }
    try {
      await axiosClient.delete(`/trips/${id}`);
    } catch (err: any) {
      await enqueueRequest({ method: 'DELETE', url: `/trips/${id}` });
    }
  },

  getCreateData: async (): Promise<TripCreateDataResponse> => {
    const cacheKey = `/trips/create`;
    try {
      const response = await axiosClient.get<TripCreateDataResponse>('/trips/create');
      try {
        await AsyncStorage.setItem(`cache:${cacheKey}`, JSON.stringify(response.data));
      } catch (e) {
        if (__DEV__) console.warn('Failed to cache trip create data', e);
      }
      return response.data;
    } catch (err: any) {
      if (__DEV__) console.warn('Trip create data request failed, returning cached data if available', err?.message || err);
      const cached = await AsyncStorage.getItem(`cache:${cacheKey}`);
      if (cached) return JSON.parse(cached);
      throw err;
    }
  },

  updateStatus: async (id: number, status: UpdateStatusRequest): Promise<UpdateStatusResponse> => {
    try {
      if (__DEV__) {
        console.log('🔄 Updating trip status:', {
          tripId: id,
          status: status.status,
          endpoint: `/driver/trips/${id}/status`,
          requestBody: status,
        });
      }
      
      const response = await axiosClient.post<UpdateStatusResponse>(
        `/driver/trips/${id}/status`,
        status
      );
      
      if (__DEV__) {
        console.log('✅ Status updated successfully:', response.data);
      }
      
      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Error updating trip status:', {
          tripId: id,
          status: status.status,
          error: error.response?.data || error.message,
          statusCode: error.response?.status,
          validationErrors: error.response?.data?.errors,
        });
      }
      throw error;
    }
  },

  uploadCMR: async (id: number, file: any): Promise<TripResponse> => {
    try {
      if (!file?.uri) {
        throw new Error('Invalid file');
      }

      // Local SQLite mode: store the picked file into app storage and save its URI in SQLite.
      const safeName = (file.name || `cmr-${id}.jpg`).replace(/[^\w.\-]+/g, '_');
      const dest = `${FileSystem.documentDirectory ?? ''}cmr/${Date.now()}-${safeName}`;
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory ?? ''}cmr`, { intermediates: true });
      await FileSystem.copyAsync({ from: file.uri, to: dest });

      const response = await axiosClient.post<TripResponse>(`/driver/trips/${id}/cmr`, { cmr: dest });
      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Error uploading CMR:', {
          tripId: id,
          error: error.response?.data || error.message,
          statusCode: error.response?.status,
          validationErrors: error.response?.data?.errors,
          requestData: {
            uri: file.uri,
            type: file.type,
            name: file.name,
          },
        });
      }
      throw error;
    }
  },

  uploadCMRByTrip: async (id: number, file: any): Promise<TripResponse> => {
    if (!file?.uri) {
      throw new Error('Invalid file');
    }

    const safeName = (file.name || `cmr-${id}.jpg`).replace(/[^\w.\-]+/g, '_');
    const dest = `${FileSystem.documentDirectory ?? ''}cmr/${Date.now()}-${safeName}`;
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory ?? ''}cmr`, { intermediates: true });
    await FileSystem.copyAsync({ from: file.uri, to: dest });

    const response = await axiosClient.post<TripResponse>(`/trips/${id}/cmr`, { cmr: dest });
    return response.data;
  },
};


