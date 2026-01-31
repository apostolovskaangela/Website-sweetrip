// src/repositories/VehicleRepository.ts
import { vehiclesApi } from "@/src/services/api";
import { Vehicle } from "../types";

export class VehicleRepository {
  async list(): Promise<Vehicle[]> {
    try {
      const data = await vehiclesApi.list();
      return data;
    } catch (err) {
      console.error("VehicleRepository.list error:", err);
      throw err;
    }
  }

  async get(id: number): Promise<Vehicle> {
    try {
      return await vehiclesApi.get(id);
    } catch (err) {
      console.error("VehicleRepository.get error:", err);
      throw err;
    }
  }
}
