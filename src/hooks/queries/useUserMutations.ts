import { queryKeys } from "@/src/lib/queryKeys";
import { usersApi } from "@/src/services/api/users";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUserMutations() {
  const queryClient = useQueryClient();

  const createDriverMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      usersApi.create({ ...data, role: "driver" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.main() });
    },
  });

  return {
    createDriver: createDriverMutation.mutateAsync,
    createDriverMutation,
    deleteUser: deleteMutation.mutateAsync,
    deleteUserMutation: deleteMutation,
  };
}

