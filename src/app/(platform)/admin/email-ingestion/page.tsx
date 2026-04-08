import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function EmailIngestionPage() {
  return (
    <div>
      <PageHeader title="Email Ingestion" description="Monitor and manage deal emails" />
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <Mail className="h-12 w-12 text-steel-300 mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 mb-2">Email Ingestion</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Connect your deal inbox to automatically parse incoming MCA deal emails.
            This feature will be available in Phase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
