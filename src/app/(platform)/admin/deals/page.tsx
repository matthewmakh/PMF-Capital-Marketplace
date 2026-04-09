import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Plus,
  FileText,
  AlertTriangle,
  Banknote,
  Clock,
  MapPin,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { DealStatusActions } from "./deal-status-actions";

export default async function AdminDealsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const deals = await prisma.deal.findMany({
    include: {
      _count: { select: { syndications: true, payments: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingDeals = deals.filter((d) => d.status === "PENDING_REVIEW");
  const otherDeals = deals.filter((d) => d.status !== "PENDING_REVIEW");

  // Summary
  const totalCapital = deals.reduce((s, d) => s + Number(d.fundedAmount), 0);
  const totalCollected = deals.reduce((s, d) => s + Number(d.totalCollected), 0);
  const activeCount = deals.filter((d) => d.status === "ACTIVE_REPAYING").length;
  const delinquentCount = deals.filter((d) => d.status === "DELINQUENT").length;

  return (
    <div>
      <PageHeader title="Manage Deals" description="Review, create, and manage all deals">
        <Link href="/admin/deals/create">
          <Button className="bg-navy-700 hover:bg-navy-800">
            <Plus className="h-4 w-4 mr-2" />
            Create Deal
          </Button>
        </Link>
      </PageHeader>

      {/* Summary strip */}
      <Card className="mb-5">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-border/40 sm:grid-cols-4">
            {[
              { label: "Total Deals", value: String(deals.length) },
              { label: "Active", value: String(activeCount), color: "text-profit" },
              { label: "Delinquent", value: String(delinquentCount), color: delinquentCount > 0 ? "text-warning" : "text-steel-600" },
              { label: "Total Capital", value: formatCurrency(totalCapital) },
            ].map((item) => (
              <div key={item.label} className="px-4 py-3 text-center sm:px-5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-steel-400">{item.label}</p>
                <p className={`mt-0.5 text-lg font-bold tabular-nums ${item.color || "text-navy-900"}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending review */}
      {pendingDeals.length > 0 && (
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-warning/10">
              <Clock className="h-3.5 w-3.5 text-warning" />
            </div>
            <h2 className="text-base font-semibold text-navy-800">Pending Review</h2>
            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-bold text-warning">
              {pendingDeals.length}
            </span>
          </div>
          <div className="space-y-3">
            {pendingDeals.map((deal) => (
              <Card key={deal.id} className="border-warning/20 bg-warning-light/10">
                <CardContent className="px-5 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/deals/${deal.id}`}
                          className="truncate text-base font-bold text-navy-800 hover:text-navy-600"
                        >
                          {deal.merchantName}
                        </Link>
                        <span className="shrink-0 rounded-md bg-profit/10 px-1.5 py-0.5 text-[11px] font-bold text-profit">
                          {Number(deal.factorRate).toFixed(2)}x
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-steel-500">
                        <span className="font-semibold text-navy-700">{formatCurrency(Number(deal.fundedAmount))}</span>
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
                        <span>Created {formatDate(deal.createdAt)}</span>
                        {deal.createdBy && (
                          <span>by {deal.createdBy.firstName} {deal.createdBy.lastName}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/deals/${deal.id}`}>
                        <Button variant="outline" size="sm">
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          Review
                        </Button>
                      </Link>
                      <DealStatusActions dealId={deal.id} currentStatus={deal.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All deals table */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold text-navy-800">All Deals</h2>
          <span className="rounded-full bg-steel-100 px-2 py-0.5 text-xs font-medium text-steel-600">
            {otherDeals.length}
          </span>
        </div>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-steel-50/70">
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-steel-500">Merchant</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-steel-500">Status</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500">Funded</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500">Collected</th>
                    <th className="hidden px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500 lg:table-cell">Collection</th>
                    <th className="hidden px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-steel-500 md:table-cell">Inv.</th>
                    <th className="hidden px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-steel-500 md:table-cell">Pmts</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-steel-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {otherDeals.map((deal) => {
                    const fundedAmt = Number(deal.fundedAmount);
                    const collectedAmt = Number(deal.totalCollected);
                    const paybackAmt = Number(deal.paybackAmount);
                    const collectionPct = paybackAmt > 0 ? (collectedAmt / paybackAmt) * 100 : 0;
                    const isDelinquent = deal.status === "DELINQUENT";
                    const isPaidOff = deal.status === "PAID_OFF";
                    const isActive = deal.status === "ACTIVE_REPAYING";

                    return (
                      <tr key={deal.id} className={`group transition-colors hover:bg-navy-50/30 ${isDelinquent ? "bg-warning-light/20" : ""}`}>
                        <td className="px-5 py-3.5">
                          <Link href={`/deals/${deal.id}`} className="font-semibold text-navy-800 group-hover:text-navy-600">
                            {deal.merchantName}
                          </Link>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-steel-400">
                            {deal.merchantIndustry && <span>{deal.merchantIndustry}</span>}
                            {deal.merchantState && <span>{deal.merchantState}</span>}
                            {deal.termDays && <span>{deal.termDays}d</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status={deal.status} />
                            {isDelinquent && deal.missedPayments > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-warning">
                                <AlertTriangle className="h-3 w-3" />
                                {deal.missedPayments}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-navy-900">
                          {formatCurrency(fundedAmt)}
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums">
                          <span className={collectedAmt >= fundedAmt ? "font-semibold text-profit" : "text-navy-800"}>
                            {formatCurrency(collectedAmt)}
                          </span>
                        </td>
                        <td className="hidden px-5 py-3.5 lg:table-cell">
                          <div className="flex items-center justify-end gap-2">
                            <Progress
                              value={collectionPct}
                              className="h-2 w-16 rounded-full"
                              indicatorClassName={
                                isPaidOff ? "bg-profit rounded-full"
                                  : isDelinquent ? "bg-warning rounded-full"
                                  : "bg-navy-400 rounded-full"
                              }
                            />
                            <span className={`w-10 text-right text-xs font-semibold tabular-nums ${
                              isPaidOff ? "text-profit" : isDelinquent ? "text-warning" : "text-steel-600"
                            }`}>
                              {formatPercent(collectionPct, 0)}
                            </span>
                            {isPaidOff && <CheckCircle2 className="h-3.5 w-3.5 text-profit shrink-0" />}
                          </div>
                        </td>
                        <td className="hidden px-5 py-3.5 text-center text-steel-600 md:table-cell">
                          {deal._count.syndications}
                        </td>
                        <td className="hidden px-5 py-3.5 text-center text-steel-600 md:table-cell">
                          {deal._count.payments}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {(isActive || deal.status === "FUNDED" || deal.status === "DELINQUENT") && (
                              <Link href={`/admin/deals/${deal.id}/payments`}>
                                <Button variant="ghost" size="sm" className="text-xs text-navy-600 hover:text-navy-800">
                                  <Banknote className="h-3.5 w-3.5 mr-1" />
                                  Payment
                                </Button>
                              </Link>
                            )}
                            <DealStatusActions dealId={deal.id} currentStatus={deal.status} />
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
    </div>
  );
}
