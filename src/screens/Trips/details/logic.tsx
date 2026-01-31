import { RoleFactory } from "@/src/roles";
import { authApi, tripsApi } from "@/src/services/api";
import { pickCMRImage } from "@/src/utils/imagePicker";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { TripStatus } from "../types";

export function useTripDetailsLogic(id: number) {
  const [trip, setTrip] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      const [tripData, userData] = await Promise.all([
        tripsApi.get(id),
        authApi.getUser(),
      ]);
      setTrip(tripData);
      setUser(userData);
    } catch (error) {
      console.error("Error loading trip details:", error);
    }
  }, [id]);

  // Reload every time screen is focused
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const updateStatus = async (status: TripStatus) => {
    try {
      if (status === TripStatus.COMPLETED) {
        const imageResult = await pickCMRImage();
        if (!imageResult) throw new Error("CMR image is required to complete the trip");

        // Upload CMR
        const cmrResponse = await tripsApi.uploadCMR(id, imageResult.file);
        const uploadedTrip = cmrResponse.trip;

        if (!uploadedTrip.cmr && !uploadedTrip.cmr_url) {
          await load();
          const verifiedTrip = await tripsApi.get(id);
          if (!verifiedTrip.cmr && !verifiedTrip.cmr_url)
            throw new Error("CMR upload verification failed");
        }
      }

      await tripsApi.updateStatus(id, { status });
      load();
    } catch (error: any) {
      console.error("Error updating trip status:", error);
      if (error.response) console.error("Response data:", error.response.data);
      throw error;
    }
  };

  const roleHandler = user ? RoleFactory.createFromUser(user) : null;
  const canDriverUpdate = roleHandler?.canUpdateTripStatus(user?.id, trip?.driver?.id) ?? false;

  return {
    trip,
    canEdit: roleHandler?.canEditTrip() ?? false,
    canDriverUpdate,
    updateStatus,
  };
}
