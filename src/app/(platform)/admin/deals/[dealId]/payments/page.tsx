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
  postedBy: { firstName: string; lastName: string };
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const params = useParams();
  const dealId = params.dealId as string;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Payment #{p.paymentNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(p.paymentDate)} &middot; Posted by{" "}
                        {p.postedBy?.firstName} {p.postedBy?.lastName}
                      </p>
                      {p.memo && (
                        <p className="text-xs text-muted-foreground">
                          {p.memo}
                        </p>
                      )}
                    </div>
                    <p
                      className={`text-sm font-semibold tabular-nums ${p.isReversed ? "text-danger line-through" : "text-profit"}`}
                    >
                      {formatCurrency(Number(p.amount))}
                    </p>
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
