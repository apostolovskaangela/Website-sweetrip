import { DashboardTrip } from "@/src/navigation/types";

export enum TripStatus {
  NOT_STARTED = "not_started",
  IN_PROCESS = "in_process",
  STARTED = "started",
  COMPLETED = "completed",
}

export const TripStatusLabel: Record<TripStatus, string> = {
  [TripStatus.NOT_STARTED]: "Not Started",
  [TripStatus.IN_PROCESS]: "In Process",
  [TripStatus.STARTED]: "Started",
  [TripStatus.COMPLETED]: "Completed",
};

export interface TripsListState {
  trips: DashboardTrip[];
  canCreate: boolean;
  loading: boolean;
  error?: string;
}