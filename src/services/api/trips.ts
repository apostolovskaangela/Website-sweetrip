import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../axiosClient';

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
    const response = await axiosClient.get<TripsListResponse>('/trips', { params });
    return response.data;
  },

  get: async (id: number): Promise<Trip> => {
    const response = await axiosClient.get<TripResponse>(`/trips/${id}`);
    return response.data.trip;
  },

  create: async (data: CreateTripRequest): Promise<CreateTripResponse> => {
    const response = await axiosClient.post<CreateTripResponse>('/trips', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTripRequest): Promise<CreateTripResponse> => {
    const response = await axiosClient.put<CreateTripResponse>(`/trips/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/trips/${id}`);
  },

  getCreateData: async (): Promise<TripCreateDataResponse> => {
    const response = await axiosClient.get<TripCreateDataResponse>('/trips/create');
    return response.data;
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
      if (__DEV__) {
        console.log('📤 Uploading CMR:', {
          tripId: id,
          file: {
            uri: file.uri,
            type: file.type,
            name: file.name,
          },
        });
      }

      // Use Fetch API instead of axios for better React Native FormData support
      const formData = new FormData();
      
      // Format file for React Native FormData
      // React Native FormData requires specific format with uri, type, and name
      formData.append('cmr', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'cmr.jpg',
      } as any);
      
      if (__DEV__) {
        console.log('📎 FormData file object:', {
          uri: file.uri,
          type: file.type || 'image/jpeg',
          name: file.name || 'cmr.jpg',
        });
      }

      // Get auth token
      const token = await AsyncStorage.getItem('AUTH_TOKEN');
      
      // Get base URL from axios client config
      const baseURL = axiosClient.defaults.baseURL;
      const url = `${baseURL}/driver/trips/${id}/cmr`;
      
      if (__DEV__) {
        console.log('📡 Upload URL:', url);
      }

      // Use fetch API for file uploads (better React Native support)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // Don't set Content-Type - let fetch set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(errorData.message || `Upload failed with status ${response.status}`);
        error.response = {
          status: response.status,
          data: errorData,
        };
        throw error;
      }

      const data: TripResponse = await response.json();

      if (__DEV__) {
        console.log('✅ CMR uploaded successfully:', {
          trip: data.trip,
          cmr: data.trip?.cmr,
          cmr_url: data.trip?.cmr_url,
        });
      }

      return data;
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
    const formData = new FormData();
    formData.append('cmr', file);
    
    const response = await axiosClient.post<TripResponse>(
      `/trips/${id}/cmr`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};


