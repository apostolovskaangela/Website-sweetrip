import { useEffect, useState } from "react";
import { DashboardTrip } from "@/src/navigation/types";
import { authApi, tripsApi } from "@/src/services/api";
import { RoleFactory } from "@/src/roles";
import { testConnection } from "@/src/utils/testConnection";

export function useTripsListLogic() {
  const [trips, setTrips] = useState<DashboardTrip[]>([]);
  const [canCreate, setCanCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const init = async () => {
      if (__DEV__) {
        const reachable = await testConnection();
        if (!reachable) console.warn("⚠️ Backend server appears unreachable");
      }

      await Promise.all([fetchTrips(), fetchUserPermissions()]);
      setLoading(false);
    };

    init();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await tripsApi.list();
      setTrips(response.trips ?? []);
    } catch (err: any) {
      console.error("Error loading trips:", err);
      setTrips([]);
      setError("Failed to load trips. Please try again.");
    }
  };

  const fetchUserPermissions = async () => {
    try {
      const user = await authApi.getUser();
      const roleHandler = RoleFactory.createFromUser(user);
      setCanCreate(roleHandler?.canCreateTrip() ?? false);
    } catch (err: any) {
      console.error("Error loading user:", err);
      setCanCreate(false);
      setError("Failed to load user permissions.");
    }
  };

  return { trips, canCreate, loading, error };
}
