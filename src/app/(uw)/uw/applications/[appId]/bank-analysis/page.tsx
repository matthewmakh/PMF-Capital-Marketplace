import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenueTrendChart } from "@/components/uw/bank/revenue-trend-chart";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import type { BankStatementMetrics } from "@/lib/uw/statements/types";

export default async function BankAnalysisPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  const app = await prisma.uwApplication.findUnique({
    where: { id: appId },
    include: { bankAnalyses: { orderBy: { createdAt: "desc" } } },
  });
  if (!app) notFound();

  const latest = app.bankAnalyses[0];
  const metrics = latest
    ? (latest.metricsJson as unknown as BankStatementMetrics)
    : null;

  return (
    <div>
      <PageHeader
        title="Bank Statement Analysis"
        description={app.legalName}
      >
        <Link
          href={`/uw/applications/${appId}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-navy-600 hover:text-navy-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to summary
        </Link>
      </PageHeader>

      {!metrics ? (
        <Card>
          <CardContent className="px-5 py-12 text-center text-sm text-steel-500">
            No bank analysis on file yet. Upload bank statements and run
            analytics from the summary page.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Revenue trend ·{" "}
                <span className="text-sm font-normal text-steel-500">
                  {formatDate(metrics.period.start)} →{" "}
                  {formatDate(metrics.period.end)} ({metrics.period.monthCount} mo)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueTrendChart data={metrics.revenue.monthlyByMonth} />
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Block
                  label="Gross deposits"
                  value={formatCurrency(metrics.revenue.grossDeposits)}
                />
                <Block
                  label="True revenue"
                  value={formatCurrency(metrics.revenue.trueRevenue)}
                />
                <Block
                  label="Trend slope"
                  value={`${metrics.revenue.trendSlope >= 0 ? "+" : ""}${metrics.revenue.trendSlope.toFixed(0)} / mo`}
                />
                <Block
                  label="Revenue CV"
                  value={`${metrics.revenue.cvPct.toFixed(0)}%`}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Liquidity &amp; Risk</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <Block
                  label="Avg daily balance"
                  value={formatCurrency(metrics.liquidity.avgDailyBalance)}
                />
                <Block
                  label="Median daily balance"
                  value={formatCurrency(metrics.liquidity.medianDailyBalance)}
                />
                <Block
                  label="Minimum balance"
                  value={formatCurrency(metrics.liquidity.minBalance)}
                  tone={metrics.liquidity.minBalance < 0 ? "danger" : undefined}
                />
                <Block
                  label="Ending balance"
                  value={formatCurrency(metrics.liquidity.endingBalance)}
                />
                <Block
                  label="Total negative days"
                  value={String(metrics.riskEvents.totalNegativeDays)}
                  tone={
                    metrics.riskEvents.totalNegativeDays > 10 ? "danger" : undefined
                  }
                />
                <Block
                  label="NSFs / Overdrafts"
                  value={`${metrics.riskEvents.nsfCount} / ${metrics.riskEvents.overdraftCount}`}
                  tone={metrics.riskEvents.nsfCount >= 5 ? "danger" : undefined}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Deposit Quality</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <Block
                  label="Total deposits"
                  value={String(metrics.depositQuality.depositCount)}
                />
                <Block
                  label="Avg deposit size"
                  value={formatCurrency(metrics.depositQuality.avgDepositSize)}
                />
                <Block
                  label="Cash"
                  value={formatCurrency(metrics.depositQuality.sourceMix.cash)}
                />
                <Block
                  label="ACH"
                  value={formatCurrency(metrics.depositQuality.sourceMix.ach)}
                />
                <Block
                  label="Card settlements"
                  value={formatCurrency(metrics.depositQuality.sourceMix.card)}
                />
                <Block
                  label="Other"
                  value={formatCurrency(metrics.depositQuality.sourceMix.other)}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Detected Open MCA Positions ({metrics.positions.detected.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {metrics.positions.detected.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-steel-500">
                  No existing positions detected.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-border/40 bg-steel-50/70 text-[11px] font-semibold uppercase tracking-wider text-steel-500">
                    <tr>
                      <th className="px-5 py-2 text-left">Funder</th>
                      <th className="px-5 py-2 text-right">Daily</th>
                      <th className="px-5 py-2 text-right">Weekly</th>
                      <th className="px-5 py-2 text-right">Occurrences</th>
                      <th className="px-5 py-2 text-right">First seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {metrics.positions.detected.map((p) => (
                      <tr key={p.funder}>
                        <td className="px-5 py-2 font-medium text-navy-800">
                          {p.funder}
                        </td>
                        <td className="px-5 py-2 text-right tabular-nums">
                          {p.dailyAmount > 0 ? formatCurrency(p.dailyAmount) : "—"}
                        </td>
                        <td className="px-5 py-2 text-right tabular-nums">
                          {p.weeklyAmount > 0
                            ? formatCurrency(p.weeklyAmount)
                            : "—"}
                        </td>
                        <td className="px-5 py-2 text-right tabular-nums text-steel-600">
                          {p.occurrences}
                        </td>
                        <td className="px-5 py-2 text-right text-steel-600">
                          {formatDate(p.firstSeen)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="border-t border-border/40 px-5 py-2 text-xs text-steel-600">
                Total daily debit:{" "}
                <span className="font-semibold text-navy-800 tabular-nums">
                  {formatCurrency(metrics.positions.totalDailyDebit)}
                </span>{" "}
                · MCA-debit / deposit ratio:{" "}
                <span className="font-semibold text-navy-800 tabular-nums">
                  {Math.round(metrics.positions.debitToDepositRatio * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {metrics.depositQuality.largeIrregularDeposits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Flagged Large / Irregular Deposits
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/40 bg-steel-50/70 text-[11px] font-semibold uppercase tracking-wider text-steel-500">
                    <tr>
                      <th className="px-5 py-2 text-left">Date</th>
                      <th className="px-5 py-2 text-right">Amount</th>
                      <th className="px-5 py-2 text-left">Memo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {metrics.depositQuality.largeIrregularDeposits.map((d, i) => (
                      <tr key={i}>
                        <td className="px-5 py-2 text-steel-700">
                          {formatDate(d.date)}
                        </td>
                        <td className="px-5 py-2 text-right tabular-nums">
                          {formatCurrency(d.amount)}
                        </td>
                        <td className="px-5 py-2 text-steel-600">{d.memo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {metrics.flags.length > 0 && (
            <Card className="border-warning/30 bg-warning-light/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  Risk flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-navy-800">
                  {metrics.flags.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {app.bankAnalyses.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Analysis history</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <ul className="divide-y divide-border/40">
                  {app.bankAnalyses.map((a, idx) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between px-5 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-navy-800">
                          {a.source === "plaid"
                            ? "Plaid live"
                            : "Azure Document Intelligence"}
                          {idx === 0 && (
                            <Badge variant="success" className="ml-2">
                              Latest
                            </Badge>
                          )}
                        </p>
                        <p className="text-[11px] text-steel-500">
                          {formatDate(a.periodStart)} → {formatDate(a.periodEnd)}
                        </p>
                      </div>
                      <span className="text-xs text-steel-500">
                        {formatDate(a.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Block({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger";
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-steel-500">
        {label}
      </p>
      <p
        className={`mt-0.5 text-base font-semibold tabular-nums ${
          tone === "danger" ? "text-danger" : "text-navy-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
