import { vehiclesApi } from "@/src/services/api";
import { Vehicle, VehicleCreateRequest } from "../types";

export class VehicleRepository {
  async create(vehicle: VehicleCreateRequest): Promise<Vehicle> {
    return vehiclesApi.create(vehicle);
  }

  async list(): Promise<Vehicle[]> {
    const response = await vehiclesApi.list();
    return response || [];
  }
}
