"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface OwnerForm {
  firstName: string;
  lastName: string;
  ssn: string;
  dob: string;
  ownershipPct: string;
  phone: string;
  email: string;
  homeAddress: string;
  ficoClaim: string;
  pgConsent: boolean;
}

const blankOwner = (): OwnerForm => ({
  firstName: "",
  lastName: "",
  ssn: "",
  dob: "",
  ownershipPct: "",
  phone: "",
  email: "",
  homeAddress: "",
  ficoClaim: "",
  pgConsent: false,
});

export function IntakeForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [business, setBusiness] = useState({
    legalName: "",
    dba: "",
    ein: "",
    entityType: "",
    naics: "",
    state: "",
    businessPhone: "",
    businessEmail: "",
    businessAddress: "",
    timeInBusinessMonths: "",
    requestedAmount: "",
    useOfFunds: "",
    monthlyRevenueClaim: "",
  });
  const [owners, setOwners] = useState<OwnerForm[]>([blankOwner()]);

  const update = <K extends keyof typeof business>(k: K, v: string) =>
    setBusiness((b) => ({ ...b, [k]: v }));

  const updateOwner = (idx: number, patch: Partial<OwnerForm>) =>
    setOwners((arr) => arr.map((o, i) => (i === idx ? { ...o, ...patch } : o)));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...business,
        timeInBusinessMonths: business.timeInBusinessMonths
          ? Number(business.timeInBusinessMonths)
          : undefined,
        requestedAmount: business.requestedAmount
          ? Number(business.requestedAmount)
          : undefined,
        monthlyRevenueClaim: business.monthlyRevenueClaim
          ? Number(business.monthlyRevenueClaim)
          : undefined,
        owners: owners.map((o) => ({
          ...o,
          ownershipPct: Number(o.ownershipPct || 0),
          ficoClaim: o.ficoClaim ? Number(o.ficoClaim) : "",
        })),
      };
      const resp = await fetch("/api/uw/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.error || `Error ${resp.status}`);
      }
      const { id } = await resp.json();
      router.push(`/uw/applications/${id}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Business</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Legal name *" required>
            <Input
              value={business.legalName}
              onChange={(e) => update("legalName", e.target.value)}
              required
            />
          </Field>
          <Field label="DBA">
            <Input
              value={business.dba}
              onChange={(e) => update("dba", e.target.value)}
            />
          </Field>
          <Field label="EIN (XX-XXXXXXX)">
            <Input
              value={business.ein}
              onChange={(e) => update("ein", e.target.value)}
              placeholder="12-3456789"
            />
          </Field>
          <Field label="Entity type">
            <Input
              value={business.entityType}
              onChange={(e) => update("entityType", e.target.value)}
              placeholder="LLC, S-Corp, Sole Prop…"
            />
          </Field>
          <Field label="State">
            <Input
              value={business.state}
              onChange={(e) =>
                update("state", e.target.value.toUpperCase().slice(0, 2))
              }
              placeholder="NY"
              maxLength={2}
            />
          </Field>
          <Field label="NAICS">
            <Input
              value={business.naics}
              onChange={(e) => update("naics", e.target.value)}
            />
          </Field>
          <Field label="Time in business (months)">
            <Input
              type="number"
              min={0}
              value={business.timeInBusinessMonths}
              onChange={(e) => update("timeInBusinessMonths", e.target.value)}
            />
          </Field>
          <Field label="Requested amount ($)">
            <Input
              type="number"
              min={0}
              step={100}
              value={business.requestedAmount}
              onChange={(e) => update("requestedAmount", e.target.value)}
            />
          </Field>
          <Field label="Claimed monthly revenue ($)">
            <Input
              type="number"
              min={0}
              step={100}
              value={business.monthlyRevenueClaim}
              onChange={(e) => update("monthlyRevenueClaim", e.target.value)}
            />
          </Field>
          <Field label="Business phone">
            <Input
              value={business.businessPhone}
              onChange={(e) => update("businessPhone", e.target.value)}
            />
          </Field>
          <Field label="Business email">
            <Input
              type="email"
              value={business.businessEmail}
              onChange={(e) => update("businessEmail", e.target.value)}
            />
          </Field>
          <Field label="Business address" className="sm:col-span-2">
            <Input
              value={business.businessAddress}
              onChange={(e) => update("businessAddress", e.target.value)}
            />
          </Field>
          <Field label="Use of funds" className="sm:col-span-2">
            <Textarea
              rows={2}
              value={business.useOfFunds}
              onChange={(e) => update("useOfFunds", e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Owners / Personal Guarantors</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOwners((arr) => [...arr, blankOwner()])}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add owner
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {owners.map((o, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border/60 bg-steel-50/40 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-navy-800">
                  Owner {idx + 1}
                </p>
                {owners.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setOwners((arr) => arr.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="First name *" required>
                  <Input
                    value={o.firstName}
                    onChange={(e) =>
                      updateOwner(idx, { firstName: e.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Last name *" required>
                  <Input
                    value={o.lastName}
                    onChange={(e) =>
                      updateOwner(idx, { lastName: e.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Ownership % *" required>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={o.ownershipPct}
                    onChange={(e) =>
                      updateOwner(idx, { ownershipPct: e.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="SSN">
                  <Input
                    value={o.ssn}
                    onChange={(e) => updateOwner(idx, { ssn: e.target.value })}
                    placeholder="XXX-XX-XXXX"
                  />
                </Field>
                <Field label="DOB">
                  <Input
                    type="date"
                    value={o.dob}
                    onChange={(e) => updateOwner(idx, { dob: e.target.value })}
                  />
                </Field>
                <Field label="Claimed FICO">
                  <Input
                    type="number"
                    min={300}
                    max={850}
                    value={o.ficoClaim}
                    onChange={(e) =>
                      updateOwner(idx, { ficoClaim: e.target.value })
                    }
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={o.phone}
                    onChange={(e) =>
                      updateOwner(idx, { phone: e.target.value })
                    }
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={o.email}
                    onChange={(e) =>
                      updateOwner(idx, { email: e.target.value })
                    }
                  />
                </Field>
                <Field label="Home address" className="sm:col-span-2">
                  <Input
                    value={o.homeAddress}
                    onChange={(e) =>
                      updateOwner(idx, { homeAddress: e.target.value })
                    }
                  />
                </Field>
                <label className="flex items-start gap-2 text-xs text-steel-600 sm:col-span-2">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={o.pgConsent}
                    onChange={(e) =>
                      updateOwner(idx, { pgConsent: e.target.checked })
                    }
                  />
                  <span>
                    Personal guarantor has authorized a soft/hard consumer-credit pull
                    under FCRA §604(a)(3)(A). Required before pulling consumer credit.
                  </span>
                </label>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting} className="bg-navy-700 hover:bg-navy-800">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            "Create application"
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-steel-600">
        {label}
        {required ? "" : ""}
      </Label>
      {children}
    </div>
  );
}
