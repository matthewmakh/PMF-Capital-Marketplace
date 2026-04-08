import { DealStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from "@/lib/constants";

interface StatusBadgeProps {
  status: DealStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = DEAL_STATUS_LABELS[status];
  const variant = DEAL_STATUS_COLORS[status] as
    | "default"
    | "secondary"
    | "destructive"
    | "success"
    | "warning";

  return <Badge variant={variant}>{label}</Badge>;
}
