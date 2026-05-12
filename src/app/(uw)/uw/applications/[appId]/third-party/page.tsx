import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, AlertOctagon, MinusCircle } from "lucide-react";

const VENDOR_LABELS: Record<string, string> = {
  microbilt_ofac: "Microbilt — OFAC / Watchlist",
  microbilt_id_verify: "Microbilt — ID Verify",
  microbilt_consumer_credit: "Microbilt — Consumer Credit (PG)",
  microbilt_business_credit: "Microbilt — Business Credit",
  datamerch: "DataMerch — MCA Blacklist",
  ucc_liens: "Wolters Kluwer iLien — UCC / Liens",
  kyb: "KYB — Middesk / Cobalt",
};

export default async function ThirdPartyPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  const app = await prisma.uwApplication.findUnique({
    where: { id: appId },
    include: { vendorPulls: { orderBy: { pulledAt: "desc" } } },
  });
  if (!app) notFound();

  // Group by vendor, keep most recent successful pull per vendor.
  const byVendor = new Map<string, (typeof app.vendorPulls)[number]>();
  for (const p of app.vendorPulls) {
    if (!byVendor.has(p.vendor)) byVendor.set(p.vendor, p);
  }

  return (
    <div>
      <PageHeader title="Third-Party Data" description={app.legalName}>
        <Link
          href={`/uw/applications/${appId}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-navy-600 hover:text-navy-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to summary
        </Link>
      </PageHeader>

      {app.vendorPulls.length === 0 ? (
        <Card>
          <CardContent className="px-5 py-12 text-center text-sm text-steel-500">
            No pulls yet. Run third-party pulls from the application summary
            page.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {Array.from(byVendor.values()).map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40">
                <CardTitle className="text-base">
                  {VENDOR_LABELS[p.vendor] || p.vendor}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs">
                  {p.status === "ok" ? (
                    <Badge variant="success">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> OK
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertOctagon className="mr-1 h-3 w-3" /> {p.status}
                    </Badge>
                  )}
                  <span className="text-steel-500">{formatDate(p.pulledAt)}</span>
                </div>
              </CardHeader>
              <CardContent>
                {p.status === "ok" && p.resultJson ? (
                  <pre className="overflow-x-auto rounded-md bg-steel-50/70 p-3 text-xs leading-relaxed text-navy-800">
                    {JSON.stringify(p.resultJson, null, 2)}
                  </pre>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-steel-500">
                    <MinusCircle className="h-4 w-4" />
                    {p.errorMessage || "No result"}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
