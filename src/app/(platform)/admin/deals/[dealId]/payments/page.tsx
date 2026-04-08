"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Payment {
  id: string;
  amount: string;
  paymentDate: string;
  paymentNumber: number;
  memo: string | null;
  isReversed: boolean;
  reversalReason: string | null;
  postedBy: { firstName: string; lastName: string };
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const params = useParams();
  const dealId = params.dealId as string;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reversingId, setReversingId] = useState<string | null>(null);
  const [reversalReason, setReversalReason] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [memo, setMemo] = useState("");

  useEffect(() => {
    fetch(`/api/deals/${dealId}/payments`)
      .then((r) => r.json())
      .then(setPayments);
  }, [dealId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/deals/${dealId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentDate,
          memo: memo || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post payment");
      }

      const newPayment = await res.json();
      setPayments((prev) => [newPayment, ...prev]);
      setAmount("");
      setMemo("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleReverse(paymentId: string) {
    if (!reversalReason.trim()) {
      setError("Reversal reason is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/deals/${dealId}/payments/${paymentId}/reverse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: reversalReason }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reverse payment");
      }
      // Update local state to show reversed
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? { ...p, isReversed: true, reversalReason: reversalReason }
            : p
        )
      );
      setReversingId(null);
      setReversalReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Post Payment"
        description="Record a merchant payment and distribute to investors"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">New Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memo">Memo (optional)</Label>
                <Input
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="ACH ref, check #, etc."
                />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-navy-700 hover:bg-navy-800"
                disabled={loading}
              >
                {loading ? "Posting..." : "Post Payment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet.</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Payment #{p.paymentNumber}
                          {p.isReversed && (
                            <span className="ml-2 text-xs font-normal text-danger">
                              REVERSED
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(p.paymentDate)} &middot; Posted by{" "}
                          {p.postedBy?.firstName} {p.postedBy?.lastName}
                        </p>
                        {p.memo && (
                          <p className="text-xs text-muted-foreground">{p.memo}</p>
                        )}
                        {p.reversalReason && (
                          <p className="text-xs text-danger mt-1">
                            Reason: {p.reversalReason}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <p
                          className={`text-sm font-semibold tabular-nums ${p.isReversed ? "text-danger line-through" : "text-profit"}`}
                        >
                          {formatCurrency(Number(p.amount))}
                        </p>
                        {!p.isReversed && reversingId !== p.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-muted-foreground hover:text-danger"
                            onClick={() => setReversingId(p.id)}
                          >
                            Reverse
                          </Button>
                        )}
                      </div>
                    </div>
                    {reversingId === p.id && (
                      <div className="mt-3 flex items-center gap-2 border-t pt-3">
                        <Input
                          placeholder="Reason for reversal (required)..."
                          value={reversalReason}
                          onChange={(e) => setReversalReason(e.target.value)}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReverse(p.id)}
                          disabled={loading}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setReversingId(null);
                            setReversalReason("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
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
