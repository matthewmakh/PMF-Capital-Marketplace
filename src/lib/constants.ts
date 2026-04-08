import { DealStatus, UserRole } from "@prisma/client";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_SUPER_ADMIN: "System Administrator",
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SYNDICATE_REP: "Syndicate Rep",
  READ_ONLY: "Executive",
};

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  PENDING_REVIEW: "Pending Review",
  OPEN_FOR_SYNDICATION: "Open for Syndication",
  FULLY_ALLOCATED: "Fully Allocated",
  FUNDED: "Funded",
  ACTIVE_REPAYING: "Active — Repaying",
  DELINQUENT: "Delinquent",
  DEFAULTED: "Defaulted",
  PAID_OFF: "Paid Off",
  CLOSED: "Closed",
};

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
  PENDING_REVIEW: "warning",
  OPEN_FOR_SYNDICATION: "default",
  FULLY_ALLOCATED: "secondary",
  FUNDED: "default",
  ACTIVE_REPAYING: "success",
  DELINQUENT: "warning",
  DEFAULTED: "destructive",
  PAID_OFF: "success",
  CLOSED: "secondary",
};

export const MIN_SYNDICATION = 100;
export const DEFAULT_FACTOR_RATE = 1.35;

// Roles that can access admin area
export const ADMIN_ROLES: UserRole[] = [
  UserRole.SUPER_SUPER_ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
];

// Roles that can invest
export const INVESTOR_ROLES: UserRole[] = [
  UserRole.SUPER_SUPER_ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.SYNDICATE_REP,
];
