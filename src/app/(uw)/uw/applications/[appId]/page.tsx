import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UwStatusBadge } from "@/components/uw/shared/uw-status-badge";
import { PaperGradeBadge } from "@/components/uw/shared/paper-grade-badge";
import { CopyableLink } from "@/components/uw/shared/copyable-link";
import { ActionButtons } from "@/components/uw/summary/action-buttons";
import { DecisionPanel } from "@/components/uw/summary/decision-panel";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UW_DOC_TYPE_LABELS, UW_REQUIRED_DOC_TYPES } from "@/lib/constants";
import {
  FileText,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  Activity,
  Building2,
  Users,
} from "lucide-react";
import type { BankStatementMetrics } from "@/lib/uw/statements/types";
import type {
  ConsumerCreditResult,
  BusinessCreditResult,
  OfacResult,
  DataMerchResult,
  UccLienResult,
} from "@/lib/uw/vendors/types";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  const app = await prisma.uwApplication.findUnique({
    where: { id: appId },
    include: {
      owners: { orderBy: { ownershipPct: "desc" } },
      documents: { orderBy: { uploadedAt: "desc" } },
      bankAnalyses: { orderBy: { createdAt: "desc" }, take: 1 },
      vendorPulls: { orderBy: { pulledAt: "desc" } },
      decisions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!app) notFound();

  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const merchantUrl = `${proto}://${host}/apply/${app.publicToken}`;

  const latestAnalysis = app.bankAnalyses[0];
  const metrics = latestAnalysis
    ? (latestAnalysis.metricsJson as unknown as BankStatementMetrics)
    : null;

  const docTypePresence = new Set(app.documents.map((d) => d.docType));
  const requiredMet = UW_REQUIRED_DOC_TYPES.every((t) => docTypePresence.has(t));
  const requiredProgress =
    UW_REQUIRED_DOC_TYPES.filter((t) => docTypePresence.has(t)).length /
    UW_REQUIRED_DOC_TYPES.length;

  const findPull = <T,>(vendor: string): T | null => {
    const p = app.vendorPulls.find((x) => x.vendor === vendor && x.status === "ok");
    return p?.resultJson ? (p.resultJson as T) : null;
  };
  const consumer = findPull<ConsumerCreditResult>("microbilt_consumer_credit");
  const business = findPull<BusinessCreditResult>("microbilt_business_credit");
  const ofac = findPull<OfacResult>("microbilt_ofac");
  const datamerch = findPull<DataMerchResult>("datamerch");
  const ucc = findPull<UccLienResult>("ucc_liens");

  const hasBankDocs = app.documents.some((d) => d.docType === "BANK_STATEMENT");

  return (
    <div>
      <PageHeader
        title={app.legalName}
        description={
          [
            app.dba,
            app.state,
            app.timeInBusinessMonths != null
              ? `${app.timeInBusinessMonths} mo in business`
              : null,
          ]
            .filter(Boolean)
            .join(" · ") || undefined
        }
      >
        <div className="flex items-center gap-2">
          <PaperGradeBadge grade={app.paperGrade} />
          <UwStatusBadge status={app.status} />
        </div>
      </PageHeader>

      {/* Merchant portal link */}
      <Card className="mb-5 border-navy-200/60 bg-navy-50/30">
        <CardContent className="px-5 py-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-700">
            <Users className="h-3.5 w-3.5" />
            Merchant Portal
          </div>
          <p className="mb-2 text-sm text-steel-600">
            Send this link to the merchant. No login required — they can upload
            documents or connect their bank.
          </p>
          <CopyableLink url={merchantUrl} />
        </CardContent>
      </Card>

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Requested"
          value={
            app.requestedAmount
              ? formatCurrency(Number(app.requestedAmount))
              : "—"
          }
          icon={Banknote}
        />
        <StatCard
          title="Avg monthly true rev"
          value={
            metrics
              ? formatCurrency(
                  metrics.revenue.monthlyByMonth.reduce(
                    (s, m) => s + m.trueRev,
                    0
                  ) / Math.max(1, metrics.revenue.monthlyByMonth.length)
                )
              : "—"
          }
          icon={Activity}
        />
        <StatCard
          title="Open MCA positions"
          value={metrics ? String(metrics.positions.detected.length) : "—"}
          icon={TrendingDown}
          trend={
            metrics && metrics.positions.detected.length >= 3 ? "down" : "neutral"
          }
        />
        <StatCard
          title="Neg days / NSFs"
          value={
            metrics
              ? `${metrics.riskEvents.totalNegativeDays} / ${metrics.riskEvents.nsfCount}`
              : "—"
          }
          icon={AlertTriangle}
          trend={
            metrics && metrics.riskEvents.totalNegativeDays > 10
              ? "down"
              : "neutral"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Merchant + Owners */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-navy-600" />
              Merchant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <KV label="Legal name" value={app.legalName} />
            {app.dba && <KV label="DBA" value={app.dba} />}
            {app.ein && <KV label="EIN" value={app.ein} />}
            {app.entityType && <KV label="Entity" value={app.entityType} />}
            {app.naics && <KV label="NAICS" value={app.naics} />}
            {app.state && <KV label="State" value={app.state} />}
            {app.timeInBusinessMonths != null && (
              <KV
                label="Time in business"
                value={`${app.timeInBusinessMonths} months`}
              />
            )}
            {app.monthlyRevenueClaim != null && (
              <KV
                label="Claimed monthly revenue"
                value={formatCurrency(Number(app.monthlyRevenueClaim))}
              />
            )}
            {app.useOfFunds && <KV label="Use of funds" value={app.useOfFunds} />}

            <div className="border-t border-border/40 pt-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-steel-500">
                Owners
              </p>
              <ul className="space-y-1.5">
                {app.owners.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium text-navy-800">
                        {o.firstName} {o.lastName}
                      </p>
                      <p className="text-[11px] text-steel-500">
                        {Number(o.ownershipPct).toFixed(0)}% ·{" "}
                        {o.pgConsent ? (
                          <span className="text-profit">PG consent ✓</span>
                        ) : (
                          <span className="text-warning">PG consent pending</span>
                        )}
                      </p>
                    </div>
                    {o.ficoClaim && (
                      <span className="text-xs tabular-nums text-steel-600">
                        FICO {o.ficoClaim}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Documents + Bank summary */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-navy-600" />
              Documents
            </CardTitle>
            <Link
              href={`/uw/applications/${app.id}/documents`}
              className="text-xs font-medium text-navy-600 hover:text-navy-800"
            >
              Manage →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-steel-600">
                <span>Required documents</span>
                <span className="tabular-nums">
                  {Math.round(requiredProgress * 100)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-steel-100">
                <div
                  className={`h-full ${requiredMet ? "bg-profit" : "bg-navy-500"}`}
                  style={{ width: `${requiredProgress * 100}%` }}
                />
              </div>
            </div>
            <ul className="space-y-1.5">
              {UW_REQUIRED_DOC_TYPES.map((dt) => (
                <li key={dt} className="flex items-center justify-between text-xs">
                  <span className="text-steel-700">{UW_DOC_TYPE_LABELS[dt]}</span>
                  {docTypePresence.has(dt) ? (
                    <Badge variant="success">Received</Badge>
                  ) : (
                    <Badge variant="warning">Missing</Badge>
                  )}
                </li>
              ))}
            </ul>
            <p className="border-t border-border/40 pt-2 text-[11px] text-steel-500">
              {app.documents.length} total document
              {app.documents.length === 1 ? "" : "s"} uploaded
            </p>
          </CardContent>
        </Card>

        {/* Third-party rollup */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-navy-600" />
              Third-Party
            </CardTitle>
            <Link
              href={`/uw/applications/${app.id}/third-party`}
              className="text-xs font-medium text-navy-600 hover:text-navy-800"
            >
              Detail →
            </Link>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <PullLine
              label="Consumer FICO"
              value={consumer ? `${consumer.fico}` : "—"}
            />
            <PullLine
              label="Business credit"
              value={
                business
                  ? `${business.score} (${business.scoreLabel})`
                  : "—"
              }
            />
            <PullLine
              label="OFAC"
              value={ofac ? (ofac.hit ? "HIT" : "Clear") : "—"}
              tone={ofac?.hit ? "danger" : "ok"}
            />
            <PullLine
              label="DataMerch"
              value={
                datamerch ? (datamerch.hit ? "HIT" : "Clear") : "—"
              }
              tone={datamerch?.hit ? "danger" : "ok"}
            />
            <PullLine
              label="UCC filings"
              value={ucc ? String(ucc.uccFilings.length) : "—"}
              tone={ucc && ucc.uccFilings.length >= 2 ? "warn" : "neutral"}
            />
            <p className="border-t border-border/40 pt-2 text-[11px] text-steel-500">
              {app.vendorPulls.length} total vendor pull
              {app.vendorPulls.length === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bank analysis snapshot */}
      <Card className="mt-5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-navy-600" />
            Bank Statement Analysis
          </CardTitle>
          <Link
            href={`/uw/applications/${app.id}/bank-analysis`}
            className="text-xs font-medium text-navy-600 hover:text-navy-800"
          >
            Detail →
          </Link>
        </CardHeader>
        <CardContent>
          {!metrics ? (
            <div className="py-6 text-center text-sm text-steel-500">
              No analysis yet. Upload bank statements, then run analytics — or have
              the merchant connect their bank via the portal.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
              <Stat
                label="Gross deposits"
                value={formatCurrency(metrics.revenue.grossDeposits)}
              />
              <Stat
                label="True revenue"
                value={formatCurrency(metrics.revenue.trueRevenue)}
              />
              <Stat
                label="Avg daily balance"
                value={formatCurrency(metrics.liquidity.avgDailyBalance)}
              />
              <Stat
                label="Period"
                value={`${metrics.period.monthCount} mo`}
                sub={`${formatDate(metrics.period.start)} – ${formatDate(
                  metrics.period.end
                )}`}
              />
              <Stat
                label="Neg days"
                value={String(metrics.riskEvents.totalNegativeDays)}
                tone={metrics.riskEvents.totalNegativeDays > 10 ? "danger" : "neutral"}
              />
              <Stat
                label="NSFs"
                value={String(metrics.riskEvents.nsfCount)}
                tone={metrics.riskEvents.nsfCount >= 5 ? "danger" : "neutral"}
              />
              <Stat
                label="MCA debit / deposit"
                value={`${Math.round(metrics.positions.debitToDepositRatio * 100)}%`}
                tone={metrics.positions.debitToDepositRatio > 0.25 ? "danger" : "neutral"}
              />
              <Stat
                label="Card revenue %"
                value={`${metrics.cardProcessing.cardRevenuePct.toFixed(0)}%`}
              />
            </div>
          )}
          {metrics && metrics.flags.length > 0 && (
            <div className="mt-5 rounded-lg border border-warning/30 bg-warning-light/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-warning">
                <AlertTriangle className="h-3.5 w-3.5" />
                Risk flags
              </div>
              <ul className="space-y-0.5 text-sm text-navy-800">
                {metrics.flags.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions + Decision */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Run Underwriting</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionButtons appId={app.id} hasBankDocs={hasBankDocs} />
            <p className="mt-3 text-[11px] text-steel-500">
              &quot;Analyze statements&quot; runs Azure Document Intelligence over
              uploaded PDFs. &quot;Run third-party pulls&quot; queries Microbilt,
              DataMerch, UCC, and KYB in parallel. Vendor calls return mock data
              until their credentials are configured.
            </p>
          </CardContent>
        </Card>
        <DecisionPanel appId={app.id} disabled={!metrics} />
      </div>

      {/* Decision history */}
      {app.decisions.length > 0 && (
        <Card className="mt-5">
          <CardHeader>
            <CardTitle className="text-base">Decision History</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {app.decisions.map((d) => (
                <li
                  key={d.id}
                  className="flex items-start justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-navy-800">
                      {d.decision === "approve"
                        ? "Approved"
                        : d.decision === "decline"
                          ? "Declined"
                          : "Requested stips"}{" "}
                      ({d.paperGrade})
                    </p>
                    {d.notes && (
                      <p className="mt-0.5 text-xs text-steel-600">{d.notes}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-steel-500">
                    {formatDate(d.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-steel-500">{label}</span>
      <span className="text-right font-medium text-navy-800">{value}</span>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "ok" | "warn" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-danger"
      : tone === "warn"
        ? "text-warning"
        : tone === "ok"
          ? "text-profit"
          : "text-navy-800";
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-steel-500">
        {label}
      </p>
      <p className={`mt-0.5 text-lg font-semibold tabular-nums ${toneClass}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-steel-500">{sub}</p>}
    </div>
  );
}

function PullLine({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "ok" | "warn" | "danger";
}) {
  const className =
    tone === "danger"
      ? "text-danger font-bold"
      : tone === "warn"
        ? "text-warning font-semibold"
        : tone === "ok"
          ? "text-profit font-semibold"
          : "text-navy-800";
  return (
    <div className="flex items-center justify-between">
      <span className="text-steel-600">{label}</span>
      <span className={`tabular-nums ${className}`}>{value}</span>
    </div>
  );
}
