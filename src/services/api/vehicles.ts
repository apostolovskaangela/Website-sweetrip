import * as dataService from '@/src/lib/sqlite/dataService';

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
    try {
      const vehicles = await dataService.getAllVehicles();
      return vehicles;
    } catch (err: any) {
      if (__DEV__) console.error('Error fetching vehicles:', err);
      throw err;
    }
  },

  get: async (id: number) => {
    try {
      const vehicle = await dataService.getVehicleById(id);
      if (!vehicle) {
        throw new Error(`Vehicle with id ${id} not found`);
      }
      return vehicle;
    } catch (err: any) {
      if (__DEV__) console.error('Error fetching vehicle:', err);
      throw err;
    }
  },

  create: async (data: any) => {
    try {
      const vehicle = await dataService.createVehicle({
        registration_number: data.registration_number,
        notes: data.notes,
        is_active: data.is_active === 1 ? 1 : 0,
        manager_id: data.manager_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return vehicle;
    } catch (err: any) {
      if (__DEV__) console.error('Error creating vehicle:', err);
      throw err;
    }
  },

  update: async (id: number, data: any) => {
    try {
      const vehicle = await dataService.updateVehicle(id, data);
      if (!vehicle) {
        throw new Error(`Vehicle with id ${id} not found`);
      }
      return vehicle;
    } catch (err: any) {
      if (__DEV__) console.error('Error updating vehicle:', err);
      throw err;
    }
  },

  delete: async (id: number) => {
    try {
      const success = await dataService.deleteVehicle(id);
      if (!success) {
        throw new Error(`Vehicle with id ${id} not found`);
      }
    } catch (err: any) {
      if (__DEV__) console.error('Error deleting vehicle:', err);
      throw err;
    }
  },
};
