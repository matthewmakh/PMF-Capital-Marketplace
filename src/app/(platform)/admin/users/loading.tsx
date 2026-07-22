import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminUsersLoading() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-4 space-y-2 sm:mb-6">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b bg-steel-50 px-4 py-3">
            <Skeleton className="h-3 w-full max-w-2xl" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="hidden h-4 w-52 flex-1 sm:block" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="hidden h-4 w-10 md:block" />
                <Skeleton className="hidden h-4 w-24 md:block" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
