import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils";
import Link from "next/link";
import { DealStatus } from "@prisma/client";
import { MapPin, Clock, TrendingUp } from "lucide-react";

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
          <h2 className="mb-4 text-lg font-semibold text-navy-800">
            Open for Syndication
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {openDeals.map((deal) => {
              const totalSyndicated =
                Number(deal.fundedAmount) - Number(deal.syndicationOpen);
              const percentFilled =
                (totalSyndicated / Number(deal.fundedAmount)) * 100;

              return (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-navy-900">
                            {deal.merchantName}
                          </h3>
                          {deal.merchantDba &&
                            deal.merchantDba !== deal.merchantName && (
                              <p className="text-xs text-muted-foreground">
                                DBA: {deal.merchantDba}
                              </p>
                            )}
                        </div>
                        <StatusBadge status={deal.status} />
                      </div>

                      <div className="flex gap-3 text-xs text-muted-foreground mb-4">
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
                            {deal.termDays}d
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Funded Amount
                          </p>
                          <p className="font-semibold tabular-nums">
                            {formatCurrency(Number(deal.fundedAmount))}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Factor Rate
                          </p>
                          <p className="font-semibold tabular-nums">
                            {Number(deal.factorRate).toFixed(2)}x
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Total Payback
                          </p>
                          <p className="font-semibold tabular-nums">
                            {formatCurrency(Number(deal.paybackAmount))}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Min Investment
                          </p>
                          <p className="font-semibold tabular-nums">
                            {formatCurrency(Number(deal.syndicationMin))}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            Syndication Progress
                          </span>
                          <span className="font-medium">
                            {formatPercent(percentFilled, 0)}
                          </span>
                        </div>
                        <Progress
                          value={percentFilled}
                          className="h-2"
                          indicatorClassName="bg-navy-500"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatCurrency(Number(deal.syndicationOpen))}{" "}
                          remaining
                        </p>
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
          <h2 className="mb-4 text-lg font-semibold text-navy-800">
            All Deals
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-steel-50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Merchant
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Funded
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Payback
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Collected
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Factor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherDeals.map((deal) => (
                      <tr
                        key={deal.id}
                        className="border-b hover:bg-steel-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/deals/${deal.id}`}
                            className="font-medium text-navy-700 hover:underline"
                          >
                            {deal.merchantName}
                          </Link>
                          {deal.merchantState && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {deal.merchantState}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={deal.status} />
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatCurrency(Number(deal.fundedAmount))}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatCurrency(Number(deal.paybackAmount))}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatCurrency(Number(deal.totalCollected))}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {Number(deal.factorRate).toFixed(2)}x
                        </td>
                      </tr>
                    ))}
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
