import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import Link from "next/link";
import { DealStatus } from "@prisma/client";
import {
  MapPin,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  CircleDollarSign,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  DollarSign,
  BarChart3,
} from "lucide-react";

export default async function DealsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const deals = await prisma.deal.findMany({
    where: {
      status: {
        in: [
          DealStatus.OPEN_FOR_SYNDICATION,
          DealStatus.ACTIVE_REPAYING,
          DealStatus.FULLY_ALLOCATED,
          DealStatus.FUNDED,
          DealStatus.PAID_OFF,
          DealStatus.DELINQUENT,
        ],
      },
    },
    include: {
      _count: { select: { syndications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const openDeals = deals.filter(
    (d) => d.status === DealStatus.OPEN_FOR_SYNDICATION
  );
  const otherDeals = deals.filter(
    (d) => d.status !== DealStatus.OPEN_FOR_SYNDICATION
  );

  // Summary stats
  const totalCapital = deals.reduce((s, d) => s + Number(d.fundedAmount), 0);
  const totalCollected = deals.reduce((s, d) => s + Number(d.totalCollected), 0);
  const activeDealCount = deals.filter((d) => d.status === "ACTIVE_REPAYING").length;
  const delinquentCount = deals.filter((d) => d.status === "DELINQUENT").length;

  return (
    <div>
      <PageHeader
        title="Deal Marketplace"
        description="Browse and invest in active MCA deals"
      />

      {/* Summary bar */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-border/40 sm:grid-cols-4">
            {[
              { label: "Total Deals", value: String(deals.length), icon: Briefcase, color: "text-navy-900" },
              { label: "Open for Investment", value: String(openDeals.length), icon: CircleDollarSign, color: "text-navy-600" },
              { label: "Active Repaying", value: String(activeDealCount), icon: TrendingUp, color: "text-profit" },
              { label: "Total Capital", value: formatCurrency(totalCapital), icon: DollarSign, color: "text-navy-900" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-steel-50">
                  <item.icon className="h-4 w-4 text-steel-400" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-steel-400">
                    {item.label}
                  </p>
                  <p className={`text-base font-bold tabular-nums ${item.color} sm:text-lg`}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {openDeals.length === 0 && otherDeals.length === 0 && (
        <Card className="py-12 text-center">
          <CardContent>
            <p className="text-steel-500">No deals available yet. Check back soon.</p>
          </CardContent>
        </Card>
      )}

      {/* Open for Syndication */}
      {openDeals.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-100">
              <CircleDollarSign className="h-3.5 w-3.5 text-navy-600" />
            </div>
            <h2 className="text-base font-semibold text-navy-800">
              Open for Syndication
            </h2>
            <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-medium text-navy-700">
              {openDeals.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {openDeals.map((deal) => {
              const fundedAmt = Number(deal.fundedAmount);
              const paybackAmt = Number(deal.paybackAmount);
              const totalSyndicated = fundedAmt - Number(deal.syndicationOpen);
              const percentFilled = (totalSyndicated / fundedAmt) * 100;
              const returnRate = (((paybackAmt - fundedAmt) / fundedAmt) * 100).toFixed(1);
              const paybackFormatted = formatCurrency(paybackAmt);

              return (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <Card className="group h-full border-border/60 transition-all hover:border-navy-300 hover:shadow-lg">
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className="border-b border-border/40 bg-gradient-to-r from-navy-50/60 to-steel-50/30 px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-bold text-navy-900">
                              {deal.merchantName}
                            </h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-steel-500">
                              {deal.merchantIndustry && (
                                <span className="flex items-center gap-1 rounded-full bg-white/60 px-2 py-0.5">
                                  <TrendingUp className="h-3 w-3" />
                                  {deal.merchantIndustry}
                                </span>
                              )}
                              {deal.merchantState && (
                                <span className="flex items-center gap-1 rounded-full bg-white/60 px-2 py-0.5">
                                  <MapPin className="h-3 w-3" />
                                  {deal.merchantState}
                                </span>
                              )}
                              {deal.termDays && (
                                <span className="flex items-center gap-1 rounded-full bg-white/60 px-2 py-0.5">
                                  <Clock className="h-3 w-3" />
                                  {deal.termDays}d
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="shrink-0 rounded-lg bg-profit/10 px-2.5 py-1.5 text-xs font-bold text-profit">
                            {returnRate}%
                            <span className="block text-[10px] font-medium text-profit/70">return</span>
                          </span>
                        </div>
                      </div>

                      {/* Financials */}
                      <div className="px-5 py-4">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Funding", value: formatCurrency(fundedAmt) },
                            { label: "Factor", value: `${Number(deal.factorRate).toFixed(2)}x` },
                            { label: "Payback", value: paybackFormatted },
                          ].map((item) => (
                            <div key={item.label} className="rounded-lg bg-steel-50/70 px-3 py-2 text-center">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-steel-400">
                                {item.label}
                              </p>
                              <p className="mt-0.5 text-sm font-bold tabular-nums text-navy-900">
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between rounded-lg border border-dashed border-navy-200 bg-navy-50/30 px-3 py-2">
                          <span className="text-xs text-steel-500">Min Investment</span>
                          <span className="text-sm font-bold tabular-nums text-navy-700">
                            {formatCurrency(Number(deal.syndicationMin))}
                          </span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="border-t border-border/40 px-5 py-3.5">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-1.5 text-steel-500">
                            <Users className="h-3 w-3" />
                            {deal._count.syndications} investor{deal._count.syndications !== 1 ? "s" : ""}
                          </div>
                          <span className={`font-bold tabular-nums ${percentFilled >= 90 ? "text-profit" : "text-navy-700"}`}>
                            {formatPercent(percentFilled, 0)} filled
                          </span>
                        </div>
                        <Progress
                          value={percentFilled}
                          className="h-2 rounded-full"
                          indicatorClassName={
                            percentFilled >= 90
                              ? "bg-profit rounded-full"
                              : percentFilled >= 50
                                ? "bg-navy-500 rounded-full"
                                : "bg-navy-300 rounded-full"
                          }
                        />
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-steel-500">
                            {formatCurrency(totalSyndicated)} committed
                          </span>
                          <span className="font-medium text-navy-600">
                            {formatCurrency(Number(deal.syndicationOpen))} open
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="border-t border-border/40 bg-navy-50/40 px-5 py-2.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-navy-600 group-hover:text-navy-800">
                          <span>Invest Now</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* All Deals Table */}
      {otherDeals.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-steel-100">
              <BarChart3 className="h-3.5 w-3.5 text-steel-500" />
            </div>
            <h2 className="text-base font-semibold text-navy-800">
              All Deals
            </h2>
            <span className="rounded-full bg-steel-100 px-2 py-0.5 text-xs font-medium text-steel-600">
              {otherDeals.length}
            </span>
          </div>
          <Card className="border-border/60 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-steel-50/70">
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-steel-500">
                        Merchant
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-steel-500">
                        Status
                      </th>
                      <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500">
                        Funded
                      </th>
                      <th className="hidden px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500 md:table-cell">
                        Payback
                      </th>
                      <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500">
                        Collected
                      </th>
                      <th className="hidden px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500 lg:table-cell">
                        Return
                      </th>
                      <th className="hidden px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-steel-500 md:table-cell">
                        Investors
                      </th>
                      <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500">
                        Collection
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {otherDeals.map((deal) => {
                      const fundedAmt = Number(deal.fundedAmount);
                      const paybackAmt = Number(deal.paybackAmount);
                      const collectedAmt = Number(deal.totalCollected);
                      const collectionPct = paybackAmt > 0 ? (collectedAmt / paybackAmt) * 100 : 0;
                      const isInProfit = collectedAmt > fundedAmt;
                      const projectedReturn = ((paybackAmt - fundedAmt) / fundedAmt * 100);
                      const isDelinquent = deal.status === "DELINQUENT";
                      const isPaidOff = deal.status === "PAID_OFF";

                      return (
                        <tr
                          key={deal.id}
                          className={`group transition-colors hover:bg-navy-50/30 ${isDelinquent ? "bg-warning-light/20" : ""}`}
                        >
                          <td className="px-5 py-3.5">
                            <Link
                              href={`/deals/${deal.id}`}
                              className="font-semibold text-navy-800 group-hover:text-navy-600"
                            >
                              {deal.merchantName}
                            </Link>
                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-steel-400">
                              {deal.merchantIndustry && <span>{deal.merchantIndustry}</span>}
                              {deal.merchantIndustry && deal.merchantState && <span className="text-steel-200">&middot;</span>}
                              {deal.merchantState && <span>{deal.merchantState}</span>}
                              {deal.termDays && (
                                <>
                                  <span className="text-steel-200">&middot;</span>
                                  <span>{deal.termDays}d term</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <StatusBadge status={deal.status} />
                              {isDelinquent && deal.missedPayments > 0 && (
                                <span className="flex items-center gap-0.5 text-[10px] font-medium text-warning">
                                  <AlertTriangle className="h-3 w-3" />
                                  {deal.missedPayments}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-navy-900">
                            {formatCurrency(fundedAmt)}
                          </td>
                          <td className="hidden px-5 py-3.5 text-right tabular-nums text-steel-600 md:table-cell">
                            {formatCurrency(paybackAmt)}
                          </td>
                          <td className="px-5 py-3.5 text-right tabular-nums">
                            <span className={`font-semibold ${isInProfit ? "text-profit" : isPaidOff ? "text-profit" : "text-navy-800"}`}>
                              {formatCurrency(collectedAmt)}
                            </span>
                          </td>
                          <td className="hidden px-5 py-3.5 text-right lg:table-cell">
                            <span className="rounded-md bg-profit/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-profit">
                              {projectedReturn.toFixed(1)}%
                            </span>
                          </td>
                          <td className="hidden px-5 py-3.5 text-center md:table-cell">
                            <span className="text-steel-600">{deal._count.syndications}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-2.5">
                              <Progress
                                value={collectionPct}
                                className="h-2 w-20 rounded-full"
                                indicatorClassName={
                                  isPaidOff
                                    ? "bg-profit rounded-full"
                                    : isDelinquent
                                      ? "bg-warning rounded-full"
                                      : collectionPct >= 70
                                        ? "bg-profit rounded-full"
                                        : "bg-navy-400 rounded-full"
                                }
                              />
                              <span className={`w-10 text-right text-xs font-semibold tabular-nums ${
                                isPaidOff ? "text-profit" : isDelinquent ? "text-warning" : "text-steel-600"
                              }`}>
                                {formatPercent(collectionPct, 0)}
                              </span>
                              {isPaidOff && (
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
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
