import { queryKeys } from "@/src/lib/queryKeys";
import { tripsApi } from "@/src/services/api";
import { useQuery } from "@tanstack/react-query";

export function useTripCreateDataQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.trips.createData(),
    queryFn: () => tripsApi.getCreateData(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
