"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyableLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-md border border-border/60 bg-steel-50/50 px-3 py-1.5">
      <code className="flex-1 truncate text-xs text-navy-800">{url}</code>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? (
          <>
            <Check className="mr-1 h-3 w-3 text-profit" /> Copied
          </>
        ) : (
          <>
            <Copy className="mr-1 h-3 w-3" /> Copy
          </>
        )}
      </Button>
    </div>
  );
}
