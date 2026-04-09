"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Menu } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import { UserRole } from "@prisma/client";

interface TopbarProps {
  userName: string;
  userRole: UserRole;
  onMenuClick: () => void;
}

export function Topbar({ userName, userRole, onMenuClick }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-4 lg:h-16 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-steel-500 hover:bg-steel-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-base font-semibold text-navy-900 lg:text-lg">
          Welcome back, {userName.split(" ")[0]}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-xs font-medium text-steel-500 bg-steel-50 px-2.5 py-1 rounded-full sm:inline-block">
          {ROLE_LABELS[userRole] || userRole}
        </span>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4 text-steel-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign out"
        >
          <LogOut className="h-4 w-4 text-steel-500" />
        </Button>
      </div>
    </header>
  );
}
