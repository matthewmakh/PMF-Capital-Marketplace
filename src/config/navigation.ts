import {
  LayoutDashboard,
  Briefcase,
  PieChart,
  Wallet,
  Settings,
  Users,
  FileText,
  Mail,
  ClipboardList,
  BarChart3,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { UserRole } from "@prisma/client";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  section?: string;
}

export const navItems: NavItem[] = [
  // Main
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      UserRole.SUPER_SUPER_ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.SYNDICATE_REP,
      UserRole.READ_ONLY,
    ],
  },
  {
    title: "Deal Marketplace",
    href: "/deals",
    icon: Briefcase,
    roles: [
      UserRole.SUPER_SUPER_ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.SYNDICATE_REP,
      UserRole.READ_ONLY,
    ],
  },
  {
    title: "My Portfolio",
    href: "/portfolio",
    icon: PieChart,
    roles: [
      UserRole.SUPER_SUPER_ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.SYNDICATE_REP,
    ],
  },
  {
    title: "Payouts",
    href: "/payouts",
    icon: Wallet,
    roles: [
      UserRole.SUPER_SUPER_ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.SYNDICATE_REP,
    ],
  },

  // Admin
  {
    title: "Manage Deals",
    href: "/admin/deals",
    icon: ClipboardList,
    roles: [UserRole.SUPER_SUPER_ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN],
    section: "Administration",
  },
  {
    title: "Payout Approvals",
    href: "/admin/payouts",
    icon: Wallet,
    roles: [UserRole.SUPER_SUPER_ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN],
    section: "Administration",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    roles: [UserRole.SUPER_SUPER_ADMIN, UserRole.SUPER_ADMIN],
    section: "Administration",
  },
  {
    title: "Email Ingestion",
    href: "/admin/email-ingestion",
    icon: Mail,
    roles: [UserRole.SUPER_SUPER_ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN],
    section: "Administration",
  },
  {
    title: "Audit Log",
    href: "/admin/audit-log",
    icon: FileText,
    roles: [UserRole.SUPER_SUPER_ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN],
    section: "Administration",
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    roles: [
      UserRole.SUPER_SUPER_ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.READ_ONLY,
    ],
    section: "Administration",
  },

  // Super-Super-Admin only
  {
    title: "System Oversight",
    href: "/admin/oversight",
    icon: Shield,
    roles: [UserRole.SUPER_SUPER_ADMIN],
    section: "System",
  },

  // Settings
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: [
      UserRole.SUPER_SUPER_ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.SYNDICATE_REP,
      UserRole.READ_ONLY,
    ],
  },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return navItems.filter((item) => item.roles.includes(role));
}
