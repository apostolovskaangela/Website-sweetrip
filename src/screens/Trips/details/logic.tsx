import { RoleFactory } from "@/src/roles";
import { authApi, tripsApi } from "@/src/services/api";
import { pickCMRImage } from "@/src/utils/imagePicker";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

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

  // 🔥 reload EVERY time screen becomes active
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const updateStatus = async (
    status: "not_started" | "in_process" | "started" | "completed"
  ) => {
    try {
      // If status is "completed", require CMR upload
      if (status === "completed") {
        // First, get the CMR image
        const imageResult = await pickCMRImage();
        
        if (!imageResult) {
          // User cancelled image selection
          throw new Error("CMR image is required to complete the trip");
        }

        // Upload CMR first
        try {
          if (__DEV__) {
            console.log('📸 Uploading CMR image:', {
              tripId: id,
              filename: imageResult.name,
              type: imageResult.type,
              uri: imageResult.uri,
              fileObject: imageResult.file,
            });
          }

          const cmrResponse = await tripsApi.uploadCMR(id, imageResult.file);
          
          if (__DEV__) {
            console.log('✅ CMR upload response:', {
              trip: cmrResponse.trip,
              cmr: cmrResponse.trip?.cmr,
              cmr_url: cmrResponse.trip?.cmr_url,
            });
          }

          // Verify CMR was uploaded by checking the response
          const uploadedTrip = cmrResponse.trip;
          if (!uploadedTrip.cmr && !uploadedTrip.cmr_url) {
            // If response doesn't show CMR, reload and check again
            await load();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const verifiedTrip = await tripsApi.get(id);
            if (!verifiedTrip.cmr && !verifiedTrip.cmr_url) {
              throw new Error("CMR upload verification failed. The image may not have been saved correctly.");
            }
            
            if (__DEV__) {
              console.log('✅ CMR verified after reload:', {
                cmr: verifiedTrip.cmr,
                cmr_url: verifiedTrip.cmr_url,
              });
            }
          } else {
            if (__DEV__) {
              console.log('✅ CMR confirmed in upload response');
            }
          }
        } catch (cmrError: any) {
          console.error("Error uploading CMR:", cmrError);
          
          // Provide more detailed error message
          let errorMessage = "Failed to upload CMR image.";
          
          if (cmrError.response?.data?.message) {
            errorMessage = cmrError.response.data.message;
          } else if (cmrError.response?.data?.errors?.cmr?.[0]) {
            errorMessage = cmrError.response.data.errors.cmr[0];
          } else if (cmrError.message) {
            errorMessage = cmrError.message;
          }
          
          throw new Error(errorMessage);
        }
      }

      // Update status
      await tripsApi.updateStatus(id, { status });
      load(); // instant update
    } catch (error: any) {
      console.error("Error updating trip status:", error);
      
      // Enhanced error logging for network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
        console.error("❌ Network Error - Request failed to reach server");
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          request: error.config?.url,
          method: error.config?.method,
        });
        
        // Provide user-friendly error message
        // const networkError = new Error(
        //   "Network error. Please check your internet connection and try again."
        // );
        // networkError.name = "NetworkError";
        // throw networkError;
      }
      
      // Log detailed error information for debugging
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", JSON.stringify(error.response.data, null, 2));
        
        // Extract validation errors if present
        if (error.response.data?.errors) {
          const errors = error.response.data.errors;
          console.error("Validation errors:", errors);
        }
        
        if (error.response.data?.message) {
          console.error("Error message:", error.response.data.message);
        }
      }
      
      // Re-throw to let the UI handle it
      throw error;
    }
  };

  // Use RoleFactory to get role handler
  const roleHandler = user ? RoleFactory.createFromUser(user) : null;

  // Check if driver can update (with better logging for debugging)
  const canDriverUpdate = roleHandler?.canUpdateTripStatus(user?.id, trip?.driver?.id) ?? false;
  
  if (__DEV__ && user && trip) {
    console.log('🔍 Driver update permission check:', {
      userId: user.id,
      userRoles: user.roles,
      tripDriverId: trip.driver?.id,
      canUpdate: canDriverUpdate,
      roleHandler: roleHandler?.getRoleName(),
    });
  }

  return {
    trip,
    canEdit: roleHandler?.canEditTrip() ?? false,
    canDriverUpdate,
    updateStatus,
  };
}
