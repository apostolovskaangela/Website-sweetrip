import { BaseRoleHandler } from "./BaseRoleHandler";

/**
 * CEO role handler
 * CEOs have full access to all features
 */
export class CEORoleHandler extends BaseRoleHandler {
  constructor() {
    super("ceo");
  }

  canCreateTrip(): boolean {
    return false;
  }

  canEditTrip(): boolean {
    return false;
  }

  canUpdateTripStatus(userId: string | number, tripDriverId?: string | number): boolean {
    // CEOs can update any trip status
    return false;
  }

  canDeleteTrip(): boolean {
    return true;
  }

  canViewAllTrips(): boolean {
    return true;
  }
}
