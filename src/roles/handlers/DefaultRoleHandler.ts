import { BaseRoleHandler } from "./BaseRoleHandler";

/**
 * Default role handler for unknown or unassigned roles
 * Provides no permissions by default
 */
export class DefaultRoleHandler extends BaseRoleHandler {
  constructor(roleName: string = "default") {
    super(roleName);
  }
}
