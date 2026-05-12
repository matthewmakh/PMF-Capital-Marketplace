import { PaperGrade } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { PAPER_GRADE_COLORS, PAPER_GRADE_LABELS } from "@/lib/constants";

export function PaperGradeBadge({ grade }: { grade: PaperGrade }) {
  const variant = PAPER_GRADE_COLORS[grade] as
    | "default"
    | "secondary"
    | "destructive"
    | "success"
    | "warning";
  return <Badge variant={variant}>{PAPER_GRADE_LABELS[grade]}</Badge>;
}
