"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Bell } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import { UserRole } from "@prisma/client";

interface TopbarProps {
  userName: string;
  userRole: UserRole;
}

export function Topbar({ userName, userRole }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-navy-900">
          Welcome back, {userName.split(" ")[0]}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-steel-500 bg-steel-50 px-2.5 py-1 rounded-full">
          {ROLE_LABELS[userRole] || userRole}
        </span>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4 text-steel-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign out"
        >
          <LogOut className="h-4 w-4 text-steel-500" />
        </Button>
      </div>
    </header>
  );
}
