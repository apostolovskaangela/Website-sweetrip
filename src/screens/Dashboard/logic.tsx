import { dashboardApi } from "@/src/services/api";
import { useEffect, useState } from "react";

export const useDashboardLogic = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
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
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    stats,
    recentTrips,
    vehicles,
    loading,
  };
};
