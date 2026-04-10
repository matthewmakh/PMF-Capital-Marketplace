"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldOff, Loader2 } from "lucide-react";

export function MFAToggle() {
  const [mfaRequired, setMfaRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => { setMfaRequired(d.mfa_required === "true"); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function toggle() {
    setSaving(true);
    const newVal = !mfaRequired;
    try {
      await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "mfa_required", value: String(newVal) }) });
      setMfaRequired(newVal);
    } finally { setSaving(false); }
  }

  if (loading) return <Card><CardContent className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-steel-400" /></CardContent></Card>;

  return (
    <Card className={mfaRequired ? "border-profit/20" : "border-warning/20"}>
      <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wide text-steel-500">MFA Enforcement</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${mfaRequired ? "bg-profit-light" : "bg-warning-light"}`}>
              {mfaRequired ? <ShieldCheck className="h-5 w-5 text-profit" /> : <ShieldOff className="h-5 w-5 text-warning" />}
            </div>
            <div>
              <p className={`text-sm font-semibold ${mfaRequired ? "text-profit" : "text-warning"}`}>{mfaRequired ? "MFA Required" : "MFA Optional"}</p>
              <p className="text-xs text-steel-500">{mfaRequired ? "All users must set up 2FA" : "Users can optionally enable 2FA"}</p>
            </div>
          </div>
          <button onClick={toggle} disabled={saving}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-navy-500 ${mfaRequired ? "bg-profit" : "bg-steel-300"} ${saving ? "opacity-50" : ""}`}>
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-1 ${mfaRequired ? "translate-x-6 ml-0.5" : "translate-x-1"}`} />
          </button>
        </div>
        <p className="mt-3 text-[11px] text-steel-400">When enabled, users are required to set up MFA on their next login. Takes effect on new sessions.</p>
      </CardContent>
    </Card>
  );
}
