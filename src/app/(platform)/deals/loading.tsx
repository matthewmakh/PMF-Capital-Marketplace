import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DealsLoading() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-4 space-y-2 sm:mb-6">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Summary bar */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-border/40 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <Skeleton className="hidden h-9 w-9 rounded-lg sm:block" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section heading */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="h-5 w-44" />
      </div>

      {/* Deal cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-full border-border/60">
            <CardContent className="p-0">
              <div className="border-b border-border/40 bg-steel-50/30 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                  <Skeleton className="h-9 w-12 rounded-lg" />
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-12 rounded-lg" />
                  ))}
                </div>
                <Skeleton className="mt-3 h-9 rounded-lg" />
              </div>
              <div className="border-t border-border/40 px-5 py-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
