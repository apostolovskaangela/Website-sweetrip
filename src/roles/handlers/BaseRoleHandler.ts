import type { IRoleHandler } from "../IRoleHandler";

/**
 * Base role handler with default implementations
 * Individual role handlers can override specific methods
 */
export abstract class BaseRoleHandler implements IRoleHandler {
  protected roleName: string;

  constructor(roleName: string) {
    this.roleName = roleName;
  }

  canCreateTrip(): boolean {
    return false;
  }

  canEditTrip(): boolean {
    return false;
  }

  canUpdateTripStatus(userId: string | number, tripDriverId?: string | number): boolean {
    return false;
  }

  canDeleteTrip(): boolean {
    return false;
  }

  canViewAllTrips(): boolean {
    return false;
  }

  canViewVehicles(): boolean {
    return false;
  }

  canViewTripFinancials(): boolean {
    return false;
  }

  canViewTripNotes(): boolean {
    return false;
  }

  canViewTripMileage(): boolean {
    return false;
  }

  getRoleName(): string {
    return this.roleName;
  }
}
