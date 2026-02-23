import { queryKeys } from "@/src/lib/queryKeys";
import { usersApi } from "@/src/services/api/users";
import { useQuery } from "@tanstack/react-query";

export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => usersApi.list(),
    staleTime: 60 * 1000,
  });
}

