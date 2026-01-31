import { queryKeys } from "@/src/lib/queryKeys";
import { RoleFactory } from "@/src/roles";
import { authApi } from "@/src/services/api";
import { useQuery } from "@tanstack/react-query";

export function useUserPermissionsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.user.permissions(),
    queryFn: async () => {
      const user = await authApi.getUser();
      const roleHandler = RoleFactory.createFromUser(user);
      return {
        user,
        canCreateTrip: roleHandler?.canCreateTrip() ?? false,
      };
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
