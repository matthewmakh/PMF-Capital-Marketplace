import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UwStatusBadge } from "@/components/uw/shared/uw-status-badge";
import { PaperGradeBadge } from "@/components/uw/shared/paper-grade-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PlusCircle, MapPin, Calendar } from "lucide-react";

export default async function ApplicationsListPage() {
  const apps = await prisma.uwApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { documents: true, bankAnalyses: true, vendorPulls: true },
      },
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Applications"
        description={`${apps.length} application${apps.length === 1 ? "" : "s"} on file`}
      >
        <Link href="/uw/applications/new">
          <Button className="bg-navy-700 hover:bg-navy-800">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      </PageHeader>

      {apps.length === 0 ? (
        <Card>
          <CardContent className="px-5 py-12 text-center text-sm text-steel-500">
            No applications yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="hidden border-b border-border/40 bg-steel-50/70 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-steel-500 sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]">
              <div>Merchant</div>
              <div>State / TIB</div>
              <div className="text-right">Requested</div>
              <div className="text-right">Docs / Pulls</div>
              <div>Grade</div>
              <div>Status</div>
            </div>
            <ul className="divide-y divide-border/40">
              {apps.map((a) => (
                <li
                  key={a.id}
                  className="grid grid-cols-1 gap-2 px-5 py-3 hover:bg-navy-50/30 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] sm:items-center"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/uw/applications/${a.id}`}
                      className="truncate text-sm font-semibold text-navy-800 hover:text-navy-600"
                    >
                      {a.legalName}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-steel-500">
                      {a.dba || a.ein || ""} · created {formatDate(a.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-steel-600">
                    {a.state && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {a.state}
                      </span>
                    )}
                    {a.timeInBusinessMonths != null && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {a.timeInBusinessMonths} mo
                      </span>
                    )}
                  </div>
                  <div className="text-sm tabular-nums text-navy-800 sm:text-right">
                    {a.requestedAmount
                      ? formatCurrency(Number(a.requestedAmount))
                      : "—"}
                  </div>
                  <div className="text-xs tabular-nums text-steel-600 sm:text-right">
                    {a._count.documents} docs · {a._count.vendorPulls} pulls
                  </div>
                  <div>
                    <PaperGradeBadge grade={a.paperGrade} />
                  </div>
                  <div>
                    <UwStatusBadge status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
