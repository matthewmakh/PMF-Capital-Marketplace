"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Loader2, ClipboardCheck } from "lucide-react";

export function DecisionPanel({
  appId,
  disabled,
}: {
  appId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const decide = async (decision: "approve" | "decline" | "request_stips") => {
    setSubmitting(decision);
    setError(null);
    try {
      const resp = await fetch(`/api/uw/applications/${appId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, notes }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.error || `Error ${resp.status}`);
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-4 w-4 text-navy-600" />
          Decision
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          rows={3}
          placeholder="Notes (visible in audit log)…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="bg-profit hover:bg-profit/90 text-white"
            disabled={disabled || submitting !== null}
            onClick={() => decide("approve")}
          >
            {submitting === "approve" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Approve
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting !== null}
            onClick={() => decide("request_stips")}
          >
            {submitting === "request_stips" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Request stips
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={submitting !== null}
            onClick={() => decide("decline")}
          >
            {submitting === "decline" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Decline
          </Button>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </CardContent>
    </Card>
  );
}
