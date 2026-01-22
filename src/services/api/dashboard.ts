import axiosClient from "../axiosClient";

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
  status_label: string;
  destination_from: string;
  destination_to: string;
  mileage: number;
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
    const res = await axiosClient.get("/dashboard");
    return res.data;
  },

  getDriverDashboard: async (): Promise<DriverDashboardResponse> => {
    const response = await axiosClient.get<DriverDashboardResponse>("/driver/dashboard");
    return response.data;
  },
};
