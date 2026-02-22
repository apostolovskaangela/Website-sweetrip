import * as dataService from '@/src/lib/sqlite/dataService';

// ------------------
// Types
// ------------------

export interface DashboardStats {
  active_trips: number;
  total_vehicles: number;
  distance_today: number;
  efficiency: number;
  total_trips_last_month: number;
  completed_trips_last_month: number;
}

export interface Trip {
  id: number;
  trip_number: string;
  trip_date: string;
  status: string;
  status_label?: string;
  destination_from: string;
  destination_to: string;
  mileage?: number;
  driver?: {
    id: number;
    name: string;
  };
  vehicle?: {
    id: number;
    registration_number: string;
  };
}

export interface Vehicle {
  id: number;
  registration_number: string;
  is_active: boolean;
}

export interface DashboardResponse {
  stats: DashboardStats;
  drivers: any[];
  recent_trips: Trip[];
  vehicles: Vehicle[];
}

export interface DriverDashboardResponse {
  stats: {
    total_trips: number;
    completed_trips: number;
    pending_trips: number;
  };
  trips: Trip[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ------------------
// API
// ------------------

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardResponse> => {
    try {
      const trips = await dataService.getAllTrips();
      const vehicles = await dataService.getAllVehicles();
      const drivers = await dataService.getDrivers();

      const today = new Date().toISOString().split('T')[0];
      const activeTripCount = trips.filter(t => t.status === 'in_progress' || t.status === 'not_started').length;
      const tripsToday = trips.filter(t => t.trip_date === today);

      // Calculate last month's trips
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const tripsLastMonth = trips.filter(t => {
        const tripDate = new Date(t.trip_date);
        return tripDate >= lastMonth && tripDate < thisMonth;
      });

      return {
        stats: {
          active_trips: activeTripCount,
          total_vehicles: vehicles.length,
          distance_today: tripsToday.reduce((sum, t) => sum + (t.mileage || 0), 0),
          efficiency: vehicles.length > 0 ? (activeTripCount / vehicles.length) * 100 : 0,
          total_trips_last_month: tripsLastMonth.length,
          completed_trips_last_month: tripsLastMonth.filter(t => t.status === 'completed').length,
        },
        drivers: drivers.map(d => ({ id: d.id, name: d.name, email: d.email })),
        recent_trips: trips.slice(0, 10).map(t => ({
          id: t.id,
          trip_number: t.trip_number,
          trip_date: t.trip_date,
          status: t.status,
          status_label: t.status,
          destination_from: t.destination_from,
          destination_to: t.destination_to,
          mileage: t.mileage,
        } as Trip)),
        vehicles: vehicles.map(v => ({
          id: v.id,
          registration_number: v.registration_number || '',
          is_active: v.is_active === 1,
        })),
      };
    } catch (error: any) {
      if (__DEV__) console.error('Error fetching dashboard:', error);
      throw error;
    }
  },

  getDriverDashboard: async (): Promise<DriverDashboardResponse> => {
    try {
      const trips = await dataService.getAllTrips();
      const totalTrips = trips.length;
      const completedTrips = trips.filter(t => t.status === 'completed').length;
      const pendingTrips = trips.filter(t => t.status !== 'completed').length;

      return {
        stats: {
          total_trips: totalTrips,
          completed_trips: completedTrips,
          pending_trips: pendingTrips,
        },
        trips: trips.map(t => ({
          id: t.id,
          trip_number: t.trip_number,
          trip_date: t.trip_date,
          status: t.status,
          status_label: t.status,
          destination_from: t.destination_from,
          destination_to: t.destination_to,
          mileage: t.mileage,
        } as Trip)),
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: totalTrips,
        },
      };
    } catch (error: any) {
      if (__DEV__) console.error('Error fetching driver dashboard:', error);
      throw error;
    }
  },
};
