// TypeScript Models for React Native SQLite Database

export interface User {
  id: number;
  name: string;
  email: string;
  manager_id?: number;
  role_id: number;
  email_verified_at?: string;
  password: string;
  remember_token?: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: number;
  registration_number?: string;
  notes?: string;
  is_active: boolean;
  manager_id: number;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: number;
  trip_number: string;
  vehicle_id: number;
  driver_id: number;
  a_code?: string;
  destination_from: string;
  destination_to: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  mileage?: number;
  cmr?: string;
  driver_description?: string;
  admin_description?: string;
  trip_date: string;
  invoice_number?: string;
  amount?: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface TripStop {
  id: number;
  trip_id: number;
  destination: string;
  stop_order: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

// DTO Interfaces for API responses and requests
export interface TripWithRelations extends Trip {
  driver?: User;
  vehicle?: Vehicle;
  stops?: TripStop[];
  creator?: User;
}

export interface VehicleWithRelations extends Vehicle {
  manager?: User;
  trips?: Trip[];
}

export interface UserWithRelations extends User {
  manager?: User;
  drivers?: User[];
}
