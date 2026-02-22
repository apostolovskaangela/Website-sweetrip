// TypeScript Models for React Native SQLite Database

export interface User {
  id: number;
  name: string;
  email: string;
  managerId?: number;
  roleId: number;
  emailVerifiedAt?: string;
  password: string;
  rememberToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: number;
  registrationNumber?: string;
  notes?: string;
  isActive: boolean;
  managerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: number;
  tripNumber: string;
  vehicleId: number;
  driverId: number;
  aCode?: string;
  destinationFrom: string;
  destinationTo: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  mileage?: number;
  cmr?: string;
  driverDescription?: string;
  adminDescription?: string;
  tripDate: string;
  invoiceNumber?: string;
  amount?: number;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TripStop {
  id: number;
  tripId: number;
  destination: string;
  stopOrder: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  guardName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  name: string;
  guardName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModelHasRole {
  roleId: number;
  modelType: string;
  modelId: number;
}

export interface ModelHasPermission {
  permissionId: number;
  modelType: string;
  modelId: number;
}

export interface RoleHasPermission {
  permissionId: number;
  roleId: number;
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
  assignedTrips?: Trip[];
  createdTrips?: Trip[];
}
