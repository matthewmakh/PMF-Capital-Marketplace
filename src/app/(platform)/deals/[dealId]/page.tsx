import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import { canInvest } from "@/lib/permissions";
import { calculateBreakEven } from "@/lib/calculations/pro-rata";
import { SyndicationForm } from "./syndication-form";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Target,
} from "lucide-react";

interface Props {
  params: Promise<{ dealId: string }>;
}

export default async function DealDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { dealId } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: {
      syndications: {
        include: { user: { select: { firstName: true, lastName: true } } },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
        take: 20,
      },
    },
  });

  if (!deal) notFound();

  const userSyndication = deal.syndications.find(
    (s) => s.userId === session.user.id
  );

  const totalSyndicated =
    Number(deal.fundedAmount) - Number(deal.syndicationOpen);
  const percentFilled = (totalSyndicated / Number(deal.fundedAmount)) * 100;
  const percentCollected =
    Number(deal.paybackAmount) > 0
      ? (Number(deal.totalCollected) / Number(deal.paybackAmount)) * 100
      : 0;
  const principalRecaptured = Math.min(
    Number(deal.totalCollected),
    Number(deal.fundedAmount)
  );
  const profitDistributed = Math.max(
    Number(deal.totalCollected) - Number(deal.fundedAmount),
    0
  );

  // Break-even calculation — exclude reversed payments
  const nonReversedPayments = deal.payments.filter((p) => !p.isReversed);
  const paymentsToBreakEven = calculateBreakEven(
    deal.fundedAmount.toString(),
    deal.totalCollected.toString(),
    nonReversedPayments.map((p) => ({ amount: p.amount.toString() }))
  );

  const showSyndicationForm =
    canInvest(session.user.role) &&
    deal.status === "OPEN_FOR_SYNDICATION" &&
    Number(deal.syndicationOpen) > 0 &&
    !userSyndication;

  return (
    <div>
      <PageHeader title={deal.merchantName}>
        <StatusBadge status={deal.status} />
      </PageHeader>

      {/* Deal info bar */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
        {deal.merchantDba && deal.merchantDba !== deal.merchantName && (
          <span>DBA: {deal.merchantDba}</span>
        )}
        {deal.merchantIndustry && <span>{deal.merchantIndustry}</span>}
        {deal.merchantState && <span>{deal.merchantState}</span>}
        {deal.termDays && <span>{deal.termDays}-day term</span>}
        {deal.paymentFrequency && <span>{deal.paymentFrequency} payments</span>}
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Funded Amount"
          value={formatCurrency(Number(deal.fundedAmount))}
          icon={DollarSign}
        />
        <StatCard
          title="Total Payback"
          value={formatCurrency(Number(deal.paybackAmount))}
          subtitle={`${Number(deal.factorRate).toFixed(2)}x factor rate`}
          icon={Target}
        />
        <StatCard
          title="Total Collected"
          value={formatCurrency(Number(deal.totalCollected))}
          subtitle={formatPercent(percentCollected) + " of payback"}
          icon={TrendingUp}
          trend={Number(deal.totalCollected) > 0 ? "up" : "neutral"}
        />
        <StatCard
          title={
            profitDistributed > 0 ? "Profit Distributed" : "Principal Recovered"
          }
          value={formatCurrency(
            profitDistributed > 0 ? profitDistributed : principalRecaptured
          )}
          subtitle={
            paymentsToBreakEven !== null && paymentsToBreakEven > 0
              ? `${paymentsToBreakEven} payments to break-even`
              : profitDistributed > 0
                ? "In profit"
                : undefined
          }
          icon={profitDistributed > 0 ? CheckCircle : Calendar}
          trend={profitDistributed > 0 ? "up" : "neutral"}
        />
      </div>

      {/* Payback progress bar */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Payback Progress</span>
            <span className="tabular-nums">
              {formatCurrency(Number(deal.totalCollected))} /{" "}
              {formatCurrency(Number(deal.paybackAmount))}
            </span>
          </div>
          <Progress
            value={percentCollected}
            className="h-3"
            indicatorClassName={
              percentCollected >= 100
                ? "bg-profit"
                : percentCollected >=
                    (Number(deal.fundedAmount) / Number(deal.paybackAmount)) *
                      100
                  ? "bg-navy-500"
                  : "bg-warning"
            }
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>
              Principal:{" "}
              {formatPercent(
                (principalRecaptured / Number(deal.fundedAmount)) * 100
              )}
            </span>
            {deal.missedPayments > 0 && (
              <span className="flex items-center gap-1 text-warning">
                <AlertTriangle className="h-3 w-3" />
                {deal.missedPayments} missed payments
              </span>
            )}
            <span>{formatPercent(percentCollected)} collected</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes */}
          {deal.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Deal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {deal.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Syndicate investors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Syndicate ({deal.syndications.length} investors)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deal.syndications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No investors yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {deal.syndications.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {s.user.firstName} {s.user.lastName}
                          {s.userId === session.user.id && (
                            <Badge variant="secondary" className="ml-2">
                              You
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPercent(Number(s.ownershipPct))} ownership
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrency(Number(s.amount))}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          Returned: {formatCurrency(Number(s.totalDistributed))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent payments */}
          {deal.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deal.payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          Payment #{p.paymentNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(p.paymentDate)}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-semibold tabular-nums ${p.isReversed ? "text-danger line-through" : "text-profit"}`}
                      >
                        {p.isReversed ? "" : "+"}
                        {formatCurrency(Number(p.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Syndication progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Syndication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(Number(deal.fundedAmount))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Committed</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(totalSyndicated)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(Number(deal.syndicationOpen))}
                  </span>
                </div>
                <Progress
                  value={percentFilled}
                  className="h-2"
                  indicatorClassName="bg-navy-500"
                />
                <p className="text-xs text-center text-muted-foreground">
                  {formatPercent(percentFilled, 0)} filled
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User's investment */}
          {userSyndication && (
            <Card className="border-navy-200 bg-navy-50/50">
              <CardHeader>
                <CardTitle className="text-base">Your Investment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invested</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(Number(userSyndication.amount))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ownership</span>
                  <span className="font-semibold">
                    {formatPercent(Number(userSyndication.ownershipPct))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Principal Returned
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(Number(userSyndication.principalReturned))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Profit Earned</span>
                  <span className="font-semibold tabular-nums text-profit">
                    {formatCurrency(Number(userSyndication.profitEarned))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Distributed
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(Number(userSyndication.totalDistributed))}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Syndication form */}
          {showSyndicationForm && (
            <SyndicationForm
              dealId={deal.id}
              minAmount={Number(deal.syndicationMin)}
              maxAmount={
                deal.syndicationMax
                  ? Math.min(
                      Number(deal.syndicationMax),
                      Number(deal.syndicationOpen)
                    )
                  : Number(deal.syndicationOpen)
              }
              remainingCapacity={Number(deal.syndicationOpen)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
