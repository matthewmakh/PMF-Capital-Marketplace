import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UwStatusBadge } from "@/components/uw/shared/uw-status-badge";
import { PaperGradeBadge } from "@/components/uw/shared/paper-grade-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  ClipboardList,
  ClockAlert,
  FileSearch,
  ThumbsUp,
  ThumbsDown,
  PlusCircle,
} from "lucide-react";

export default async function UwDashboardPage() {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [counts, recent] = await Promise.all([
    prisma.uwApplication.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.uwApplication.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { _count: { select: { documents: true, decisions: true } } },
    }),
  ]);

  const countBy = (status: string): number =>
    counts.find((c) => c.status === status)?._count._all ?? 0;

  const decidedRecent = await prisma.uwDecision.findMany({
    where: { createdAt: { gte: since } },
    select: { decision: true },
  });
  const approvedThisWeek = decidedRecent.filter((d) => d.decision === "approve").length;
  const declinedThisWeek = decidedRecent.filter((d) => d.decision === "decline").length;

  return (
    <div>
      <PageHeader
        title="Underwriting"
        description="Review applications, run analytics, and decide deals"
      >
        <Link href="/uw/applications/new">
          <Button className="bg-navy-700 hover:bg-navy-800">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="In Intake"
          value={String(countBy("INTAKE") + countBy("DOCS_PENDING"))}
          subtitle="Awaiting docs"
          icon={ClockAlert}
        />
        <StatCard
          title="Under Review"
          value={String(countBy("UNDER_REVIEW") + countBy("ANALYZING"))}
          subtitle="Ready to decide"
          icon={FileSearch}
        />
        <StatCard
          title="Approved (7d)"
          value={String(approvedThisWeek)}
          icon={ThumbsUp}
          trend="up"
        />
        <StatCard
          title="Declined (7d)"
          value={String(declinedThisWeek)}
          icon={ThumbsDown}
          trend={declinedThisWeek > 0 ? "down" : "neutral"}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-navy-600" />
            Recent Applications
          </CardTitle>
          <Link
            href="/uw/applications"
            className="text-xs font-medium text-navy-600 hover:text-navy-800"
          >
            View all →
          </Link>
        </CardHeader>
        <CardContent className="px-0">
          {recent.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-steel-500">
              No applications yet. Click <strong>New Application</strong> to start.
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {recent.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-col gap-2 px-5 py-3 hover:bg-navy-50/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/uw/applications/${a.id}`}
                      className="truncate text-sm font-semibold text-navy-800 hover:text-navy-600"
                    >
                      {a.legalName}
                    </Link>
                    <p className="mt-0.5 text-xs text-steel-500">
                      {a.dba ? `${a.dba} · ` : ""}
                      {a.state ?? "—"} ·{" "}
                      {a.requestedAmount ? formatCurrency(Number(a.requestedAmount)) : "—"} · Updated{" "}
                      {formatDate(a.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PaperGradeBadge grade={a.paperGrade} />
                    <UwStatusBadge status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
