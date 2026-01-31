import { dashboardApi, Trip, Vehicle } from "@/src/services/api";
import { useCallback, useEffect, useState } from "react";

interface DashboardStats {
  active_trips: number;
  total_vehicles: number;
  distance_today: number;
  efficiency: number;
}


export const useDashboardLogic = () => {
  const [stats, setStats] = useState<DashboardStats>({
    active_trips: 0,
    total_vehicles: 0,
    distance_today: 0,
    efficiency: 0,
  });
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getDashboard();

      setStats(data.stats);
      setRecentTrips(data.recent_trips);
      setVehicles(data.vehicles);
    } catch (e) {
      console.error("Dashboard API failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    stats,
    recentTrips,
    vehicles,
    loading,
  };
};
