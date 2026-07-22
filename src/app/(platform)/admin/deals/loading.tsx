import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDealsLoading() {
  return (
    <div>
      {/* Page header + create button */}
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Summary strip */}
      <Card className="mb-5">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-border/40 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 px-4 py-3 text-center sm:px-5">
                <Skeleton className="mx-auto h-3 w-20" />
                <Skeleton className="mx-auto h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All deals table */}
      <Skeleton className="mb-3 h-5 w-28" />
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b border-border/60 bg-steel-50/70 px-5 py-3.5">
            <Skeleton className="h-3 w-full max-w-xl" />
          </div>
          <div className="divide-y divide-border/40">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="hidden h-2 w-16 rounded-full lg:block" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
