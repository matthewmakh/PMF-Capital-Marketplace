import { UwAppStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { UW_STATUS_COLORS, UW_STATUS_LABELS } from "@/lib/constants";

export function UwStatusBadge({ status }: { status: UwAppStatus }) {
  const variant = UW_STATUS_COLORS[status] as
    | "default"
    | "secondary"
    | "destructive"
    | "success"
    | "warning";
  return <Badge variant={variant}>{UW_STATUS_LABELS[status]}</Badge>;
}
