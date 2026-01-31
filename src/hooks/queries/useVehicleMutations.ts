import { queryKeys } from "@/src/lib/queryKeys";
import { vehiclesApi } from "@/src/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useVehicleMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof vehiclesApi.create>[0]) =>
      vehiclesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.main() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof vehiclesApi.update>[1];
    }) => vehiclesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.main() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehiclesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.main() });
    },
  });

  return {
    createVehicle: createMutation.mutateAsync,
    createVehicleMutation: createMutation,
    updateVehicle: updateMutation.mutateAsync,
    updateVehicleMutation: updateMutation,
    deleteVehicle: deleteMutation.mutateAsync,
    deleteVehicleMutation: deleteMutation,
  };
}
