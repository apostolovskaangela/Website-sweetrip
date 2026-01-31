import { useState, useCallback, useMemo } from "react";
import { VehicleRepository } from "./repository";
import { Vehicle } from "../types";

export function useVehicleDetails(id: number) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Make repo instance stable
  const repo = useMemo(() => new VehicleRepository(), []);

  const loadVehicle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await repo.getById(id);
      setVehicle(data);
    } catch (err: any) {
      setError(err.message || "Error loading vehicle");
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  }, [id, repo]); // now repo is stable, eslint is happy

  return { vehicle, loadVehicle, loading, error };
}

// Since repo is created inside the hook on every render, 
// adding it to the dependency array would make the callback recreate every 
// time anyway, which defeats the purpose of useCallback.