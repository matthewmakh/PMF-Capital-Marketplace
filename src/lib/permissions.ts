import { UserRole } from "@prisma/client";
import { ADMIN_ROLES, INVESTOR_ROLES, UNDERWRITER_ROLES } from "./constants";

export function isAdmin(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === UserRole.SUPER_SUPER_ADMIN || role === UserRole.SUPER_ADMIN;
}

export function isSuperSuperAdmin(role: UserRole): boolean {
  return role === UserRole.SUPER_SUPER_ADMIN;
}

export function canInvest(role: UserRole): boolean {
  return INVESTOR_ROLES.includes(role);
}

export function canViewAdminArea(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function canManageUsers(role: UserRole): boolean {
  return role === UserRole.SUPER_SUPER_ADMIN || role === UserRole.SUPER_ADMIN;
}

export function canApprovPayouts(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function canUnderwrite(role: UserRole): boolean {
  return UNDERWRITER_ROLES.includes(role);
}

/**
 * Returns the Prisma WHERE clause for user queries.
 * SUPER_SUPER_ADMIN can see all users including hidden ones.
 * Everyone else only sees non-hidden users.
 */
export function getUserWhereClause(currentUserRole: UserRole) {
  if (currentUserRole === UserRole.SUPER_SUPER_ADMIN) {
    return {};
  }
  return { isHidden: false };
}

/**
 * Returns the Prisma WHERE clause for audit log queries.
 * SUPER_SUPER_ADMIN can see all audit logs.
 * Others cannot see logs from hidden actors.
 */
export function getAuditWhereClause(currentUserRole: UserRole) {
  if (currentUserRole === UserRole.SUPER_SUPER_ADMIN) {
    return {};
  }
  return {
    OR: [
      { actor: { isHidden: false } },
      { actorId: null },
    ],
  };
}

/**
 * Roles available in dropdowns (never show SUPER_SUPER_ADMIN).
 */
export function getAssignableRoles(currentUserRole: UserRole): UserRole[] {
  const roles: UserRole[] = [UserRole.SYNDICATE_REP, UserRole.READ_ONLY, UserRole.UNDERWRITER];
  if (currentUserRole === UserRole.SUPER_SUPER_ADMIN) {
    roles.push(UserRole.ADMIN, UserRole.SUPER_ADMIN);
  } else if (currentUserRole === UserRole.SUPER_ADMIN) {
    roles.push(UserRole.ADMIN);
  }
  return roles;
}
