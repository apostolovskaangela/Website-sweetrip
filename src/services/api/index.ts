export { authApi } from "./auth";
export type { LoginRequest, LoginResponse } from "./auth";
export type { User as AuthUser } from "./auth";

export { dashboardApi } from "./dashboard";
export type {
  DashboardResponse,
  DriverDashboardResponse,
  DashboardStats,
  Trip as DashboardTrip,
  Vehicle as DashboardVehicle,
} from "./dashboard";

export { tripsApi } from "./trips";
export type {
  Trip,
  TripsListResponse,
  TripResponse,
  CreateTripRequest,
  UpdateTripRequest,
  CreateTripResponse,
  TripCreateDataResponse,
  UpdateStatusRequest,
  UpdateStatusResponse,
} from "./trips";

export { usersApi } from "./users";
export type { User as UserRecord, UsersListResponse, CreateUserRequest, UpdateUserRequest } from "./users";

export { vehiclesApi } from "./vehicles";
export type { Vehicle as VehicleRecord } from "./vehicles";


