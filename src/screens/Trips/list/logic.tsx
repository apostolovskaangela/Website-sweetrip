import { useTripsQuery, useUserPermissionsQuery } from "@/src/hooks/queries";

export function useTripsListLogic() {
  const tripsQuery = useTripsQuery();
  const permissionsQuery = useUserPermissionsQuery();

  const trips = tripsQuery.data ?? [];
  const canCreate = permissionsQuery.data?.canCreateTrip ?? false;
  const loading = tripsQuery.isLoading || permissionsQuery.isLoading;
  const error =
    tripsQuery.error != null
      ? "Failed to load trips. Please try again."
      : permissionsQuery.error != null
        ? "Failed to load user permissions."
        : undefined;

  return {
    trips,
    canCreate,
    loading,
    error,
    refetch: () => {
      tripsQuery.refetch();
      permissionsQuery.refetch();
    },
  };
}
