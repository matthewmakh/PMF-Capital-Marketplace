"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { UwSidebar } from "./uw-sidebar";
import { Topbar } from "@/components/layout/topbar";

interface UwShellProps {
  userName: string;
  userRole: UserRole;
  children: React.ReactNode;
}

export function UwShell({ userName, userRole, children }: UwShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <UwSidebar
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
