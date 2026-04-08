import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import Link from "next/link";
import { DollarSign, TrendingUp, Wallet, PieChart } from "lucide-react";

export default async function PortfolioPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const syndications = await prisma.syndication.findMany({
    where: { userId: session.user.id },
    include: { deal: true },
    orderBy: { committedAt: "desc" },
  });

  const totalInvested = syndications.reduce((s, i) => s + Number(i.amount), 0);
  const totalDistributed = syndications.reduce((s, i) => s + Number(i.totalDistributed), 0);
  const totalProfit = syndications.reduce((s, i) => s + Number(i.profitEarned), 0);
  const principalReturned = syndications.reduce((s, i) => s + Number(i.principalReturned), 0);
  const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const completedPayouts = await prisma.payoutRequest.aggregate({
    where: { userId: session.user.id, status: "COMPLETED" },
    _sum: { amount: true },
  });
  const pendingPayouts = await prisma.payoutRequest.aggregate({
    where: { userId: session.user.id, status: "PENDING" },
    _sum: { amount: true },
  });

  const availableBalance = totalDistributed - Number(completedPayouts._sum.amount || 0) - Number(pendingPayouts._sum.amount || 0);

  return (
    <div>
      <PageHeader title="My Portfolio" description="Track your investments and returns" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Invested" value={formatCurrency(totalInvested)} icon={DollarSign} />
        <StatCard title="Total Distributed" value={formatCurrency(totalDistributed)} icon={TrendingUp} trend={totalDistributed > 0 ? "up" : "neutral"} />
        <StatCard title="Profit Earned" value={formatCurrency(totalProfit)} subtitle={`${roi.toFixed(1)}% ROI`} icon={PieChart} trend={totalProfit > 0 ? "up" : "neutral"} />
        <StatCard title="Available Balance" value={formatCurrency(availableBalance)} subtitle="Available for payout" icon={Wallet} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Holdings ({syndications.length} deals)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-steel-50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Merchant</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Invested</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ownership</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Returned</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Profit</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Progress</th>
                </tr>
              </thead>
              <tbody>
                {syndications.map((s) => {
                  const principalPct = Number(s.amount) > 0 ? (Number(s.principalReturned) / Number(s.amount)) * 100 : 0;
                  return (
                    <tr key={s.id} className="border-b hover:bg-steel-50">
                      <td className="px-4 py-3">
                        <Link href={`/deals/${s.dealId}`} className="font-medium text-navy-700 hover:underline">
                          {s.deal.merchantName}
                        </Link>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={s.deal.status} /></td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(Number(s.amount))}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatPercent(Number(s.ownershipPct))}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(Number(s.principalReturned))}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-profit">{formatCurrency(Number(s.profitEarned))}</td>
                      <td className="px-4 py-3 w-32">
                        <Progress value={principalPct} className="h-2" indicatorClassName={principalPct >= 100 ? "bg-profit" : "bg-navy-500"} />
                        <span className="text-xs text-muted-foreground">{formatPercent(principalPct, 0)} principal</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
