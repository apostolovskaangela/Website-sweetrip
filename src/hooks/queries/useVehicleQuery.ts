import { queryKeys } from "@/src/lib/queryKeys";
import { vehiclesApi } from "@/src/services/api";
import { useQuery } from "@tanstack/react-query";

export function useVehicleQuery(id: number | null) {
  return useQuery({
    queryKey: queryKeys.vehicles.detail(id ?? 0),
    queryFn: () => vehiclesApi.get(id!),
    enabled: id != null && id > 0,
    staleTime: 60 * 1000,
  });
}
