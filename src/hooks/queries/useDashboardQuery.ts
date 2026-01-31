import { queryKeys } from "@/src/lib/queryKeys";
import { dashboardApi } from "@/src/services/api";
import { useQuery } from "@tanstack/react-query";

export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.main(),
    queryFn: () => dashboardApi.getDashboard(),
    staleTime: 60 * 1000,
  });
}
