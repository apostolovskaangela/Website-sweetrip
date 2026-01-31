import { IRoleHandler } from "./IRoleHandler";
import { AdminRoleHandler } from "./handlers/AdminRoleHandler";
import { ManagerRoleHandler } from "./handlers/ManagerRoleHandler";
import { DriverRoleHandler } from "./handlers/DriverRoleHandler";
import { DefaultRoleHandler } from "./handlers/DefaultRoleHandler";
import { CEORoleHandler } from "./handlers/CEORoleHandler";

/**
 * Factory class for creating role handlers
 * Implements the Factory Pattern to create appropriate role handlers based on user roles
 */
export class RoleFactory {
  private static handlers: Map<string, IRoleHandler> = new Map();

  /**
   * Get role handler for a specific role
   * @param role - The role name (e.g., "admin", "manager", "driver")
   * @returns The appropriate role handler instance
   */
  static getRoleHandler(role: string): IRoleHandler {
    // Use singleton pattern for handlers
    if (!this.handlers.has(role)) {
      switch (role.toLowerCase()) {
        case "admin":
          this.handlers.set(role, new AdminRoleHandler());
          break;
        case "manager":
          this.handlers.set(role, new ManagerRoleHandler());
          break;
        case "driver":
          this.handlers.set(role, new DriverRoleHandler());
          break;
        case "ceo":
          this.handlers.set(role, new CEORoleHandler());
          break;
        default:
          // Return a default handler with no permissions for unknown roles
          this.handlers.set(role, new DefaultRoleHandler(role));
      }
    }
    return this.handlers.get(role)!;
  }

  /**
   * Get combined role handler for a user with multiple roles
   * Returns a handler that combines permissions from all roles
   * @param roles - Array of role names
   * @returns Combined role handler
   */
  static getCombinedRoleHandler(roles: string[]): IRoleHandler {
    if (!roles || roles.length === 0) {
      throw new Error("No roles provided");
    }

    const handlers = roles.map(role => this.getRoleHandler(role));

    return {
      canCreateTrip: () => handlers.some(h => h.canCreateTrip()),
      canEditTrip: () => handlers.some(h => h.canEditTrip()),
      canUpdateTripStatus: (userId: string | number, tripDriverId?: string | number) =>
        handlers.some(h => h.canUpdateTripStatus(userId, tripDriverId)),
      canDeleteTrip: () => handlers.some(h => h.canDeleteTrip()),
      canViewAllTrips: () => handlers.some(h => h.canViewAllTrips()),
      canViewVehicles: () => handlers.some(h => h.canViewVehicles()),
      getRoleName: () => roles.join(", "),
    };
  }

  /**
   * Create a role handler from user object
   * @param user - User object with roles array
   * @returns Combined role handler for the user
   */
  static createFromUser(user: { roles?: string[] }): IRoleHandler | null {
    if (!user?.roles || user.roles.length === 0) {
      return null;
    }
    return this.getCombinedRoleHandler(user.roles);
  }
}
