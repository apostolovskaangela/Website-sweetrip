import AsyncStorage from '@react-native-async-storage/async-storage';
import * as dataService from '@/src/lib/sqlite/dataService';

export interface Trip {
  id: number;
  trip_number: string;
  status: string;
  status_label?: string;
  trip_date: string;
  destination_from: string;
  destination_to: string;
  mileage?: number;
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
  status: 'not_started' | 'in_process' | 'started' | 'in_progress' | 'completed';
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
    try {
      const trips = await dataService.getAllTrips();
      const total = trips.length;
      const per_page = 15;
      const last_page = Math.ceil(total / per_page);
      const current_page = page || 1;
      const start = (current_page - 1) * per_page;
      const paginatedTrips = trips.slice(start, start + per_page);

      return {
        trips: paginatedTrips as Trip[],
        pagination: {
          current_page,
          last_page,
          per_page,
          total,
        },
      };
    } catch (error: any) {
      if (__DEV__) console.error('Error fetching trips:', error);
      throw error;
    }
  },

  get: async (id: number): Promise<Trip> => {
    try {
      const tripData = await dataService.getTripWithRelations(id);
      if (!tripData) {
        throw new Error(`Trip with id ${id} not found`);
      }
      return tripData as unknown as Trip;
    } catch (error: any) {
      if (__DEV__) console.error('Error fetching trip:', error);
      throw error;
    }
  },

  create: async (data: CreateTripRequest): Promise<CreateTripResponse> => {
    try {
      const newTrip = await dataService.createTrip({
        trip_number: data.trip_number,
        vehicle_id: data.vehicle_id,
        driver_id: data.driver_id,
        a_code: data.a_code,
        destination_from: data.destination_from,
        destination_to: data.destination_to,
        status: data.status || 'not_started',
        mileage: data.mileage,
        driver_description: data.driver_description,
        admin_description: data.admin_description,
        trip_date: data.trip_date,
        invoice_number: data.invoice_number,
        amount: data.amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      // Create associated stops
      if (data.stops && data.stops.length > 0) {
        for (const stop of data.stops) {
          await dataService.createTripStop({
            trip_id: newTrip.id,
            destination: stop.destination,
            stop_order: stop.stop_order,
            notes: stop.notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      return {
        message: 'Trip created successfully',
        trip: newTrip as Trip,
      };
    } catch (error: any) {
      if (__DEV__) console.error('Error creating trip:', error);
      throw error;
    }
  },

  update: async (id: number, data: UpdateTripRequest): Promise<CreateTripResponse> => {
    try {
      const updated = await dataService.updateTrip(id, data as any);
      if (!updated) {
        throw new Error(`Trip with id ${id} not found`);
      }
      return {
        message: 'Trip updated successfully',
        trip: updated as Trip,
      };
    } catch (error: any) {
      if (__DEV__) console.error('Error updating trip:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const success = await dataService.deleteTrip(id);
      if (!success) {
        throw new Error(`Trip with id ${id} not found`);
      }
    } catch (error: any) {
      if (__DEV__) console.error('Error deleting trip:', error);
      throw error;
    }
  },

  getCreateData: async (): Promise<TripCreateDataResponse> => {
    try {
      const drivers = await dataService.getDrivers();
      const vehicles = await dataService.getActiveVehicles();

      return {
        drivers: drivers.map(d => ({
          id: d.id,
          name: d.name,
          email: d.email,
        })),
        vehicles: vehicles.map(v => ({
          id: v.id,
          registration_number: v.registration_number || '',
          is_active: v.is_active === 1,
        })),
      };
    } catch (error: any) {
      if (__DEV__) console.error('Error fetching trip create data:', error);
      throw error;
    }
  },

  updateStatus: async (id: number, status: UpdateStatusRequest): Promise<UpdateStatusResponse> => {
    try {
      if (__DEV__) {
        console.log('🔄 Updating trip status (local):', {
          tripId: id,
          status: status.status,
        });
      }

      const updated = await dataService.updateTripStatus(id, status.status);
      if (!updated) {
        throw new Error(`Trip with id ${id} not found`);
      }

      if (__DEV__) {
        console.log('✅ Status updated successfully:', updated);
      }

      return {
        message: 'Trip status updated successfully',
        trip: {
          id: updated.id,
          status: updated.status,
          status_label: updated.status,
        },
      };
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Error updating trip status:', error);
      }
      throw error;
    }
  },

  uploadCMR: async (id: number, file: any): Promise<TripResponse> => {
    try {
      if (__DEV__) {
        console.log('📤 Uploading CMR (local):', {
          tripId: id,
          file: {
            uri: file.uri,
            type: file.type,
            name: file.name,
          },
        });
      }

      // For local development, just store the file path/uri
      const trip = await dataService.updateTrip(id, {
        cmr: file.name || file.uri,
        cmr_url: file.uri,
      } as any);

      if (!trip) {
        throw new Error(`Trip with id ${id} not found`);
      }

      if (__DEV__) {
        console.log('✅ CMR stored successfully:', trip);
      }

      return {
        trip: trip as Trip,
      };
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Error uploading CMR:', error);
      }
      throw error;
    }
  },

  uploadCMRByTrip: async (id: number, file: any): Promise<TripResponse> => {
    return tripsApi.uploadCMR(id, file);
  },
};


