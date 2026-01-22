export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
};

export type MainDrawerParamList = {
  Dashboard: undefined;
  Trips: undefined;
  Vehicles: undefined;
  LiveTracking: undefined;
};

export type TripsStackParamList = {
  TripsList: undefined;
  TripDetails: { id: number };
  TripCreate: undefined;
  TripEdit: { id: number };
};

export interface Vehicle {
  id: number
  registration_number: string
  notes?: string
  is_active: boolean
  manager_id?: number
}

export interface DashboardStats {
  active_trips: number;
  total_vehicles: number;
  distance_today: number;
  efficiency: number;
  total_trips_last_month: number;
  completed_trips_last_month: number;
}

export interface DashboardTrip {
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
  } | null;
  vehicle?: {
    id: number;
    registration_number: string;
  } | null;
}

export interface DashboardVehicle {
  id: number;
  registration_number: string;
  is_active: boolean;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recent_trips: DashboardTrip[];
  vehicles: DashboardVehicle[];
}
