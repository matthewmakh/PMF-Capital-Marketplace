"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

interface SyndicationFormProps {
  dealId: string;
  dealName: string;
  minAmount: number;
  maxAmount: number;
  remainingCapacity: number;
}

export function SyndicationForm({
  dealId,
  dealName,
  minAmount,
  maxAmount,
  remainingCapacity,
}: SyndicationFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < minAmount || numAmount > maxAmount) {
      setError(
        `Amount must be between ${formatCurrency(minAmount)} and ${formatCurrency(maxAmount)}`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/syndicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to syndicate");
      }

      toast.success(`Investment submitted — ${formatCurrency(numAmount)} in ${dealName}`);
      setAmount("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-navy-300 bg-white">
      <CardHeader>
        <CardTitle className="text-base">Invest in This Deal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Investment Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={minAmount}
                max={maxAmount}
                placeholder={`${minAmount} - ${maxAmount}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 tabular-nums"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Min: {formatCurrency(minAmount)} | Max:{" "}
              {formatCurrency(maxAmount)} | Remaining:{" "}
              {formatCurrency(remainingCapacity)}
            </p>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-navy-700 hover:bg-navy-800"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Processing...
              </>
            ) : (
              "Commit Investment"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By committing, you agree to allocate this capital to the deal.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
