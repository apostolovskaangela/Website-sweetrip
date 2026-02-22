import type { NavigatorScreenParams } from "@react-navigation/native";
import { VehiclesStackParamList } from "./VehiclesNavigator";

export type TripsStackParamList = {
  TripsList: undefined;
  TripDetails: { id: number };
  TripCreate: undefined;
  TripEdit: { id: number };
};

export type MainDrawerParamList = {
  Dashboard: undefined;
  Trips: { screen?: keyof TripsStackParamList; params?: any } | undefined;
  Vehicles: { screen?: keyof VehiclesStackParamList; params?: any } | undefined;
  // LiveTracking: undefined;
  OfflineQueue: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  /**
   * The authenticated area (Drawer navigator).
   * Use nested params when navigating into Drawer screens.
   */
  Dashboard: NavigatorScreenParams<MainDrawerParamList> | undefined;
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
