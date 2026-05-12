"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Banknote, Check, Loader2 } from "lucide-react";

// Plaid Link is loaded dynamically. We keep a single typed interface for it
// rather than pulling react-plaid-link as another dependency.

interface PlaidHandler {
  open: () => void;
  exit: () => void;
  destroy: () => void;
}

declare global {
  interface Window {
    Plaid?: {
      create: (opts: {
        token: string;
        onSuccess: (publicToken: string) => void;
        onExit?: (err: unknown) => void;
      }) => PlaidHandler;
    };
  }
}

function loadPlaidScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Plaid) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Plaid load")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Plaid load"));
    document.body.appendChild(s);
  });
}

export function PlaidLinkButton({ token }: { token: string }) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    fetch(`/api/apply/${token}/plaid/link-token`, { method: "POST" })
      .then((r) => r.json())
      .then((data: { link_token: string }) => {
        setLinkToken(data.link_token);
        if (data.link_token.startsWith("mock-")) setMockMode(true);
      })
      .catch(() => setError("Could not initialize bank link"));
  }, [token]);

  const exchange = useCallback(
    async (publicToken: string) => {
      setLoading(true);
      try {
        const resp = await fetch(`/api/apply/${token}/plaid/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicToken }),
        });
        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          throw new Error(body.error || `Error ${resp.status}`);
        }
        setDone(true);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const open = useCallback(async () => {
    if (!linkToken) return;
    setError(null);
    if (mockMode) {
      // Mock-mode shortcut — submit a fake public token straight to /exchange.
      // Useful for local dev without a Plaid account.
      await exchange(`mock-public-token-${Date.now()}`);
      return;
    }
    try {
      await loadPlaidScript();
      const handler = window.Plaid!.create({
        token: linkToken,
        onSuccess: (publicToken: string) => {
          void exchange(publicToken);
        },
      });
      handler.open();
    } catch {
      setError("Could not open Plaid Link");
    }
  }, [linkToken, mockMode, exchange]);

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-profit/30 bg-profit-light/40 px-3 py-2 text-sm text-profit">
        <Check className="h-4 w-4" />
        Bank linked — your application is now under review.
      </div>
    );
  }

  return (
    <div>
      <Button
        onClick={open}
        disabled={!linkToken || loading}
        className="bg-navy-700 hover:bg-navy-800"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Banknote className="mr-2 h-4 w-4" />
        )}
        {mockMode ? "Connect bank (sandbox)" : "Connect with Plaid"}
      </Button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
