import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUploadZone } from "@/components/uw/documents/document-upload-zone";
import { PlaidLinkButton } from "./plaid-link-button";
import { ShieldCheck, FileUp } from "lucide-react";

export default async function MerchantApplyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const app = await prisma.uwApplication.findUnique({
    where: { publicToken: token },
    include: { owners: { orderBy: { ownershipPct: "desc" }, take: 1 } },
  });
  if (!app) notFound();

  return (
    <div className="min-h-screen bg-steel-50">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-500">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-navy-900">
              Premier Merchant Funding — Application Portal
            </h1>
            <p className="text-xs text-steel-500">
              Securely submit your underwriting documents
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-steel-500">
            Welcome
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-navy-900">
            {app.legalName}
          </h2>
          <p className="mt-1 text-sm text-steel-600">
            Please upload the documents requested by your funding partner, or
            link your bank account for a faster review.
          </p>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-navy-600" />
                Option 1 — Connect your bank (Recommended)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-steel-600">
                The fastest path: securely link your business bank with Plaid.
                We will pull 4 months of transactions automatically — no
                downloads, no uploads.
              </p>
              <PlaidLinkButton token={token} />
              <p className="mt-3 text-[11px] text-steel-500">
                Plaid is bank-grade encryption. We never see your credentials.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileUp className="h-4 w-4 text-navy-600" />
                Option 2 — Upload PDFs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-steel-600">
                Drag and drop your most recent business bank statements, your
                ID, voided check, and signed application.
              </p>
              <DocumentUploadZone apiBase={`/api/apply/${token}`} />
            </CardContent>
          </Card>
        </div>

        <p className="mt-6 text-center text-xs text-steel-500">
          Questions? Contact your funding partner directly. This link is unique
          to {app.legalName}.
        </p>
      </main>
    </div>
  );
}
