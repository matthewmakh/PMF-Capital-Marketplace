"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Payout {
  id: string;
  amount: string;
  status: string;
  notes: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  approvedBy: { firstName: string; lastName: string } | null;
}

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payouts")
      .then((r) => r.json())
      .then(setPayouts);
  }, []);

  async function handleAction(payoutId: string, action: "approve" | "deny" | "complete") {
    setLoading(payoutId);
    try {
      const res = await fetch(`/api/payouts/${payoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPayouts((prev) => prev.map((p) => (p.id === payoutId ? { ...p, ...updated } : p)));
        const label = action === "approve" ? "approved" : action === "deny" ? "denied" : "marked completed";
        toast.success(`Payout ${label}`);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to update payout");
      }
    } catch {
      toast.error("Failed to update payout");
    } finally {
      setLoading(null);
    }
  }

  const pending = payouts.filter((p) => p.status === "PENDING");
  const approved = payouts.filter((p) => p.status === "APPROVED");
  const others = payouts.filter((p) => !["PENDING", "APPROVED"].includes(p.status));

  return (
    <div>
      <PageHeader title="Payout Approvals" description="Review and process payout requests" />

      {pending.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-base font-semibold">Pending Approval ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{p.user.firstName} {p.user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{p.user.email} &middot; {formatDate(p.createdAt)}</p>
                    {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold tabular-nums">{formatCurrency(Number(p.amount))}</p>
                    <Button size="sm" onClick={() => handleAction(p.id, "approve")} disabled={loading === p.id} className="bg-profit hover:bg-profit/90 text-white">
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleAction(p.id, "deny")} disabled={loading === p.id}>
                      Deny
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {approved.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-base font-semibold">Approved — Awaiting Processing ({approved.length})</h2>
          <div className="space-y-3">
            {approved.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{p.user.firstName} {p.user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold tabular-nums">{formatCurrency(Number(p.amount))}</p>
                    <Button size="sm" onClick={() => handleAction(p.id, "complete")} disabled={loading === p.id} className="bg-navy-700 hover:bg-navy-800">
                      Mark Completed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-steel-50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {others.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="px-4 py-3">{p.user.firstName} {p.user.lastName}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(Number(p.amount))}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === "COMPLETED" ? "success" : p.status === "DENIED" ? "destructive" : "secondary"}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
