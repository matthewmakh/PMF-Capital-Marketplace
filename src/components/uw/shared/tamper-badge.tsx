import { TamperVerdict } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

const labels: Record<TamperVerdict, string> = {
  CLEAN: "Clean",
  SUSPICIOUS: "Suspicious",
  TAMPERED: "Tampered",
  UNKNOWN: "Unchecked",
};

const variants: Record<
  TamperVerdict,
  "success" | "warning" | "destructive" | "secondary"
> = {
  CLEAN: "success",
  SUSPICIOUS: "warning",
  TAMPERED: "destructive",
  UNKNOWN: "secondary",
};

export function TamperBadge({
  verdict,
  riskScore,
}: {
  verdict: TamperVerdict;
  riskScore?: number;
}) {
  const Icon =
    verdict === "TAMPERED" || verdict === "SUSPICIOUS"
      ? ShieldAlert
      : verdict === "CLEAN"
        ? ShieldCheck
        : ShieldQuestion;

  return (
    <Badge variant={variants[verdict]}>
      <Icon className="mr-1 h-3 w-3" />
      {labels[verdict]}
      {typeof riskScore === "number" && verdict !== "UNKNOWN"
        ? ` · ${riskScore}`
        : ""}
    </Badge>
  );
}
