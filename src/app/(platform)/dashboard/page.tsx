import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  Wallet,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  BarChart3,
  CircleDollarSign,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { user } = session;

  if (isAdmin(user.role)) return <AdminDashboard userId={user.id} />;
  if (user.role === "READ_ONLY") return <ExecutiveDashboard />;
  return <InvestorDashboard userId={user.id} />;
}

// ================================================================
// ADMIN DASHBOARD
// ================================================================

async function AdminDashboard({ userId }: { userId: string }) {
  const [
    totalDeals,
    pendingReview,
    activeDeals,
    openDeals,
    fundedDeals,
    paidOffDeals,
    defaultedDeals,
    pendingPayouts,
    delinquentDeals,
    recentPayments,
    totalUsers,
    pendingPayoutRequests,
  ] = await Promise.all([
    prisma.deal.count(),
    prisma.deal.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.deal.count({ where: { status: "ACTIVE_REPAYING" } }),
    prisma.deal.count({ where: { status: "OPEN_FOR_SYNDICATION" } }),
    prisma.deal.count({ where: { status: "FUNDED" } }),
    prisma.deal.count({ where: { status: "PAID_OFF" } }),
    prisma.deal.count({ where: { status: "DEFAULTED" } }),
    prisma.payoutRequest.count({ where: { status: "PENDING" } }),
    prisma.deal.count({ where: { status: "DELINQUENT" } }),
    prisma.payment.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        deal: { select: { merchantName: true, status: true } },
        postedBy: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.user.count({ where: { isActive: true, isHidden: false } }),
    prisma.payoutRequest.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  const [totalCapital, totalCollected, totalPaybackExpected] = await Promise.all([
    prisma.syndication.aggregate({ _sum: { amount: true } }),
    prisma.deal.aggregate({
      where: { status: { in: ["ACTIVE_REPAYING", "DELINQUENT", "PAID_OFF"] } },
      _sum: { totalCollected: true },
    }),
    prisma.deal.aggregate({
      where: { status: { in: ["ACTIVE_REPAYING", "DELINQUENT", "PAID_OFF"] } },
      _sum: { paybackAmount: true },
    }),
  ]);

  const capitalAmt = Number(totalCapital._sum.amount || 0);
  const collectedAmt = Number(totalCollected._sum.totalCollected || 0);
  const paybackAmt = Number(totalPaybackExpected._sum.paybackAmount || 0);
  const collectionRate = paybackAmt > 0 ? (collectedAmt / paybackAmt) * 100 : 0;

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Office-wide performance overview"
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Capital Deployed"
          value={formatCurrency(capitalAmt)}
          icon={DollarSign}
          countUp
          numericValue={capitalAmt}
        />
        <StatCard
          title="Total Collected"
          value={formatCurrency(collectedAmt)}
          subtitle={`${formatPercent(collectionRate, 1)} collection rate`}
          icon={TrendingUp}
          trend={collectedAmt > 0 ? "up" : "neutral"}
          countUp
          numericValue={collectedAmt}
        />
        <StatCard
          title="Active Deals"
          value={String(activeDeals)}
          subtitle={`${totalDeals} total`}
          icon={Briefcase}
          countUp
          numericValue={activeDeals}
          countUpFormat="number"
        />
        <StatCard
          title="Active Users"
          value={String(totalUsers)}
          icon={Users}
          countUp
          numericValue={totalUsers}
          countUpFormat="number"
        />
      </div>

      {/* Alerts */}
      {(delinquentDeals > 0 || pendingReview > 0 || pendingPayouts > 0) && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {pendingReview > 0 && (
            <Link href="/admin/deals">
              <div className="flex items-center gap-3 rounded-xl border border-navy-200 bg-navy-50 px-4 py-3 transition-colors hover:bg-navy-100">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-200">
                  <FileText className="h-4 w-4 text-navy-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-800">
                    {pendingReview} deal{pendingReview !== 1 ? "s" : ""} pending review
                  </p>
                  <p className="text-xs text-navy-500">Click to review</p>
                </div>
              </div>
            </Link>
          )}
          {delinquentDeals > 0 && (
            <Link href="/admin/deals">
              <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning-light px-4 py-3 transition-colors hover:bg-warning-light/80">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/20">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-warning">
                    {delinquentDeals} delinquent deal{delinquentDeals !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-warning/70">Requires attention</p>
                </div>
              </div>
            </Link>
          )}
          {pendingPayouts > 0 && (
            <Link href="/admin/payouts">
              <div className="flex items-center gap-3 rounded-xl border border-steel-200 bg-steel-50 px-4 py-3 transition-colors hover:bg-steel-100">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-steel-200">
                  <Wallet className="h-4 w-4 text-steel-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-steel-700">
                    {pendingPayouts} payout{pendingPayouts !== 1 ? "s" : ""} awaiting approval
                  </p>
                  <p className="text-xs text-steel-500">Click to review</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Deal Pipeline */}
        <Card>
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
                Deal Pipeline
              </CardTitle>
              <Link href="/admin/deals" className="text-xs text-navy-600 hover:text-navy-800">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {[
                { label: "Pending Review", count: pendingReview, color: "bg-warning", textColor: "text-warning" },
                { label: "Open for Syndication", count: openDeals, color: "bg-navy-400", textColor: "text-navy-600" },
                { label: "Funded", count: fundedDeals, color: "bg-navy-600", textColor: "text-navy-700" },
                { label: "Active Repaying", count: activeDeals, color: "bg-profit", textColor: "text-profit" },
                { label: "Delinquent", count: delinquentDeals, color: "bg-warning", textColor: "text-warning" },
                { label: "Paid Off", count: paidOffDeals, color: "bg-profit", textColor: "text-profit" },
                { label: "Defaulted", count: defaultedDeals, color: "bg-danger", textColor: "text-danger" },
              ].filter(s => s.count > 0).map((stage) => (
                <div key={stage.label} className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                  <span className="flex-1 text-sm text-steel-600">{stage.label}</span>
                  <span className={`text-sm font-bold tabular-nums ${stage.textColor}`}>
                    {stage.count}
                  </span>
                </div>
              ))}
            </div>
            {totalDeals > 0 && (
              <div className="mt-4 pt-3 border-t border-border/40 flex justify-between text-sm">
                <span className="text-steel-500">Total Deals</span>
                <span className="font-bold text-navy-900">{totalDeals}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
                Recent Payments
              </CardTitle>
              <span className="text-xs text-steel-400">
                Last {recentPayments.length} entries
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentPayments.length === 0 ? (
              <div className="py-8 text-center">
                <CircleDollarSign className="mx-auto h-8 w-8 text-steel-200" />
                <p className="mt-2 text-sm text-steel-400">No payments recorded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recentPayments.map((p) => (
                  <Link
                    key={p.id}
                    href={`/deals/${p.dealId}`}
                    className="flex items-center gap-3 py-3 transition-colors hover:bg-steel-50 -mx-5 px-5"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${p.isReversed ? "bg-danger-light" : "bg-profit-light"}`}>
                      <ArrowUpRight className={`h-3.5 w-3.5 ${p.isReversed ? "text-danger" : "text-profit"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy-800">
                        {p.deal.merchantName}
                      </p>
                      <p className="text-xs text-steel-400">
                        Payment #{p.paymentNumber} &middot; {formatDate(p.createdAt)} &middot; {p.postedBy.firstName} {p.postedBy.lastName}
                      </p>
                    </div>
                    <p className={`shrink-0 text-sm font-bold tabular-nums ${p.isReversed ? "text-danger line-through" : "text-profit"}`}>
                      +{formatCurrency(Number(p.amount))}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: pending payouts + quick actions */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Pending Payouts */}
        <Card>
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
                Pending Payouts
              </CardTitle>
              {pendingPayoutRequests.length > 0 && (
                <Link href="/admin/payouts" className="text-xs text-navy-600 hover:text-navy-800">
                  Review all
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {pendingPayoutRequests.length === 0 ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-7 w-7 text-profit/50" />
                <p className="mt-1.5 text-sm text-steel-400">All payouts processed</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {pendingPayoutRequests.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-steel-100 text-xs font-bold text-steel-600">
                        {p.user.firstName[0]}{p.user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy-800">
                          {p.user.firstName} {p.user.lastName}
                        </p>
                        <p className="text-xs text-steel-400">{formatDate(p.createdAt)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-navy-900">
                      {formatCurrency(Number(p.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="border-b border-border/40">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Create Deal", href: "/admin/deals/create", icon: Briefcase, color: "bg-navy-50 text-navy-700 hover:bg-navy-100" },
                { label: "Review Payouts", href: "/admin/payouts", icon: Wallet, color: "bg-steel-50 text-steel-700 hover:bg-steel-100" },
                { label: "View Users", href: "/admin/users", icon: Users, color: "bg-steel-50 text-steel-700 hover:bg-steel-100" },
                { label: "Audit Log", href: "/admin/audit-log", icon: FileText, color: "bg-steel-50 text-steel-700 hover:bg-steel-100" },
                { label: "Reports", href: "/admin/reports", icon: BarChart3, color: "bg-steel-50 text-steel-700 hover:bg-steel-100" },
                { label: "Marketplace", href: "/deals", icon: CircleDollarSign, color: "bg-navy-50 text-navy-700 hover:bg-navy-100" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${action.color}`}>
                    <action.icon className="h-4 w-4 shrink-0" />
                    {action.label}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ================================================================
// INVESTOR DASHBOARD
// ================================================================

async function InvestorDashboard({ userId }: { userId: string }) {
  const syndications = await prisma.syndication.findMany({
    where: { userId, isActive: true },
    include: { deal: true },
  });

  const totalInvested = syndications.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalDistributed = syndications.reduce((sum, s) => sum + Number(s.totalDistributed), 0);
  const totalProfit = syndications.reduce((sum, s) => sum + Number(s.profitEarned), 0);
  const principalReturned = syndications.reduce((sum, s) => sum + Number(s.principalReturned), 0);
  const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const openDeals = await prisma.deal.count({ where: { status: "OPEN_FOR_SYNDICATION" } });
  const pendingPayouts = await prisma.payoutRequest.aggregate({
    where: { userId, status: "PENDING" },
    _sum: { amount: true },
  });

  const activeSyndications = syndications.filter((s) => s.deal.status === "ACTIVE_REPAYING");
  const delinquentSyndications = syndications.filter((s) => s.deal.status === "DELINQUENT");

  return (
    <div>
      <PageHeader title="Dashboard" description="Your investment overview" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Total Invested" value={formatCurrency(totalInvested)} icon={DollarSign} countUp numericValue={totalInvested} />
        <StatCard
          title="Total Repaid"
          value={formatCurrency(totalDistributed)}
          icon={TrendingUp}
          trend={totalDistributed > 0 ? "up" : "neutral"}
          countUp
          numericValue={totalDistributed}
        />
        <StatCard
          title="Profit Earned"
          value={formatCurrency(totalProfit)}
          subtitle={`${roi.toFixed(1)}% ROI`}
          icon={Wallet}
          trend={totalProfit > 0 ? "up" : "neutral"}
          countUp
          numericValue={totalProfit}
        />
        <StatCard
          title="Principal Recovered"
          value={formatCurrency(principalReturned)}
          subtitle={`${totalInvested > 0 ? ((principalReturned / totalInvested) * 100).toFixed(1) : 0}% of invested`}
          icon={TrendingUp}
          countUp
          numericValue={principalReturned}
        />
      </div>

      {/* Alert row */}
      {(delinquentSyndications.length > 0 || openDeals > 0) && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {delinquentSyndications.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning-light px-4 py-3">
              <AlertTriangle className="h-4.5 w-4.5 text-warning shrink-0" />
              <p className="text-sm font-medium text-warning">
                {delinquentSyndications.length} of your deals {delinquentSyndications.length === 1 ? "is" : "are"} delinquent
              </p>
            </div>
          )}
          {openDeals > 0 && (
            <Link href="/deals">
              <div className="flex items-center justify-between rounded-xl border border-navy-200 bg-navy-50 px-4 py-3 transition-colors hover:bg-navy-100">
                <div className="flex items-center gap-3">
                  <CircleDollarSign className="h-4.5 w-4.5 text-navy-600" />
                  <p className="text-sm font-medium text-navy-700">
                    {openDeals} deal{openDeals !== 1 ? "s" : ""} open for syndication
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-navy-400" />
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        {/* Active Investments */}
        <Card className="lg:col-span-3">
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
                Active Investments
              </CardTitle>
              <Link href="/portfolio" className="text-xs text-navy-600 hover:text-navy-800">
                View portfolio
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {syndications.length === 0 ? (
              <div className="py-8 text-center">
                <Briefcase className="mx-auto h-8 w-8 text-steel-200" />
                <p className="mt-2 text-sm text-steel-400">No active investments</p>
                <Link href="/deals" className="mt-2 inline-block text-sm font-medium text-navy-600 hover:text-navy-800">
                  Browse deals <ArrowRight className="inline h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {syndications.slice(0, 6).map((s) => {
                  const invested = Number(s.amount);
                  const returned = Number(s.totalDistributed);
                  const pct = invested > 0 ? (returned / invested) * 100 : 0;
                  const isDelinquent = s.deal.status === "DELINQUENT";
                  return (
                    <Link
                      key={s.id}
                      href={`/deals/${s.dealId}`}
                      className="flex items-center gap-3 py-3 transition-colors hover:bg-steel-50 -mx-5 px-5"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isDelinquent ? "bg-warning-light" : "bg-navy-50"}`}>
                        {isDelinquent ? (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        ) : (
                          <Briefcase className="h-4 w-4 text-navy-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy-800">
                          {s.deal.merchantName}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-steel-500">
                          <StatusBadge status={s.deal.status} />
                          <span className="text-steel-300">|</span>
                          <span>{formatPercent(Number(s.ownershipPct))} ownership</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold tabular-nums text-navy-900">
                          {formatCurrency(invested)}
                        </p>
                        <p className={`text-xs tabular-nums ${returned > 0 ? "text-profit" : "text-steel-400"}`}>
                          {returned > 0 ? `+${formatCurrency(returned)}` : "No returns yet"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right sidebar */}
        <div className="space-y-5 lg:col-span-2">
          {/* Portfolio Summary */}
          <Card>
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
                Portfolio Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {totalInvested > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-steel-500 mb-1">
                    <span>Principal Recovery</span>
                    <span className="font-medium">
                      {formatPercent((principalReturned / totalInvested) * 100, 0)}
                    </span>
                  </div>
                  <Progress
                    value={(principalReturned / totalInvested) * 100}
                    className="h-2"
                    indicatorClassName={principalReturned >= totalInvested ? "bg-profit" : "bg-navy-400"}
                  />
                </div>
              )}
              <div className="space-y-2.5">
                {[
                  { label: "Active Deals", value: String(activeSyndications.length), color: "text-navy-900" },
                  { label: "Total Deals", value: String(syndications.length), color: "text-steel-600" },
                  { label: "Open Opportunities", value: String(openDeals), color: "text-navy-600" },
                  {
                    label: "Pending Payouts",
                    value: formatCurrency(Number(pendingPayouts._sum.amount || 0)),
                    color: Number(pendingPayouts._sum.amount || 0) > 0 ? "text-warning" : "text-steel-400",
                  },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-steel-500">{row.label}</span>
                    <span className={`font-semibold tabular-nums ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {[
                { label: "Browse Deals", href: "/deals", icon: CircleDollarSign },
                { label: "My Portfolio", href: "/portfolio", icon: BarChart3 },
                { label: "Request Payout", href: "/payouts", icon: Wallet },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="flex items-center justify-between rounded-xl bg-steel-50 px-3.5 py-2.5 text-sm font-medium text-steel-700 transition-colors hover:bg-navy-50 hover:text-navy-700">
                    <div className="flex items-center gap-2.5">
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-steel-400" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// EXECUTIVE DASHBOARD
// ================================================================

async function ExecutiveDashboard() {
  const [totalDeals, activeDeals, paidOffDeals, delinquent, totalCapital, totalCollected] =
    await Promise.all([
      prisma.deal.count(),
      prisma.deal.count({ where: { status: "ACTIVE_REPAYING" } }),
      prisma.deal.count({ where: { status: "PAID_OFF" } }),
      prisma.deal.count({ where: { status: "DELINQUENT" } }),
      prisma.syndication.aggregate({ _sum: { amount: true } }),
      prisma.deal.aggregate({ _sum: { totalCollected: true } }),
    ]);

  const capitalAmt = Number(totalCapital._sum.amount || 0);
  const collectedAmt = Number(totalCollected._sum.totalCollected || 0);

  return (
    <div>
      <PageHeader title="Executive Dashboard" description="Office performance at a glance" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Total Deals" value={String(totalDeals)} icon={Briefcase} countUp numericValue={totalDeals} countUpFormat="number" />
        <StatCard title="Active Deals" value={String(activeDeals)} subtitle={delinquent > 0 ? `${delinquent} delinquent` : undefined} icon={TrendingUp} countUp numericValue={activeDeals} countUpFormat="number" />
        <StatCard title="Capital Deployed" value={formatCurrency(capitalAmt)} icon={DollarSign} countUp numericValue={capitalAmt} />
        <StatCard title="Total Collected" value={formatCurrency(collectedAmt)} icon={Wallet} trend="up" countUp numericValue={collectedAmt} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-border/40">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
              Deal Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {[
                { label: "Active Repaying", count: activeDeals, color: "bg-profit" },
                { label: "Paid Off", count: paidOffDeals, color: "bg-navy-500" },
                { label: "Delinquent", count: delinquent, color: "bg-warning" },
              ].filter(s => s.count > 0).map((stage) => (
                <div key={stage.label} className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                  <span className="flex-1 text-sm text-steel-600">{stage.label}</span>
                  <span className="text-sm font-bold tabular-nums text-navy-900">{stage.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/40">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-steel-500">Capital Deployed</span>
              <span className="font-bold tabular-nums text-navy-900">{formatCurrency(capitalAmt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-steel-500">Total Collected</span>
              <span className="font-bold tabular-nums text-profit">{formatCurrency(collectedAmt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-steel-500">Net Return</span>
              <span className={`font-bold tabular-nums ${collectedAmt > capitalAmt ? "text-profit" : "text-navy-900"}`}>
                {formatCurrency(collectedAmt - capitalAmt)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
