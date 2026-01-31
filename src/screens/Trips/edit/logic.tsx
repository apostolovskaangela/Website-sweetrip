import { tripsApi } from "@/src/services/api";
import { NotificationManager, NotificationObserver } from "@/src/services/NotificationManager";
import { useEffect, useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TripsStackParamList } from "@/src/navigation/types";
import { TripStatus } from "../types";

export type EditTripForm = {
  trip_number: string;
  destination_from: string;
  destination_to: string;
  vehicle_id: number | null;
  driver_id: number | null;
  trip_date: string;
  status: TripStatus;
  availableStatuses: TripStatus[];
  mileage?: number;
  a_code?: string;
  driver_description?: string;
  admin_description?: string;
  invoice_number?: string;
  amount?: number;
};

export function useTripEditLogic(
  id: number,
  navigation: NativeStackNavigationProp<TripsStackParamList, "TripEdit">
) {
  const [form, setForm] = useState<EditTripForm | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        const trip = await tripsApi.get(id);

        // Factory pattern: initialize form with role-specific defaults
        const availableStatuses = Object.values(TripStatus);
        const status: TripStatus =
          TripStatus[trip.status.toUpperCase() as keyof typeof TripStatus] ??
          TripStatus.NOT_STARTED;

        setForm({
          trip_number: trip.trip_number,
          destination_from: trip.destination_from,
          destination_to: trip.destination_to,
          vehicle_id: trip.vehicle?.id ?? null,
          driver_id: trip.driver?.id ?? null,
          trip_date: trip.trip_date,
          status,
          availableStatuses,
          mileage: trip.mileage,
          a_code: trip.a_code,
          driver_description: trip.driver_description,
          admin_description: trip.admin_description,
          invoice_number: trip.invoice_number,
          amount: trip.amount,
        });
      } catch (error) {
        console.error("Failed to load trip:", error);
        alert("Failed to load trip details. Please try again.");
      }
    };

    loadTrip();
  }, [id]);

  const set = <K extends keyof EditTripForm>(key: K, value: EditTripForm[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const submit = async () => {
    if (!form) return;

    // Basic validation
    if (!form.trip_number || !form.destination_from || !form.destination_to) {
      alert("Trip number, from, and to destinations are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await tripsApi.update(id, {
        ...form,
        status: form.status,
        vehicle_id: Number(form.vehicle_id),
        driver_id: Number(form.driver_id),
      });

      // Observer pattern for driver notifications
      const message = `Manager/Admin updated your trip #${form.trip_number}`;
      if (form.driver_id !== null) {
        NotificationManager.getInstance().notifyDriver(form.driver_id, message);
      }
      

      navigation.goBack();
    } catch (error) {
      console.error("Failed to update trip:", error);
      alert("Failed to update trip. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, set, submit, isSubmitting };
}
