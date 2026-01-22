import { RoleFactory } from "@/src/roles";
import { authApi, tripsApi } from "@/src/services/api";
import { testConnection } from "@/src/utils/testConnection";
import { useEffect, useState } from "react";

export function useTripsListLogic() {
  const [trips, setTrips] = useState<any[]>([]);
  const [canCreate, setCanCreate] = useState(false);

  useEffect(() => {
    // Test connection first (optional, for debugging)
    if (__DEV__) {
      testConnection().then((isReachable) => {
        if (!isReachable) {
          console.warn('⚠️ Backend server appears to be unreachable');
        }
      });
    }
    
    loadTrips();
    loadUser();
  }, []);

  const loadTrips = async () => {
    try {
      const response = await tripsApi.list();
      setTrips(response.trips || []);
    } catch (error: any) {
      console.error("Error loading trips:", error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('Network error - check API configuration in src/config/api.ts');
      }
      setTrips([]);
    }
  };

  const loadUser = async () => {
    try {
      const user = await authApi.getUser();
      // Use RoleFactory to check permissions
      const roleHandler = RoleFactory.createFromUser(user);
      setCanCreate(roleHandler?.canCreateTrip() ?? false);
    } catch (error: any) {
      console.error("Error loading user:", error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('Network error - check API configuration in src/config/api.ts');
      }
      setCanCreate(false);
    }
  };

  return { trips, canCreate };
}
