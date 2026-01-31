// src/repositories/VehicleRepository.ts
import { vehiclesApi } from "@/src/services/api";

export interface VehicleForm {
    id: number;
    registration_number: string;
    notes?: string;
    is_active: boolean;
    driver_id?: number;
}

export class VehicleRepository {
    async getById(id: number): Promise<VehicleForm> {
        const vehicle = await vehiclesApi.get(id);
        return {
            id: vehicle.id,
            registration_number: vehicle.registration_number,
            notes: vehicle.notes,
            is_active: vehicle.is_active,
            driver_id: vehicle.driver_id,
        };
    }

    async update(id: number, data: VehicleForm): Promise<VehicleForm> {
        const updated = await vehiclesApi.update(id, data);
        return {
            id: updated.id,
            registration_number: updated.registration_number,
            notes: updated.notes,
            is_active: updated.is_active,
            driver_id: updated.driver_id,
        };
    }
}
