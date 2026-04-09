import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import Link from "next/link";
import { DealStatus } from "@prisma/client";
import {
  MapPin,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  CircleDollarSign,
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

  return (
    <div>
      <PageHeader
        title="Deal Marketplace"
        description="Browse and invest in active MCA deals"
      />

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
              const totalSyndicated =
                Number(deal.fundedAmount) - Number(deal.syndicationOpen);
              const percentFilled =
                (totalSyndicated / Number(deal.fundedAmount)) * 100;
              const returnRate = (
                ((Number(deal.paybackAmount) - Number(deal.fundedAmount)) /
                  Number(deal.fundedAmount)) *
                100
              ).toFixed(1);

              return (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <Card className="group h-full border-border/60 transition-all hover:border-navy-300 hover:shadow-lg">
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className="border-b border-border/40 bg-steel-50/50 px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold text-navy-900">
                              {deal.merchantName}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-steel-500">
                              {deal.merchantIndustry && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {deal.merchantIndustry}
                                </span>
                              )}
                              {deal.merchantState && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {deal.merchantState}
                                </span>
                              )}
                              {deal.termDays && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {deal.termDays} days
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="shrink-0 rounded-md bg-profit/10 px-2 py-1 text-xs font-semibold text-profit">
                            {returnRate}% return
                          </span>
                        </div>
                      </div>

                      {/* Financials */}
                      <div className="px-5 py-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-steel-400">
                              Amount
                            </p>
                            <p className="mt-0.5 text-sm font-bold tabular-nums text-navy-900">
                              {formatCurrency(Number(deal.fundedAmount))}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-steel-400">
                              Factor
                            </p>
                            <p className="mt-0.5 text-sm font-bold tabular-nums text-navy-900">
                              {Number(deal.factorRate).toFixed(2)}x
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-steel-400">
                              Min
                            </p>
                            <p className="mt-0.5 text-sm font-bold tabular-nums text-navy-900">
                              {formatCurrency(Number(deal.syndicationMin))}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="border-t border-border/40 px-5 py-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-steel-500">
                            <Users className="h-3 w-3" />
                            {deal._count.syndications} investor{deal._count.syndications !== 1 ? "s" : ""}
                          </div>
                          <span className="font-semibold tabular-nums text-navy-700">
                            {formatPercent(percentFilled, 0)} filled
                          </span>
                        </div>
                        <Progress
                          value={percentFilled}
                          className="mt-2 h-1.5"
                          indicatorClassName={
                            percentFilled >= 90
                              ? "bg-profit"
                              : percentFilled >= 50
                                ? "bg-navy-500"
                                : "bg-navy-300"
                          }
                        />
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-steel-400">
                          <span>
                            {formatCurrency(totalSyndicated)} committed
                          </span>
                          <span>
                            {formatCurrency(Number(deal.syndicationOpen))} open
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="border-t border-border/40 bg-navy-50/30 px-5 py-2.5">
                        <div className="flex items-center justify-between text-xs font-medium text-navy-600 group-hover:text-navy-800">
                          <span>View Deal Details</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
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

      {otherDeals.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-base font-semibold text-navy-800">
              All Deals
            </h2>
            <span className="rounded-full bg-steel-100 px-2 py-0.5 text-xs font-medium text-steel-600">
              {otherDeals.length}
            </span>
          </div>
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-steel-50/70">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                        Merchant
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                        Status
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-steel-500">
                        Funded
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-steel-500">
                        Payback
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-steel-500">
                        Collected
                      </th>
                      <th className="hidden px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-steel-500 md:table-cell">
                        Investors
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-steel-500">
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {otherDeals.map((deal) => {
                      const pct =
                        Number(deal.paybackAmount) > 0
                          ? (Number(deal.totalCollected) /
                              Number(deal.paybackAmount)) *
                            100
                          : 0;
                      return (
                        <tr
                          key={deal.id}
                          className="group transition-colors hover:bg-navy-50/30"
                        >
                          <td className="px-5 py-3.5">
                            <Link
                              href={`/deals/${deal.id}`}
                              className="font-medium text-navy-800 group-hover:text-navy-600"
                            >
                              {deal.merchantName}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              {deal.merchantIndustry && (
                                <span className="text-[11px] text-steel-400">
                                  {deal.merchantIndustry}
                                </span>
                              )}
                              {deal.merchantState && (
                                <span className="text-[11px] text-steel-400">
                                  {deal.merchantState}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={deal.status} />
                          </td>
                          <td className="px-5 py-3.5 text-right tabular-nums font-medium">
                            {formatCurrency(Number(deal.fundedAmount))}
                          </td>
                          <td className="px-5 py-3.5 text-right tabular-nums text-steel-600">
                            {formatCurrency(Number(deal.paybackAmount))}
                          </td>
                          <td className="px-5 py-3.5 text-right tabular-nums">
                            <span
                              className={
                                Number(deal.totalCollected) >=
                                Number(deal.fundedAmount)
                                  ? "text-profit font-medium"
                                  : "text-steel-700"
                              }
                            >
                              {formatCurrency(Number(deal.totalCollected))}
                            </span>
                          </td>
                          <td className="hidden px-5 py-3.5 text-center text-steel-500 md:table-cell">
                            {deal._count.syndications}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <Progress
                                value={pct}
                                className="h-1.5 w-16"
                                indicatorClassName={
                                  pct >= 100
                                    ? "bg-profit"
                                    : pct >= 50
                                      ? "bg-navy-400"
                                      : "bg-steel-300"
                                }
                              />
                              <span className="w-10 text-right text-xs tabular-nums text-steel-500">
                                {formatPercent(pct, 0)}
                              </span>
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
