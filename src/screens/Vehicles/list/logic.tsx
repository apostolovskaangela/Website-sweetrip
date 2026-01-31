// src/screens/Vehicles/list/logic.tsx
import { useState, useEffect, useCallback } from "react";
import { Vehicle } from "../types";
import { VehicleRepository } from "./repository";

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVehicles = useCallback(async () => {
    const repo = new VehicleRepository(); 
    setLoading(true);
    setError(null);
    try {
      const data = await repo.list();
      setVehicles(data);
    } catch (err) {
      setError(`Failed to load vehicles. Please try again. ${err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  return { vehicles, loading, error, reload: loadVehicles };
}
