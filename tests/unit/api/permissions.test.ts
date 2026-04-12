import { describe, it, expect } from "vitest";
import { UserRole } from "@prisma/client";
import {
  isAdmin,
  isSuperAdmin,
  isSuperSuperAdmin,
  canInvest,
  canManageUsers,
  canViewAdminArea,
  canApprovPayouts,
  getUserWhereClause,
  getAuditWhereClause,
  getAssignableRoles,
} from "@/lib/permissions";

describe("Role-based permissions", () => {
  const roles = Object.values(UserRole) as UserRole[];

  describe("isAdmin", () => {
    it("SUPER_SUPER_ADMIN is admin", () => {
      expect(isAdmin("SUPER_SUPER_ADMIN")).toBe(true);
    });

    it("SUPER_ADMIN is admin", () => {
      expect(isAdmin("SUPER_ADMIN")).toBe(true);
    });

    it("ADMIN is admin", () => {
      expect(isAdmin("ADMIN")).toBe(true);
    });

    it("SYNDICATE_REP is NOT admin", () => {
      expect(isAdmin("SYNDICATE_REP")).toBe(false);
    });

    it("READ_ONLY is NOT admin", () => {
      expect(isAdmin("READ_ONLY")).toBe(false);
    });
  });

  describe("isSuperAdmin", () => {
    it("includes SUPER_SUPER_ADMIN", () => {
      expect(isSuperAdmin("SUPER_SUPER_ADMIN")).toBe(true);
    });

    it("includes SUPER_ADMIN", () => {
      expect(isSuperAdmin("SUPER_ADMIN")).toBe(true);
    });

    it("excludes ADMIN", () => {
      expect(isSuperAdmin("ADMIN")).toBe(false);
    });
  });

  describe("isSuperSuperAdmin", () => {
    it("only SUPER_SUPER_ADMIN", () => {
      expect(isSuperSuperAdmin("SUPER_SUPER_ADMIN")).toBe(true);
      for (const role of roles.filter((r) => r !== "SUPER_SUPER_ADMIN")) {
        expect(isSuperSuperAdmin(role)).toBe(false);
      }
    });
  });

  describe("canInvest", () => {
    it("admins can invest", () => {
      expect(canInvest("SUPER_SUPER_ADMIN")).toBe(true);
      expect(canInvest("SUPER_ADMIN")).toBe(true);
      expect(canInvest("ADMIN")).toBe(true);
    });

    it("SYNDICATE_REP can invest", () => {
      expect(canInvest("SYNDICATE_REP")).toBe(true);
    });

    it("READ_ONLY cannot invest", () => {
      expect(canInvest("READ_ONLY")).toBe(false);
    });
  });

  describe("canManageUsers", () => {
    it("SUPER_SUPER_ADMIN can manage users", () => {
      expect(canManageUsers("SUPER_SUPER_ADMIN")).toBe(true);
    });

    it("SUPER_ADMIN can manage users", () => {
      expect(canManageUsers("SUPER_ADMIN")).toBe(true);
    });

    it("ADMIN cannot manage users", () => {
      expect(canManageUsers("ADMIN")).toBe(false);
    });

    it("SYNDICATE_REP cannot manage users", () => {
      expect(canManageUsers("SYNDICATE_REP")).toBe(false);
    });
  });

  describe("getUserWhereClause", () => {
    it("SSA sees all users including hidden", () => {
      expect(getUserWhereClause("SUPER_SUPER_ADMIN")).toEqual({});
    });

    it("others only see non-hidden users", () => {
      expect(getUserWhereClause("ADMIN")).toEqual({ isHidden: false });
      expect(getUserWhereClause("SYNDICATE_REP")).toEqual({ isHidden: false });
    });
  });

  describe("getAssignableRoles", () => {
    it("SSA can assign all roles except SUPER_SUPER_ADMIN", () => {
      const roles = getAssignableRoles("SUPER_SUPER_ADMIN");
      expect(roles).toContain("ADMIN");
      expect(roles).toContain("SUPER_ADMIN");
      expect(roles).toContain("SYNDICATE_REP");
      expect(roles).toContain("READ_ONLY");
      expect(roles).not.toContain("SUPER_SUPER_ADMIN");
    });

    it("SUPER_ADMIN can assign ADMIN and below", () => {
      const roles = getAssignableRoles("SUPER_ADMIN");
      expect(roles).toContain("ADMIN");
      expect(roles).toContain("SYNDICATE_REP");
      expect(roles).toContain("READ_ONLY");
      expect(roles).not.toContain("SUPER_ADMIN");
      expect(roles).not.toContain("SUPER_SUPER_ADMIN");
    });

    it("ADMIN can only assign REP and READ_ONLY", () => {
      const roles = getAssignableRoles("ADMIN");
      expect(roles).toContain("SYNDICATE_REP");
      expect(roles).toContain("READ_ONLY");
      expect(roles).not.toContain("ADMIN");
    });
  });
});
