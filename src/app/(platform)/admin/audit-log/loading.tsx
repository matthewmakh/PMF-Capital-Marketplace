import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function AuditLogLoading() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-4 space-y-2 sm:mb-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Audit table */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b bg-steel-50 px-4 py-3">
            <Skeleton className="h-3 w-full max-w-2xl" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="hidden h-4 w-20 sm:block" />
                <Skeleton className="hidden h-4 flex-1 md:block" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
