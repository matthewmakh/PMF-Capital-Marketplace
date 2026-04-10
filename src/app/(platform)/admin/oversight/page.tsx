import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isSuperSuperAdmin } from "@/lib/permissions";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { Shield, Users, Activity, Eye } from "lucide-react";
import { MFAToggle } from "./mfa-toggle";

export default async function OversightPage() {
  const session = await auth();
  if (!session?.user || !isSuperSuperAdmin(session.user.role)) {
    redirect("/dashboard");
  }

  const [totalUsers, adminUsers, recentAdminActions, allUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        lastLoginAt: true,
        isActive: true,
      },
    }),
    prisma.auditLog.findMany({
      where: {
        actor: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
      },
      include: {
        actor: { select: { firstName: true, lastName: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  const totalPayoutsApproved = await prisma.payoutRequest.aggregate({
    where: { status: "COMPLETED" },
    _sum: { amount: true },
    _count: true,
  });

  return (
    <div>
      <PageHeader title="System Oversight" description="Full visibility into admin activity and system state">
        <Badge variant="warning" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Super Admin View
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-6">
        <StatCard title="Total Users" value={String(totalUsers)} icon={Users} />
        <StatCard title="Active Users" value={String(allUsers)} icon={Activity} />
        <StatCard title="Admin Users" value={String(adminUsers.length)} icon={Shield} />
        <StatCard
          title="Total Payouts Processed"
          value={formatCurrency(Number(totalPayoutsApproved._sum.amount || 0))}
          subtitle={`${totalPayoutsApproved._count} payouts`}
          icon={Eye}
        />
      </div>

      <div className="mb-6">
        <MFAToggle />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Admin Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{ROLE_LABELS[u.role]}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last login: {u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentAdminActions.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-md border p-2">
                  <div>
                    <p className="text-xs font-medium">
                      {log.actor?.firstName} {log.actor?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.action.replace(/_/g, " ")}
                      {log.resourceType && ` on ${log.resourceType}`}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
