import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUploadZone } from "@/components/uw/documents/document-upload-zone";
import { UW_DOC_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default async function ApplicationDocumentsPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  const app = await prisma.uwApplication.findUnique({
    where: { id: appId },
    include: {
      documents: {
        orderBy: { uploadedAt: "desc" },
        include: { uploadedBy: { select: { firstName: true, lastName: true } } },
      },
    },
  });
  if (!app) notFound();

  return (
    <div>
      <PageHeader
        title="Documents"
        description={`Upload merchant stips for ${app.legalName}`}
      >
        <Link
          href={`/uw/applications/${appId}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-navy-600 hover:text-navy-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to summary
        </Link>
      </PageHeader>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="text-base">Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploadZone apiBase={`/api/uw/applications/${appId}`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-navy-600" />
            All documents ({app.documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {app.documents.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-steel-500">
              No documents uploaded yet.
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {app.documents.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-800">
                      {d.filename}
                    </p>
                    <p className="text-[11px] text-steel-500">
                      {UW_DOC_TYPE_LABELS[d.docType]} ·{" "}
                      {Math.round(d.sizeBytes / 1024)}&nbsp;KB ·{" "}
                      {formatDate(d.uploadedAt)}
                      {d.uploadedBy &&
                        ` · ${d.uploadedBy.firstName} ${d.uploadedBy.lastName}`}
                    </p>
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
