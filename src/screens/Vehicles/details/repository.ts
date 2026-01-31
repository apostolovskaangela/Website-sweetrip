import { vehiclesApi } from "@/src/services/api";
import { Vehicle } from "../types";

export class VehicleRepository {
  async getById(id: number): Promise<Vehicle> {
    try {
      const data = await vehiclesApi.get(id);
      return data;
    } catch (err) {
      console.error(`Failed to fetch vehicle ${id}`, err);
      throw new Error("Unable to load vehicle details.");
    }
  }
}
