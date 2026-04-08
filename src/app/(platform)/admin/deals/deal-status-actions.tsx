"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DealStatus } from "@prisma/client";

const statusTransitions: Partial<Record<DealStatus, { label: string; next: DealStatus }[]>> = {
  PENDING_REVIEW: [
    { label: "Publish", next: "OPEN_FOR_SYNDICATION" },
    { label: "Close", next: "CLOSED" },
  ],
  OPEN_FOR_SYNDICATION: [
    { label: "Mark Funded", next: "FUNDED" },
    { label: "Close", next: "CLOSED" },
  ],
  FULLY_ALLOCATED: [
    { label: "Mark Funded", next: "FUNDED" },
  ],
  FUNDED: [
    { label: "Start Repayment", next: "ACTIVE_REPAYING" },
  ],
  ACTIVE_REPAYING: [
    { label: "Mark Delinquent", next: "DELINQUENT" },
    { label: "Mark Paid Off", next: "PAID_OFF" },
  ],
  DELINQUENT: [
    { label: "Resume Active", next: "ACTIVE_REPAYING" },
    { label: "Default", next: "DEFAULTED" },
  ],
};

interface Props {
  dealId: string;
  currentStatus: DealStatus;
}

export function DealStatusActions({ dealId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const transitions = statusTransitions[currentStatus] || [];

  async function handleStatusChange(newStatus: DealStatus) {
    setLoading(true);
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (transitions.length === 0) return null;

  return (
    <div className="flex gap-2">
      {transitions.map((t) => (
        <Button
          key={t.next}
          size="sm"
          variant={t.next === "CLOSED" || t.next === "DEFAULTED" ? "destructive" : "outline"}
          onClick={() => handleStatusChange(t.next)}
          disabled={loading}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}
