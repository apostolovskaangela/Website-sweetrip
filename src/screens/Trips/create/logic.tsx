import { useTripMutations } from "@/src/hooks/queries";
import { tripsApi } from "@/src/services/api";
import { NotificationManager } from "@/src/services/NotificationManager";
import { useEffect, useState } from "react";

export type CreateTripForm = {
  trip_number: string;
  destination_from: string;
  destination_to: string;

  vehicle_id: number;
  driver_id: number;

  a_code?: string;
  mileage?: number;

  driver_description?: string;
  admin_description?: string;

  invoice_number?: string;
  amount?: number;

  trip_date: string;
  status: "not_started" | "started" | "in_process" | "completed";
};

export function useTripCreateLogic() {
  const { createTrip } = useTripMutations();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const [form, setForm] = useState<CreateTripForm>({
    trip_number: "",
    destination_from: "",
    destination_to: "",
    vehicle_id: 0,
    driver_id: 0,

    a_code: "",
    mileage: undefined,
    driver_description: "",
    admin_description: "",
    invoice_number: "",
    amount: undefined,

    trip_date: new Date().toISOString().split("T")[0],
    status: "not_started",
  });

  useEffect(() => {
    loadCreateData();
  }, []);

  const loadCreateData = async () => {
    try {
      const data = await tripsApi.getCreateData();
      setDrivers(data.drivers);
      setVehicles(data.vehicles);
    } catch (error) {
      console.error("Error loading create trip data:", error);
    }
  };

  // Strongly-typed setter
  const setField = <K extends keyof CreateTripForm>(key: K, value: CreateTripForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  // Submit form
  const submit = async (): Promise<CreateTripForm | null> => {
    if (!form.vehicle_id || !form.driver_id) {
      console.warn("Driver and vehicle are required");
      return null;
    }

    try {
      const response = await createTrip({
        ...form,
        vehicle_id: Number(form.vehicle_id),
        driver_id: Number(form.driver_id),
        mileage: form.mileage ? Number(form.mileage) : undefined,
        amount: form.amount ? Number(form.amount) : undefined,
      });

      // Notify driver
      const managerName = "Manager/Admin"; // replace with auth if available
      const message = `${managerName} assigned you a new trip #${form.trip_number}`;
      NotificationManager.getInstance().notifyDriver(form.driver_id, message);

      // Return the created trip
      return {
        trip_number: response.trip.trip_number,
        destination_from: response.trip.destination_from,
        destination_to: response.trip.destination_to,
        vehicle_id: response.trip.vehicle?.id || 0,
        driver_id: response.trip.driver?.id || 0,
        a_code: response.trip.a_code,
        mileage: response.trip.mileage,
        driver_description: response.trip.driver_description,
        admin_description: response.trip.admin_description,
        invoice_number: response.trip.invoice_number,
        amount: response.trip.amount,
        trip_date: response.trip.trip_date,
        status: response.trip.status as CreateTripForm["status"],
      };
    } catch (error: any) {
      console.error("Create trip error:", error.response?.data || error.message);
      return null;
    }
  };

  return {
    form,
    setField, 
    submit,
    drivers,
    vehicles,
  };
}
