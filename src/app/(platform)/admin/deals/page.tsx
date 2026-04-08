import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DealStatusActions } from "./deal-status-actions";

export default async function AdminDealsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const deals = await prisma.deal.findMany({
    include: {
      _count: { select: { syndications: true, payments: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingDeals = deals.filter((d) => d.status === "PENDING_REVIEW");
  const otherDeals = deals.filter((d) => d.status !== "PENDING_REVIEW");

  return (
    <div>
      <PageHeader title="Manage Deals" description="Review, create, and manage all deals">
        <Link href="/admin/deals/create">
          <Button className="bg-navy-700 hover:bg-navy-800">
            <Plus className="h-4 w-4 mr-2" />
            Create Deal
          </Button>
        </Link>
      </PageHeader>

      {pendingDeals.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-navy-800">
            Pending Review ({pendingDeals.length})
          </h2>
          <div className="space-y-3">
            {pendingDeals.map((deal) => (
              <Card key={deal.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <Link
                      href={`/deals/${deal.id}`}
                      className="font-medium text-navy-700 hover:underline"
                    >
                      {deal.merchantName}
                    </Link>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{formatCurrency(Number(deal.fundedAmount))}</span>
                      <span>{deal.merchantIndustry || "N/A"}</span>
                      <span>{deal.merchantState || "N/A"}</span>
                      <span>Created {formatDate(deal.createdAt)}</span>
                    </div>
                  </div>
                  <DealStatusActions dealId={deal.id} currentStatus={deal.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-navy-800">All Deals</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-steel-50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Merchant</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Funded</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Collected</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Investors</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Payments</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {otherDeals.map((deal) => (
                    <tr key={deal.id} className="border-b hover:bg-steel-50">
                      <td className="px-4 py-3">
                        <Link href={`/deals/${deal.id}`} className="font-medium text-navy-700 hover:underline">
                          {deal.merchantName}
                        </Link>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={deal.status} /></td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(Number(deal.fundedAmount))}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(Number(deal.totalCollected))}</td>
                      <td className="px-4 py-3 text-center">{deal._count.syndications}</td>
                      <td className="px-4 py-3 text-center">{deal._count.payments}</td>
                      <td className="px-4 py-3 text-right">
                        <DealStatusActions dealId={deal.id} currentStatus={deal.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
