import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Settings,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";
import { UserRole } from "@prisma/client";
import { UNDERWRITER_ROLES } from "@/lib/constants";

export interface UwNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  section?: string;
}

export const uwNavItems: UwNavItem[] = [
  {
    title: "Dashboard",
    href: "/uw/dashboard",
    icon: LayoutDashboard,
    roles: UNDERWRITER_ROLES,
  },
  {
    title: "Applications",
    href: "/uw/applications",
    icon: ClipboardList,
    roles: UNDERWRITER_ROLES,
  },
  {
    title: "New Application",
    href: "/uw/applications/new",
    icon: PlusCircle,
    roles: UNDERWRITER_ROLES,
  },
  {
    title: "Settings",
    href: "/uw/settings",
    icon: Settings,
    roles: UNDERWRITER_ROLES,
    section: "System",
  },
  {
    title: "Back to Marketplace",
    href: "/dashboard",
    icon: ArrowLeftRight,
    roles: [
      UserRole.SUPER_SUPER_ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
    ],
    section: "System",
  },
];

export function getUwNavItemsForRole(role: UserRole): UwNavItem[] {
  return uwNavItems.filter((item) => item.roles.includes(role));
}
