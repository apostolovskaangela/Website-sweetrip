import { BaseRoleHandler } from "./BaseRoleHandler";

/**
 * Driver role handler
 * Drivers have limited permissions - can only update their own trips
 */
export class DriverRoleHandler extends BaseRoleHandler {
  constructor() {
    super("driver");
  }

  canCreateTrip(): boolean {
    return false;
  }

  canEditTrip(): boolean {
    return false;
  }

  canUpdateTripStatus(userId: string | number, tripDriverId?: string | number): boolean {
    // Drivers can only update status of trips assigned to them
    // Handle type coercion for comparison (string vs number)
    if (tripDriverId === undefined || tripDriverId === null) {
      return false;
    }
    return String(userId) === String(tripDriverId) || Number(userId) === Number(tripDriverId);
  }

  canDeleteTrip(): boolean {
    return false;
  }

  canViewAllTrips(): boolean {
    return false;
  }

  canViewTripMileage(): boolean {
    // Safe for drivers to see their own trip mileage
    return true;
  }
}
