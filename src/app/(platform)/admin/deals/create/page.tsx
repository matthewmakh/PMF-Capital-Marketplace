"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export default function CreateDealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      merchantName: formData.get("merchantName") as string,
      merchantDba: (formData.get("merchantDba") as string) || undefined,
      merchantIndustry: (formData.get("merchantIndustry") as string) || undefined,
      merchantState: (formData.get("merchantState") as string) || undefined,
      fundedAmount: parseFloat(formData.get("fundedAmount") as string),
      paybackAmount: parseFloat(formData.get("paybackAmount") as string),
      factorRate: parseFloat(formData.get("factorRate") as string),
      termDays: formData.get("termDays") ? parseInt(formData.get("termDays") as string) : undefined,
      paymentFrequency: (formData.get("paymentFrequency") as string) || "daily",
      expectedPayments: formData.get("expectedPayments") ? parseInt(formData.get("expectedPayments") as string) : undefined,
      syndicationMin: parseFloat(formData.get("syndicationMin") as string) || 100,
      syndicationMax: formData.get("syndicationMax") ? parseFloat(formData.get("syndicationMax") as string) : undefined,
      notes: (formData.get("notes") as string) || undefined,
      internalNotes: (formData.get("internalNotes") as string) || undefined,
    };

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to create deal");
      }

      router.push("/admin/deals");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Create New Deal" description="Manually add a deal to the marketplace" />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Merchant Info */}
            <div>
              <h3 className="text-base font-semibold mb-4">Merchant Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="merchantName">Merchant Name *</Label>
                  <Input id="merchantName" name="merchantName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchantDba">DBA Name</Label>
                  <Input id="merchantDba" name="merchantDba" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchantIndustry">Industry</Label>
                  <Input id="merchantIndustry" name="merchantIndustry" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchantState">State</Label>
                  <Input id="merchantState" name="merchantState" maxLength={2} placeholder="NY" />
                </div>
              </div>
            </div>

            {/* Deal Terms */}
            <div>
              <h3 className="text-base font-semibold mb-4">Deal Terms</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="fundedAmount">Funded Amount *</Label>
                  <Input id="fundedAmount" name="fundedAmount" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paybackAmount">Payback Amount *</Label>
                  <Input id="paybackAmount" name="paybackAmount" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="factorRate">Factor Rate *</Label>
                  <Input id="factorRate" name="factorRate" type="number" step="0.01" defaultValue="1.35" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termDays">Term (days)</Label>
                  <Input id="termDays" name="termDays" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentFrequency">Payment Frequency</Label>
                  <Select id="paymentFrequency" name="paymentFrequency" defaultValue="daily">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedPayments">Expected Payments</Label>
                  <Input id="expectedPayments" name="expectedPayments" type="number" />
                </div>
              </div>
            </div>

            {/* Syndication */}
            <div>
              <h3 className="text-base font-semibold mb-4">Syndication Settings</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="syndicationMin">Min Investment</Label>
                  <Input id="syndicationMin" name="syndicationMin" type="number" step="0.01" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="syndicationMax">Max Investment (per investor)</Label>
                  <Input id="syndicationMax" name="syndicationMax" type="number" step="0.01" placeholder="No limit" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="notes">Public Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Visible to all investors..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes</Label>
                <Textarea id="internalNotes" name="internalNotes" placeholder="Admin-only notes..." />
              </div>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" className="bg-navy-700 hover:bg-navy-800" disabled={loading}>
                {loading ? "Creating..." : "Create Deal"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
