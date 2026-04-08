"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, Clock, CheckCircle } from "lucide-react";

interface Payout {
  id: string;
  amount: string;
  status: string;
  notes: string | null;
  denialReason: string | null;
  createdAt: string;
  approvedBy: { firstName: string; lastName: string } | null;
}

const statusVariant: Record<string, "default" | "secondary" | "success" | "destructive" | "warning"> = {
  PENDING: "warning",
  APPROVED: "default",
  PROCESSING: "secondary",
  COMPLETED: "success",
  DENIED: "destructive",
};

export default function PayoutsPage() {
  const router = useRouter();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/payouts")
      .then((r) => r.json())
      .then(setPayouts);
  }, []);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to request payout");
      }

      const newPayout = await res.json();
      setPayouts((prev) => [newPayout, ...prev]);
      setAmount("");
      setNotes("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const completedTotal = payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((s, p) => s + Number(p.amount), 0);
  const pendingTotal = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div>
      <PageHeader title="Payouts" description="Request and track your payouts" />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatCard title="Completed Payouts" value={formatCurrency(completedTotal)} icon={CheckCircle} trend="up" />
        <StatCard title="Pending Requests" value={formatCurrency(pendingTotal)} icon={Clock} />
        <StatCard title="Total Requests" value={String(payouts.length)} icon={Wallet} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-7" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason for payout..." />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button type="submit" className="w-full bg-navy-700 hover:bg-navy-800" disabled={loading}>
                {loading ? "Requesting..." : "Request Payout"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            {payouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payout requests yet.</p>
            ) : (
              <div className="space-y-2">
                {payouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="text-sm font-semibold tabular-nums">{formatCurrency(Number(p.amount))}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
                      {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
                      {p.denialReason && <p className="text-xs text-danger">Reason: {p.denialReason}</p>}
                    </div>
                    <Badge variant={statusVariant[p.status] || "secondary"}>{p.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
