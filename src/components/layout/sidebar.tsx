"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getNavItemsForRole } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SidebarProps {
  userRole: UserRole;
  userName: string;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ userRole, userName, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = getNavItemsForRole(userRole);

  const mainItems = items.filter((i) => !i.section);
  const adminItems = items.filter((i) => i.section === "Administration");
  const systemItems = items.filter((i) => i.section === "System");

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-500">
              <span className="text-sm font-bold text-white">PMF</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                Capital Marketplace
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                Premier Merchant Funding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-sidebar-foreground/60 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavSection items={mainItems} pathname={pathname} onNavigate={onClose} />

          {adminItems.length > 0 && (
            <>
              <div className="mt-6 mb-2 px-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  Administration
                </p>
              </div>
              <NavSection items={adminItems} pathname={pathname} onNavigate={onClose} />
            </>
          )}

          {systemItems.length > 0 && (
            <>
              <div className="mt-6 mb-2 px-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">
                  System
                </p>
              </div>
              <NavSection
                items={systemItems}
                pathname={pathname}
                onNavigate={onClose}
                activeClass="bg-amber-900/30 text-amber-300"
                inactiveClass="text-amber-400/60 hover:bg-amber-900/20 hover:text-amber-300"
              />
            </>
          )}
        </nav>

        {/* User */}
        <div className="border-t border-sidebar-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-white">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <p className="truncate text-sm font-medium text-white">
              {userName}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavSection({
  items,
  pathname,
  onNavigate,
  activeClass = "bg-sidebar-accent text-white",
  inactiveClass = "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white",
}: {
  items: ReturnType<typeof getNavItemsForRole>;
  pathname: string;
  onNavigate: () => void;
  activeClass?: string;
  inactiveClass?: string;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? activeClass : inactiveClass
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
