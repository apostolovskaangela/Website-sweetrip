import { useDashboardQuery } from "@/src/hooks/queries";
import type { DashboardResponse } from "@/src/services/api";

const defaultStats: DashboardResponse["stats"] = {
  active_trips: 0,
  total_vehicles: 0,
  distance_today: 0,
  efficiency: 0,
  total_trips_last_month: 0,
  completed_trips_last_month: 0,
};

export const useDashboardLogic = () => {
  const { data, isLoading, refetch } = useDashboardQuery();

  const stats = data?.stats ?? defaultStats;
  const recentTrips = data?.recent_trips ?? [];
  const vehicles = data?.vehicles ?? [];

  return {
    stats,
    recentTrips,
    vehicles,
    loading: isLoading,
    refetch,
  };
};
