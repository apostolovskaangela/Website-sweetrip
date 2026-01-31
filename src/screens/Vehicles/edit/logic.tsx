import { useEffect, useState, useCallback, useMemo } from "react";
import { NotificationManager } from "@/src/services/NotificationManager";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { VehiclesStackParamList } from "@/src/navigation/VehiclesNavigator";
import { VehicleForm, VehicleRepository } from "./repository";

interface UseEditVehicleProps {
  id: number;
  navigation: NativeStackNavigationProp<VehiclesStackParamList, "VehicleEdit">;
}

export function useEditVehicle({ id, navigation }: UseEditVehicleProps) {
  // Memoize repository so its reference is stable across renders
  const repo = useMemo(() => new VehicleRepository(), []);

  const [form, setForm] = useState<VehicleForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicle
  const loadVehicle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const vehicle = await repo.getById(id);
      setForm(vehicle);
    } catch (err: any) {
      console.error("Vehicle fetch error:", err);
      setError("Failed to load vehicle.");
    } finally {
      setLoading(false);
    }
  }, [id, repo]); // now repo is stable

  useEffect(() => {
    loadVehicle();
  }, [loadVehicle]);

  const setField = <K extends keyof VehicleForm>(key: K, value: VehicleForm[K]) => {
    if (!form) return;
    setForm({ ...form, [key]: value });
  };

  const validate = (): boolean => {
    if (!form) return false;
    if (!form.registration_number.trim()) {
      setError("Registration number is required.");
      return false;
    }
    return true;
  };

  const update = async () => {
    if (!form) return;
    if (!validate()) return;

    setLoading(true);
    setError(null);
    try {
      const updated = await repo.update(id, form);

      if (updated.driver_id) {
        NotificationManager.getInstance().notifyDriver(
          updated.driver_id,
          `Vehicle (${updated.registration_number}) details have been updated.`
        );
      }

      navigation.goBack();
    } catch (err: any) {
      console.error("Update vehicle error:", err);
      setError("Failed to update vehicle.");
    } finally {
      setLoading(false);
    }
  };

  return { form, setField, update, loading, error, reload: loadVehicle };
}
