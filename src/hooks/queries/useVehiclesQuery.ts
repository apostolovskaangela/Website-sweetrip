import { queryKeys } from "@/src/lib/queryKeys";
import { vehiclesApi } from "@/src/services/api";
import { useQuery } from "@tanstack/react-query";

export function useVehiclesQuery() {
  return useQuery({
    queryKey: queryKeys.vehicles.list(),
    queryFn: () => vehiclesApi.list(),
    staleTime: 60 * 1000,
  });
}
