import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { vendorStatuses } from "@/lib/uw/vendors/registry";
import { CheckCircle2, AlertCircle, Settings as SettingsIcon } from "lucide-react";

export default function UwSettingsPage() {
  const statuses = vendorStatuses();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Vendor and storage configuration"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SettingsIcon className="h-4 w-4 text-navy-600" />
            Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <ul className="divide-y divide-border/40">
            {statuses.map((v) => (
              <li
                key={v.key}
                className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-navy-800">
                      {v.label}
                    </p>
                    {v.configured ? (
                      <Badge variant="success">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Configured
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <AlertCircle className="mr-1 h-3 w-3" /> Mock mode
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-steel-500">{v.purpose}</p>
                </div>
                <div className="flex flex-wrap gap-1 text-[11px] text-steel-500">
                  {v.envVars.map((e) => (
                    <code
                      key={e}
                      className="rounded bg-steel-100 px-1.5 py-0.5 font-mono"
                    >
                      {e}
                    </code>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-steel-500">
        Integrations in <strong>Mock mode</strong> return deterministic synthetic
        data so the platform runs end-to-end without vendor credentials. Add the
        listed environment variables and restart the app to switch a vendor to
        live mode.
      </p>
    </div>
  );
}
