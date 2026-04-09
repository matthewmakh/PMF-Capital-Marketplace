"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface PlatformShellProps {
  userName: string;
  userRole: UserRole;
  children: React.ReactNode;
}

export function PlatformShell({
  userName,
  userRole,
  children,
}: PlatformShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        userRole={userRole}
        userName={userName}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          userName={userName}
          userRole={userRole}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-steel-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
