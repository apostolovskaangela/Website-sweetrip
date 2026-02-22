import { queryKeys } from "@/src/lib/queryKeys";
import {
  CreateTripRequest,
  Trip,
  tripsApi,
  UpdateTripRequest,
} from "@/src/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type TripStatus = "not_started" | "in_process" | "started" | "completed";

export function useTripMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateTripRequest) => tripsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.main() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTripRequest }) =>
      tripsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.trips.detail(id) });
      const previous = queryClient.getQueryData<Trip>(
        queryKeys.trips.detail(id)
      );
      queryClient.setQueryData<Trip>(queryKeys.trips.detail(id), (old) => {
        if (!old) return old as any;
        // Avoid optimistic-overwriting nested arrays with a different shape (e.g. stops without ids).
        // The server/local-api response will reconcile the full structure.
        const { stops: _stops, ...rest } = data as any;
        return { ...old, ...rest } as Trip;
      });
      return { previous };
    },
    onError: (_err, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.trips.detail(id),
          context.previous
        );
      }
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.main() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tripsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.trips.lists() });
      const previous = queryClient.getQueryData(queryKeys.trips.list());
      queryClient.setQueryData(queryKeys.trips.list(), (old: Trip[] | undefined) =>
        old ? old.filter((t) => t.id !== id) : []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous != null) {
        queryClient.setQueryData(queryKeys.trips.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.main() });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: { status: TripStatus };
    }) => tripsApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.main() });
    },
  });

  return {
    createTrip: createMutation.mutateAsync,
    createTripMutation: createMutation,
    updateTrip: updateMutation.mutateAsync,
    updateTripMutation: updateMutation,
    deleteTrip: deleteMutation.mutateAsync,
    deleteTripMutation: deleteMutation,
    updateTripStatus: updateStatusMutation.mutateAsync,
    updateTripStatusMutation: updateStatusMutation,
  };
}
