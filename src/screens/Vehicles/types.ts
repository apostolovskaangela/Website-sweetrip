export interface VehicleCreateRequest {
    registration_number: string;
    notes?: string;
    is_active: boolean;
}

export interface Vehicle {
    id: number;
    registration_number: string;
    notes?: string;
    is_active: boolean;
    driver_id?: number;
}
