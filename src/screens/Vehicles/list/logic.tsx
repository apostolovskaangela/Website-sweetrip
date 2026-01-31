// src/screens/Vehicles/list/logic.tsx
import { useVehiclesQuery } from "@/src/hooks/queries";

export function useVehicles() {
  const query = useVehiclesQuery();
  return {
    vehicles: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? "Failed to load vehicles. Please try again." : null,
    reload: query.refetch,
  };
}
