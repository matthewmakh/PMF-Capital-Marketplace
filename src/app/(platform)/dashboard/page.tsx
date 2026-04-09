import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  Wallet,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { user } = session;

  if (isAdmin(user.role)) {
    return <AdminDashboard userId={user.id} />;
  }

  if (user.role === "READ_ONLY") {
    return <ExecutiveDashboard />;
  }

  return <InvestorDashboard userId={user.id} />;
}

async function InvestorDashboard({ userId }: { userId: string }) {
  const syndications = await prisma.syndication.findMany({
    where: { userId, isActive: true },
    include: { deal: true },
  });

  const totalInvested = syndications.reduce(
    (sum, s) => sum + Number(s.amount),
    0
  );
  const totalDistributed = syndications.reduce(
    (sum, s) => sum + Number(s.totalDistributed),
    0
  );
  const totalProfit = syndications.reduce(
    (sum, s) => sum + Number(s.profitEarned),
    0
  );
  const principalReturned = syndications.reduce(
    (sum, s) => sum + Number(s.principalReturned),
    0
  );

  const openDeals = await prisma.deal.count({
    where: { status: "OPEN_FOR_SYNDICATION" },
  });

  const pendingPayouts = await prisma.payoutRequest.aggregate({
    where: { userId, status: "PENDING" },
    _sum: { amount: true },
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your investment overview"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Invested"
          value={formatCurrency(totalInvested)}
          icon={DollarSign}
        />
        <StatCard
          title="Total Repaid"
          value={formatCurrency(totalDistributed)}
          icon={TrendingUp}
          trend={totalDistributed > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Profit Earned"
          value={formatCurrency(totalProfit)}
          icon={Wallet}
          trend={totalProfit > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Principal Recovered"
          value={formatCurrency(principalReturned)}
          subtitle={`${totalInvested > 0 ? ((principalReturned / totalInvested) * 100).toFixed(1) : 0}% of invested`}
          icon={TrendingUp}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Investments</CardTitle>
          </CardHeader>
          <CardContent>
            {syndications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active investments.{" "}
                <Link href="/deals" className="text-navy-600 hover:underline">
                  Browse deals
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {syndications.slice(0, 5).map((s) => (
                  <Link
                    key={s.id}
                    href={`/deals/${s.dealId}`}
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-steel-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {s.deal.merchantName}
                      </p>
                      <StatusBadge status={s.deal.status} />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatCurrency(Number(s.amount))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Number(s.ownershipPct).toFixed(1)}% ownership
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Active Deals
              </span>
              <span className="text-sm font-semibold">
                {syndications.filter((s) => s.deal.status === "ACTIVE_REPAYING").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Open Opportunities
              </span>
              <span className="text-sm font-semibold">{openDeals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Pending Payouts
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrency(Number(pendingPayouts._sum.amount || 0))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function AdminDashboard({ userId }: { userId: string }) {
  const [
    totalDeals,
    pendingReview,
    activeDeals,
    pendingPayouts,
    delinquentDeals,
    recentPayments,
  ] = await Promise.all([
    prisma.deal.count(),
    prisma.deal.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.deal.count({ where: { status: "ACTIVE_REPAYING" } }),
    prisma.payoutRequest.count({ where: { status: "PENDING" } }),
    prisma.deal.count({ where: { status: "DELINQUENT" } }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { deal: true },
    }),
  ]);

  const totalCapital = await prisma.syndication.aggregate({
    _sum: { amount: true },
  });

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Office-wide performance overview"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Capital Deployed"
          value={formatCurrency(Number(totalCapital._sum.amount || 0))}
          icon={DollarSign}
        />
        <StatCard
          title="Pending Review"
          value={String(pendingReview)}
          subtitle="Deals awaiting review"
          icon={Clock}
        />
        <StatCard
          title="Active Deals"
          value={String(activeDeals)}
          icon={Briefcase}
        />
        <StatCard
          title="Pending Payouts"
          value={String(pendingPayouts)}
          subtitle="Awaiting approval"
          icon={Wallet}
        />
      </div>

      {delinquentDeals > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-warning/30 bg-warning-light p-3">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <p className="text-sm font-medium text-warning">
            {delinquentDeals} delinquent deal{delinquentDeals !== 1 ? "s" : ""}{" "}
            require attention
          </p>
        </div>
      )}

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet.</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {p.deal.merchantName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Payment #{p.paymentNumber}
                      </p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-profit">
                      +{formatCurrency(Number(p.amount))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function ExecutiveDashboard() {
  const [totalDeals, activeDeals, totalCapital, totalCollected] =
    await Promise.all([
      prisma.deal.count(),
      prisma.deal.count({ where: { status: "ACTIVE_REPAYING" } }),
      prisma.syndication.aggregate({ _sum: { amount: true } }),
      prisma.deal.aggregate({ _sum: { totalCollected: true } }),
    ]);

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        description="Office performance at a glance"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Deals"
          value={String(totalDeals)}
          icon={Briefcase}
        />
        <StatCard
          title="Active Deals"
          value={String(activeDeals)}
          icon={TrendingUp}
        />
        <StatCard
          title="Capital Deployed"
          value={formatCurrency(Number(totalCapital._sum.amount || 0))}
          icon={DollarSign}
        />
        <StatCard
          title="Total Collected"
          value={formatCurrency(Number(totalCollected._sum.totalCollected || 0))}
          icon={Wallet}
          trend="up"
        />
      </div>
    </div>
  );
}
