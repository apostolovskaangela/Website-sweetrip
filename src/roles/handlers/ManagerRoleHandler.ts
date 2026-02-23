import { BaseRoleHandler } from "./BaseRoleHandler";

/**
 * Manager role handler
 * Managers have similar permissions to admins but may have some restrictions
 */
export class ManagerRoleHandler extends BaseRoleHandler {
  constructor() {
    super("manager");
  }

  canCreateTrip(): boolean {
    return true;
  }

  canEditTrip(): boolean {
    return true;
  }

  canUpdateTripStatus(userId: string | number, tripDriverId?: string | number): boolean {
    // Managers can update any trip status
    return false;
  }

  canDeleteTrip(): boolean {
    return true;
  }

  canViewAllTrips(): boolean {
    return true;
  }

  canViewVehicles(): boolean {
    return true;
  }

  canViewTripFinancials(): boolean {
    return true;
  }

  canViewTripNotes(): boolean {
    return true;
  }

  canViewTripMileage(): boolean {
    return true;
  }
}
