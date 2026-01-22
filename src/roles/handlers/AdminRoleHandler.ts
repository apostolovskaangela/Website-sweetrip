import { BaseRoleHandler } from "./BaseRoleHandler";

/**
 * Admin role handler
 * Admins have full access to all features
 */
export class AdminRoleHandler extends BaseRoleHandler {
  constructor() {
    super("admin");
  }

  canCreateTrip(): boolean {
    return true;
  }

  canEditTrip(): boolean {
    return true;
  }

  canUpdateTripStatus(userId: string | number, tripDriverId?: string | number): boolean {
    // Admins can update any trip status
    return true;
  }

  canDeleteTrip(): boolean {
    return true;
  }

  canViewAllTrips(): boolean {
    return true;
  }
}
