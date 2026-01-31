import { queryKeys } from "@/src/lib/queryKeys";
import { tripsApi } from "@/src/services/api";
import { useQuery } from "@tanstack/react-query";

export function useTripsQuery() {
  return useQuery({
    queryKey: queryKeys.trips.list(),
    queryFn: async () => {
      const response = await tripsApi.list();
      return response.trips ?? [];
    },
    staleTime: 60 * 1000,
  });
}
