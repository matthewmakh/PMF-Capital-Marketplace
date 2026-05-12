import { DealStatus, PaperGrade, UserRole, UwAppStatus, UwDocType } from "@prisma/client";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_SUPER_ADMIN: "System Administrator",
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SYNDICATE_REP: "Syndicate Rep",
  READ_ONLY: "Executive",
  UNDERWRITER: "Underwriter",
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

// Roles that can access the underwriting platform
export const UNDERWRITER_ROLES: UserRole[] = [
  UserRole.SUPER_SUPER_ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.UNDERWRITER,
];

// ============================================================
// Underwriting status / labels / colors
// ============================================================

export const UW_STATUS_LABELS: Record<UwAppStatus, string> = {
  INTAKE: "Intake",
  DOCS_PENDING: "Docs Pending",
  ANALYZING: "Analyzing",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  DECLINED: "Declined",
  WITHDRAWN: "Withdrawn",
};

export const UW_STATUS_COLORS: Record<UwAppStatus, string> = {
  INTAKE: "secondary",
  DOCS_PENDING: "warning",
  ANALYZING: "default",
  UNDER_REVIEW: "default",
  APPROVED: "success",
  DECLINED: "destructive",
  WITHDRAWN: "secondary",
};

export const PAPER_GRADE_LABELS: Record<PaperGrade, string> = {
  A: "A Paper",
  B: "B Paper",
  C: "C Paper",
  D: "D Paper",
  UNGRADED: "Ungraded",
};

export const PAPER_GRADE_COLORS: Record<PaperGrade, string> = {
  A: "success",
  B: "default",
  C: "warning",
  D: "destructive",
  UNGRADED: "secondary",
};

export const UW_DOC_TYPE_LABELS: Record<UwDocType, string> = {
  BANK_STATEMENT: "Bank Statement",
  ID_FRONT: "ID (Front)",
  ID_BACK: "ID (Back)",
  VOIDED_CHECK: "Voided Check",
  APPLICATION: "Signed Application",
  EIN_LETTER: "EIN Letter",
  ARTICLES: "Articles of Org/Inc",
  LEASE: "Lease",
  PROCESSING_STATEMENT: "Processing Statement",
  PAYOFF_LETTER: "Payoff Letter",
  TAX_RETURN: "Tax Return",
  OTHER: "Other",
};

// Docs required for a complete application (the checklist)
export const UW_REQUIRED_DOC_TYPES: UwDocType[] = [
  UwDocType.APPLICATION,
  UwDocType.BANK_STATEMENT,
  UwDocType.ID_FRONT,
  UwDocType.VOIDED_CHECK,
];

export const UW_MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

export const UW_ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];
