/**
 * Interface for role handlers
 * Defines the contract for all role-based permission checks
 */
export interface IRoleHandler {
  /**
   * Check if the role can create trips
   */
  canCreateTrip(): boolean;

  /**
   * Check if the role can edit trips
   */
  canEditTrip(): boolean;

  /**
   * Check if the role can update trip status
   * @param userId - The user ID to check
   * @param tripDriverId - The trip driver ID to compare
   */
  canUpdateTripStatus(userId: string | number, tripDriverId?: string | number): boolean;

  /**
   * Check if the role can delete trips
   */
  canDeleteTrip(): boolean;

  /**
   * Check if the role can view all trips
   */
  canViewAllTrips(): boolean;

  canViewVehicles(): boolean;

  /**
   * Financial fields like invoice/amount should be restricted to non-drivers.
   */
  canViewTripFinancials(): boolean;
  canViewTripNotes(): boolean;
  canViewTripMileage(): boolean;

  
  /**
   * Get the role name
   */
  getRoleName(): string;
}
