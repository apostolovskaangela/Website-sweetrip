import { queryKeys } from "@/src/lib/queryKeys";
import { tripsApi } from "@/src/services/api";
import { useQuery } from "@tanstack/react-query";

export function useTripQuery(id: number | null) {
  return useQuery({
    queryKey: queryKeys.trips.detail(id ?? 0),
    queryFn: () => tripsApi.get(id!),
    enabled: id != null && id > 0,
    staleTime: 30 * 1000,
  });
}
