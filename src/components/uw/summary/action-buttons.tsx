"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, BarChart3, ScanSearch } from "lucide-react";

interface ActionButtonsProps {
  appId: string;
  hasBankDocs: boolean;
}

export function ActionButtons({ appId, hasBankDocs }: ActionButtonsProps) {
  const router = useRouter();
  const [running, setRunning] = useState<"analyze" | "pulls" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (path: "analyze" | "pulls") => {
    setRunning(path);
    setError(null);
    try {
      const resp = await fetch(`/api/uw/applications/${appId}/${path}`, {
        method: "POST",
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.error || `Error ${resp.status}`);
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        type="button"
        variant="outline"
        onClick={() => run("analyze")}
        disabled={running !== null || !hasBankDocs}
        title={
          hasBankDocs
            ? "Run bank-statement analytics"
            : "Upload bank statements first"
        }
      >
        {running === "analyze" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <BarChart3 className="mr-2 h-4 w-4" />
        )}
        Analyze statements
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => run("pulls")}
        disabled={running !== null}
      >
        {running === "pulls" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ScanSearch className="mr-2 h-4 w-4" />
        )}
        Run third-party pulls
      </Button>
      {error && (
        <p className="text-xs text-danger sm:self-center">{error}</p>
      )}
    </div>
  );
}
