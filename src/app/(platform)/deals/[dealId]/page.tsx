import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import { canInvest, isAdmin } from "@/lib/permissions";
import { calculateBreakEven } from "@/lib/calculations/pro-rata";
import { SyndicationForm } from "./syndication-form";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Banknote,
  Target,
  BarChart3,
  Percent,
  CalendarDays,
  Hash,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
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
        orderBy: { amount: "desc" },
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

  // Key calculations
  const fundedAmt = Number(deal.fundedAmount);
  const paybackAmt = Number(deal.paybackAmount);
  const collectedAmt = Number(deal.totalCollected);
  const openAmt = Number(deal.syndicationOpen);
  const totalSyndicated = fundedAmt - openAmt;
  const percentFilled = fundedAmt > 0 ? (totalSyndicated / fundedAmt) * 100 : 0;
  const percentCollected = paybackAmt > 0 ? (collectedAmt / paybackAmt) * 100 : 0;
  const principalRecaptured = Math.min(collectedAmt, fundedAmt);
  const principalPct = fundedAmt > 0 ? (principalRecaptured / fundedAmt) * 100 : 0;
  const profitDistributed = Math.max(collectedAmt - fundedAmt, 0);
  const projectedReturn = paybackAmt - fundedAmt;
  const returnPct = fundedAmt > 0 ? (projectedReturn / fundedAmt) * 100 : 0;
  const isInProfit = collectedAmt > fundedAmt;

  // Break-even
  const nonReversedPayments = deal.payments.filter((p) => !p.isReversed);
  const paymentsToBreakEven = calculateBreakEven(
    deal.fundedAmount.toString(),
    deal.totalCollected.toString(),
    nonReversedPayments.map((p) => ({ amount: p.amount.toString() }))
  );

  const showSyndicationForm =
    canInvest(session.user.role) &&
    deal.status === "OPEN_FOR_SYNDICATION" &&
    openAmt > 0 &&
    !userSyndication;

  const showAdminLink = isAdmin(session.user.role);

  return (
    <div>
      {/* Back nav + header */}
      <div className="mb-6">
        <Link
          href="/deals"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-steel-500 hover:text-navy-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Marketplace
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-navy-900">
                {deal.merchantName}
              </h1>
              <StatusBadge status={deal.status} />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-steel-500">
              {deal.merchantDba && deal.merchantDba !== deal.merchantName && (
                <span>DBA: {deal.merchantDba}</span>
              )}
              {deal.merchantIndustry && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {deal.merchantIndustry}
                </span>
              )}
              {deal.merchantState && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {deal.merchantState}
                </span>
              )}
              {deal.termDays && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {deal.termDays}-day term
                </span>
              )}
              {deal.paymentFrequency && (
                <span className="capitalize">{deal.paymentFrequency} payments</span>
              )}
            </div>
          </div>
          {showAdminLink && (
            <Link
              href={`/admin/deals/${deal.id}/payments`}
              className="shrink-0 rounded-lg bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 transition-colors"
            >
              Post Payment
            </Link>
          )}
        </div>
      </div>

      {/* Delinquency warning */}
      {deal.missedPayments > 0 && (
        <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-warning/30 bg-warning-light px-4 py-3">
          <AlertTriangle className="h-4.5 w-4.5 text-warning shrink-0" />
          <div>
            <p className="text-sm font-semibold text-warning">
              {deal.missedPayments} Missed Payment{deal.missedPayments !== 1 ? "s" : ""}
            </p>
            {deal.lastPaymentAt && (
              <p className="text-xs text-warning/80">
                Last payment received {formatDate(deal.lastPaymentAt)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Deal financials grid */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-border/40 sm:grid-cols-4 lg:grid-cols-6">
            {[
              { label: "Funded Amount", value: formatCurrency(fundedAmt), color: "text-navy-900" },
              { label: "Payback Amount", value: formatCurrency(paybackAmt), color: "text-navy-900" },
              { label: "Factor Rate", value: `${Number(deal.factorRate).toFixed(2)}x`, color: "text-navy-900" },
              { label: "Projected Return", value: `${returnPct.toFixed(1)}%`, color: "text-profit" },
              { label: "Total Collected", value: formatCurrency(collectedAmt), color: isInProfit ? "text-profit" : "text-navy-900" },
              { label: "Remaining", value: formatCurrency(Math.max(paybackAmt - collectedAmt, 0)), color: "text-steel-600" },
            ].map((item) => (
              <div key={item.label} className="px-4 py-4 text-center sm:px-5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-steel-400">
                  {item.label}
                </p>
                <p className={`mt-1 text-lg font-bold tabular-nums ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payback progress */}
      <Card className="mb-6">
        <CardContent className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-steel-400" />
              <span className="text-sm font-semibold text-navy-800">
                Repayment Progress
              </span>
            </div>
            <span className="text-sm font-bold tabular-nums text-navy-700">
              {formatPercent(percentCollected, 1)}
            </span>
          </div>
          <Progress
            value={percentCollected}
            className="h-3 rounded-full"
            indicatorClassName={
              percentCollected >= 100
                ? "bg-profit rounded-full"
                : isInProfit
                  ? "bg-profit rounded-full"
                  : principalPct >= 100
                    ? "bg-navy-500 rounded-full"
                    : "bg-navy-400 rounded-full"
            }
          />
          {/* Progress markers */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-navy-400" />
              <span className="text-steel-500">
                Principal: {formatPercent(principalPct, 0)}
                {principalPct >= 100 && (
                  <CheckCircle2 className="ml-1 inline h-3 w-3 text-profit" />
                )}
              </span>
            </div>
            {paymentsToBreakEven !== null && paymentsToBreakEven > 0 && (
              <span className="font-medium text-navy-600">
                ~{paymentsToBreakEven} payments to break-even
              </span>
            )}
            {isInProfit && (
              <span className="flex items-center gap-1 font-semibold text-profit">
                <CheckCircle2 className="h-3.5 w-3.5" />
                In Profit — {formatCurrency(profitDistributed)} earned
              </span>
            )}
            <span className="tabular-nums text-steel-400">
              {formatCurrency(collectedAmt)} / {formatCurrency(paybackAmt)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ===== LEFT COLUMN (2/3) ===== */}
        <div className="space-y-5 lg:col-span-2">
          {/* Deal details grid */}
          <Card>
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
                Deal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                {deal.expectedPayments && (
                  <div className="flex items-start gap-2">
                    <Hash className="mt-0.5 h-3.5 w-3.5 text-steel-400 shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase text-steel-400">Expected Payments</p>
                      <p className="font-semibold text-navy-900">{deal.expectedPayments}</p>
                    </div>
                  </div>
                )}
                {nonReversedPayments.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Banknote className="mt-0.5 h-3.5 w-3.5 text-steel-400 shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase text-steel-400">Payments Made</p>
                      <p className="font-semibold text-navy-900">{nonReversedPayments.length}</p>
                    </div>
                  </div>
                )}
                {deal.fundedAt && (
                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-3.5 w-3.5 text-steel-400 shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase text-steel-400">Funded Date</p>
                      <p className="font-semibold text-navy-900">{formatDate(deal.fundedAt)}</p>
                    </div>
                  </div>
                )}
                {deal.firstPaymentAt && (
                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-3.5 w-3.5 text-steel-400 shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase text-steel-400">First Payment</p>
                      <p className="font-semibold text-navy-900">{formatDate(deal.firstPaymentAt)}</p>
                    </div>
                  </div>
                )}
                {deal.lastPaymentAt && (
                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-3.5 w-3.5 text-steel-400 shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase text-steel-400">Last Payment</p>
                      <p className="font-semibold text-navy-900">{formatDate(deal.lastPaymentAt)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Percent className="mt-0.5 h-3.5 w-3.5 text-steel-400 shrink-0" />
                  <div>
                    <p className="text-[11px] uppercase text-steel-400">Min Investment</p>
                    <p className="font-semibold text-navy-900">{formatCurrency(Number(deal.syndicationMin))}</p>
                  </div>
                </div>
              </div>
              {deal.notes && (
                <div className="mt-4 rounded-lg bg-steel-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase text-steel-400 mb-1">Notes</p>
                  <p className="text-sm text-steel-600 whitespace-pre-wrap">{deal.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Syndicate investors */}
          <Card>
            <CardHeader className="border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
                  Syndicate
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-steel-500">
                  <Users className="h-3.5 w-3.5" />
                  {deal.syndications.length} investor{deal.syndications.length !== 1 ? "s" : ""}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {deal.syndications.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-8 w-8 text-steel-200" />
                  <p className="mt-2 text-sm text-steel-400">No investors yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {deal.syndications.map((s) => {
                    const pct = Number(s.ownershipPct);
                    const returned = Number(s.totalDistributed);
                    const invested = Number(s.amount);
                    const returnedPct = invested > 0 ? (returned / invested) * 100 : 0;
                    return (
                      <div key={s.id} className="flex items-center gap-4 py-3.5">
                        {/* Initials */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-700">
                          {s.user.firstName[0]}{s.user.lastName[0]}
                        </div>
                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-navy-900">
                              {s.user.firstName} {s.user.lastName}
                            </p>
                            {s.userId === session.user.id && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">You</Badge>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-3 text-xs text-steel-500">
                            <span>{formatPercent(pct)} ownership</span>
                            <span className="text-steel-300">|</span>
                            <span>{formatPercent(returnedPct, 0)} returned</span>
                          </div>
                        </div>
                        {/* Amount */}
                        <div className="text-right">
                          <p className="text-sm font-bold tabular-nums text-navy-900">
                            {formatCurrency(invested)}
                          </p>
                          <p className={`text-xs tabular-nums ${returned > 0 ? "text-profit" : "text-steel-400"}`}>
                            {returned > 0 ? "+" : ""}{formatCurrency(returned)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment history */}
          {deal.payments.length > 0 && (
            <Card>
              <CardHeader className="border-b border-border/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
                    Recent Payments
                  </CardTitle>
                  <span className="text-xs text-steel-400">
                    {nonReversedPayments.length} active / {deal.payments.length} total
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border/40">
                  {deal.payments.map((p) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 py-3 ${p.isReversed ? "opacity-50" : ""}`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          p.isReversed
                            ? "bg-danger-light"
                            : "bg-profit-light"
                        }`}
                      >
                        {p.isReversed ? (
                          <ArrowDownRight className="h-3.5 w-3.5 text-danger" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-profit" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-navy-800">
                          Payment #{p.paymentNumber}
                          {p.isReversed && (
                            <span className="ml-2 text-xs font-normal text-danger">REVERSED</span>
                          )}
                        </p>
                        <p className="text-xs text-steel-400">{formatDate(p.paymentDate)}</p>
                      </div>
                      <p
                        className={`text-sm font-bold tabular-nums ${
                          p.isReversed ? "text-danger line-through" : "text-profit"
                        }`}
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

        {/* ===== RIGHT COLUMN (1/3) ===== */}
        <div className="space-y-5">
          {/* Syndication progress */}
          <Card>
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
                Syndication Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4 text-center">
                <p className="text-3xl font-bold tabular-nums text-navy-900">
                  {formatPercent(percentFilled, 0)}
                </p>
                <p className="text-xs text-steel-500">funded</p>
              </div>
              <Progress
                value={percentFilled}
                className="h-2.5 rounded-full"
                indicatorClassName={
                  percentFilled >= 100
                    ? "bg-profit rounded-full"
                    : percentFilled >= 75
                      ? "bg-navy-500 rounded-full"
                      : "bg-navy-300 rounded-full"
                }
              />
              <div className="mt-4 space-y-2.5">
                {[
                  { label: "Target", value: formatCurrency(fundedAmt), color: "text-navy-900" },
                  { label: "Committed", value: formatCurrency(totalSyndicated), color: "text-navy-900" },
                  { label: "Remaining", value: formatCurrency(openAmt), color: openAmt > 0 ? "text-warning" : "text-profit" },
                  { label: "Investors", value: String(deal.syndications.length), color: "text-navy-900" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-steel-500">{row.label}</span>
                    <span className={`font-semibold tabular-nums ${row.color}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Your investment */}
          {userSyndication && (
            <Card className="border-navy-200/60 bg-gradient-to-b from-navy-50/50 to-white">
              <CardHeader className="border-b border-navy-100/60">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-navy-600">
                  Your Investment
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4 text-center">
                  <p className="text-2xl font-bold tabular-nums text-navy-900">
                    {formatCurrency(Number(userSyndication.amount))}
                  </p>
                  <p className="text-xs text-steel-500">
                    {formatPercent(Number(userSyndication.ownershipPct))} ownership
                  </p>
                </div>
                <div className="space-y-2.5">
                  {[
                    {
                      label: "Principal Returned",
                      value: formatCurrency(Number(userSyndication.principalReturned)),
                      color: Number(userSyndication.principalReturned) > 0 ? "text-navy-900" : "text-steel-400",
                    },
                    {
                      label: "Profit Earned",
                      value: formatCurrency(Number(userSyndication.profitEarned)),
                      color: Number(userSyndication.profitEarned) > 0 ? "text-profit" : "text-steel-400",
                    },
                    {
                      label: "Total Distributed",
                      value: formatCurrency(Number(userSyndication.totalDistributed)),
                      color: Number(userSyndication.totalDistributed) > 0 ? "text-profit" : "text-steel-400",
                    },
                    {
                      label: "Projected Return",
                      value: formatCurrency(Number(userSyndication.amount) * (returnPct / 100)),
                      color: "text-navy-600",
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-steel-500">{row.label}</span>
                      <span className={`font-semibold tabular-nums ${row.color}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
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
                  ? Math.min(Number(deal.syndicationMax), openAmt)
                  : openAmt
              }
              remainingCapacity={openAmt}
            />
          )}

          {/* Quick stats for this deal */}
          <Card>
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">
                Deal Health
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-steel-500">Collection Rate</span>
                  <span className={`text-sm font-bold tabular-nums ${percentCollected >= 80 ? "text-profit" : percentCollected >= 40 ? "text-navy-700" : "text-warning"}`}>
                    {formatPercent(percentCollected, 1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-steel-500">Break-even Status</span>
                  {isInProfit ? (
                    <span className="flex items-center gap-1 text-sm font-bold text-profit">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Profitable
                    </span>
                  ) : paymentsToBreakEven === 0 ? (
                    <span className="flex items-center gap-1 text-sm font-bold text-profit">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Reached
                    </span>
                  ) : paymentsToBreakEven ? (
                    <span className="text-sm font-semibold text-navy-700">
                      ~{paymentsToBreakEven} payments
                    </span>
                  ) : (
                    <span className="text-sm text-steel-400">
                      <Minus className="inline h-3.5 w-3.5" /> N/A
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-steel-500">Missed Payments</span>
                  <span className={`text-sm font-bold ${deal.missedPayments > 0 ? "text-danger" : "text-profit"}`}>
                    {deal.missedPayments > 0 ? deal.missedPayments : "None"}
                  </span>
                </div>
                {deal.fundedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-steel-500">Days Active</span>
                    <span className="text-sm font-semibold text-navy-700">
                      {Math.floor((Date.now() - new Date(deal.fundedAt).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
