import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { calculateAvailableBalance } from "@/lib/calculations/pro-rata";
import Link from "next/link";
import Decimal from "decimal.js";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  PieChart,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

export default async function PortfolioPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const syndications = await prisma.syndication.findMany({
    where: { userId: session.user.id },
    include: { deal: true },
    orderBy: { committedAt: "desc" },
  });

  const totalInvested = syndications.reduce(
    (s, i) => s.plus(new Decimal(i.amount.toString())), new Decimal(0)
  );
  const totalDistributed = syndications.reduce(
    (s, i) => s.plus(new Decimal(i.totalDistributed.toString())), new Decimal(0)
  );
  const totalProfit = syndications.reduce(
    (s, i) => s.plus(new Decimal(i.profitEarned.toString())), new Decimal(0)
  );
  const principalReturned = syndications.reduce(
    (s, i) => s.plus(new Decimal(i.principalReturned.toString())), new Decimal(0)
  );
  const roi = totalInvested.gt(0)
    ? totalProfit.div(totalInvested).mul(100).toDecimalPlaces(2).toNumber()
    : 0;

  const payoutHolds = await prisma.payoutRequest.aggregate({
    where: {
      userId: session.user.id,
      status: { in: ["PENDING", "APPROVED", "PROCESSING", "COMPLETED"] },
    },
    _sum: { amount: true },
  });
  const totalPayoutHolds = new Decimal((payoutHolds._sum.amount || 0).toString());
  const availableBalance = calculateAvailableBalance(
    totalDistributed.toString(),
    totalPayoutHolds.toString(),
  );

  const activeSynd = syndications.filter((s) => s.deal.status === "ACTIVE_REPAYING");
  const delinquentSynd = syndications.filter((s) => s.deal.status === "DELINQUENT");
  const paidOffSynd = syndications.filter((s) => s.deal.status === "PAID_OFF");
  const principalPctTotal = totalInvested.gt(0)
    ? principalReturned.div(totalInvested).mul(100).toDecimalPlaces(1).toNumber()
    : 0;

  return (
    <div>
      <PageHeader title="My Portfolio" description="Track your investments and returns">
        <Link href="/payouts">
          <div className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 transition-colors">
            Request Payout
          </div>
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-5">
        <StatCard title="Total Invested" value={formatCurrency(totalInvested.toNumber())} icon={DollarSign} />
        <StatCard title="Total Distributed" value={formatCurrency(totalDistributed.toNumber())} icon={TrendingUp} trend={totalDistributed.gt(0) ? "up" : "neutral"} />
        <StatCard title="Profit Earned" value={formatCurrency(totalProfit.toNumber())} subtitle={`${roi.toFixed(1)}% ROI`} icon={PieChart} trend={totalProfit.gt(0) ? "up" : "neutral"} />
        <StatCard title="Available Balance" value={formatCurrency(availableBalance.toNumber())} subtitle="Available for payout" icon={Wallet} />
      </div>

      {/* Progress + summary row */}
      <div className="grid gap-4 lg:grid-cols-3 mb-5">
        {/* Principal recovery progress */}
        <Card className="lg:col-span-2">
          <CardContent className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-navy-800">Principal Recovery</span>
              <span className="text-sm font-bold tabular-nums text-navy-700">
                {formatPercent(principalPctTotal, 1)}
              </span>
            </div>
            <Progress
              value={principalPctTotal}
              className="h-3 rounded-full"
              indicatorClassName={principalPctTotal >= 100 ? "bg-profit rounded-full" : "bg-navy-400 rounded-full"}
            />
            <div className="mt-2 flex justify-between text-xs text-steel-500">
              <span>{formatCurrency(principalReturned.toNumber())} recovered</span>
              <span>{formatCurrency(totalInvested.toNumber())} invested</span>
            </div>
          </CardContent>
        </Card>

        {/* Deal breakdown */}
        <Card>
          <CardContent className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-steel-400 mb-3">Deal Breakdown</p>
            <div className="space-y-2">
              {[
                { label: "Active", count: activeSynd.length, color: "bg-profit" },
                { label: "Delinquent", count: delinquentSynd.length, color: "bg-warning" },
                { label: "Paid Off", count: paidOffSynd.length, color: "bg-navy-500" },
                { label: "Other", count: syndications.length - activeSynd.length - delinquentSynd.length - paidOffSynd.length, color: "bg-steel-300" },
              ].filter((r) => r.count > 0).map((row) => (
                <div key={row.label} className="flex items-center gap-2.5">
                  <div className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                  <span className="flex-1 text-sm text-steel-600">{row.label}</span>
                  <span className="text-sm font-bold tabular-nums text-navy-900">{row.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings table */}
      <Card>
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
              Holdings
            </CardTitle>
            <span className="text-xs text-steel-400">{syndications.length} deal{syndications.length !== 1 ? "s" : ""}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {syndications.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-steel-200" />
              <p className="mt-3 text-sm text-steel-400">No investments yet</p>
              <Link href="/deals" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-navy-600 hover:text-navy-800">
                Browse deals <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-steel-50/70">
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-steel-500">Merchant</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-steel-500">Status</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500">Invested</th>
                    <th className="hidden px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500 md:table-cell">Ownership</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500">Returned</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500">Profit</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500">Recovery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {syndications.map((s) => {
                    const invested = Number(s.amount);
                    const returned = Number(s.principalReturned);
                    const profit = Number(s.profitEarned);
                    const distributed = Number(s.totalDistributed);
                    const principalPct = invested > 0 ? (returned / invested) * 100 : 0;
                    const isDelinquent = s.deal.status === "DELINQUENT";
                    const isPaidOff = s.deal.status === "PAID_OFF";
                    return (
                      <tr key={s.id} className={`group transition-colors hover:bg-navy-50/30 ${isDelinquent ? "bg-warning-light/20" : ""}`}>
                        <td className="px-5 py-3.5">
                          <Link href={`/deals/${s.dealId}`} className="font-semibold text-navy-800 group-hover:text-navy-600">
                            {s.deal.merchantName}
                          </Link>
                          {s.deal.merchantIndustry && (
                            <p className="text-[11px] text-steel-400 mt-0.5">{s.deal.merchantIndustry}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status={s.deal.status} />
                            {isDelinquent && <AlertTriangle className="h-3 w-3 text-warning" />}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-navy-900">
                          {formatCurrency(invested)}
                        </td>
                        <td className="hidden px-5 py-3.5 text-right tabular-nums text-steel-600 md:table-cell">
                          {formatPercent(Number(s.ownershipPct))}
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums">
                          <span className={returned > 0 ? "text-navy-800 font-medium" : "text-steel-400"}>
                            {formatCurrency(returned)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums">
                          <span className={profit > 0 ? "font-bold text-profit" : "text-steel-400"}>
                            {profit > 0 ? "+" : ""}{formatCurrency(profit)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2.5">
                            <Progress
                              value={principalPct}
                              className="h-2 w-16 rounded-full"
                              indicatorClassName={
                                isPaidOff || principalPct >= 100
                                  ? "bg-profit rounded-full"
                                  : isDelinquent
                                    ? "bg-warning rounded-full"
                                    : "bg-navy-400 rounded-full"
                              }
                            />
                            <span className={`w-10 text-right text-xs font-semibold tabular-nums ${
                              principalPct >= 100 ? "text-profit" : isDelinquent ? "text-warning" : "text-steel-600"
                            }`}>
                              {formatPercent(principalPct, 0)}
                            </span>
                            {principalPct >= 100 && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-profit shrink-0" />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
