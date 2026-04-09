import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, Briefcase, Users, TrendingUp } from "lucide-react";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [dealCount, activeDeals, totalCapital, totalCollected, userCount, totalPayouts] = await Promise.all([
    prisma.deal.count(),
    prisma.deal.count({ where: { status: "ACTIVE_REPAYING" } }),
    prisma.syndication.aggregate({ _sum: { amount: true } }),
    prisma.deal.aggregate({ _sum: { totalCollected: true } }),
    prisma.user.count({ where: { isActive: true, isHidden: false } }),
    prisma.payoutRequest.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Reports" description="Office-wide financial reports and analytics" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 mb-6">
        <StatCard title="Total Deals" value={String(dealCount)} icon={Briefcase} />
        <StatCard title="Active Deals" value={String(activeDeals)} icon={TrendingUp} />
        <StatCard title="Active Users" value={String(userCount)} icon={Users} />
        <StatCard title="Capital Deployed" value={formatCurrency(Number(totalCapital._sum.amount || 0))} icon={DollarSign} />
        <StatCard title="Total Collections" value={formatCurrency(Number(totalCollected._sum.totalCollected || 0))} icon={TrendingUp} trend="up" />
        <StatCard title="Total Payouts" value={formatCurrency(Number(totalPayouts._sum.amount || 0))} icon={DollarSign} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detailed Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            CSV/PDF export and advanced analytics will be available in Phase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
