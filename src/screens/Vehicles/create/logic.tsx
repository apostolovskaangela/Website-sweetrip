import { useState } from "react";

import { NotificationManager } from "@/src/services/NotificationManager";
import { useVehicleMutations } from "@/src/hooks/queries";
import { VehicleCreateRequest } from "../types";

export function useCreateVehicle() {
  const { createVehicle } = useVehicleMutations();
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!registrationNumber.trim()) {
      setError("Registration number is required");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const payload: VehicleCreateRequest = {
      registration_number: registrationNumber.trim(),
      notes: notes.trim() || undefined,
      is_active: isActive,
    };

    try {
      const newVehicle = await createVehicle(payload);

      // Notify assigned driver if any
      if (newVehicle.driver_id != null) {
        NotificationManager.getInstance().notifyDriver(
          newVehicle.driver_id,
          `A new vehicle (${newVehicle.registration_number}) has been assigned to you.`
        );
      }

      setRegistrationNumber("");
      setNotes("");
      setIsActive(true);

      return newVehicle;
    } catch (err: any) {
      console.error("Create Vehicle error", err);
      setError("Failed to create vehicle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    registrationNumber,
    setRegistrationNumber,
    notes,
    setNotes,
    isActive,
    setIsActive,
    submit,
    loading,
    error,
  };
}
