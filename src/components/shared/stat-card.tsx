import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
              {title}
            </p>
            <p
              className={cn(
                "truncate text-lg font-semibold tabular-nums sm:text-2xl",
                trend === "up" && "text-profit",
                trend === "down" && "text-danger"
              )}
            >
              {value}
            </p>
            {subtitle && (
              <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                {subtitle}
              </p>
            )}
          </div>
          {Icon && (
            <div className="hidden shrink-0 items-center justify-center rounded-lg bg-navy-50 sm:flex sm:h-10 sm:w-10">
              <Icon className="h-5 w-5 text-navy-600" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
