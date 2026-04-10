"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ShieldOff } from "lucide-react";

export default function MFASettingsPage() {
  const router = useRouter();
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [disableCode, setDisableCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [lostDevice, setLostDevice] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/mfa/check").then(r => r.json()).then(d => setMfaEnabled(d.mfaEnabled));
  }, []);

  async function disableMFA(useRecovery = false) {
    const code = useRecovery ? recoveryCode : disableCode;
    if (!useRecovery && disableCode.length !== 6) { setError("Enter a 6-digit code"); return; }
    if (useRecovery && recoveryCode.length < 8) { setError("Enter a valid recovery code"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/mfa/disable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, useRecoveryCode: useRecovery }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMfaEnabled(false);
      setDisableCode(""); setRecoveryCode(""); setLostDevice(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally { setLoading(false); }
  }

  if (mfaEnabled === null) return <div className="py-20 text-center text-steel-400">Loading...</div>;

  return (
    <div>
      <PageHeader title="Two-Factor Authentication" description="Manage your MFA settings" />

      {!mfaEnabled ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <ShieldOff className="h-12 w-12 text-steel-300 mb-4" />
            <h3 className="text-lg font-semibold text-navy-900 mb-2">MFA is not enabled</h3>
            <p className="text-sm text-steel-500 max-w-md mb-6">Add an extra layer of security with an authenticator app.</p>
            <Button onClick={() => router.push("/setup-mfa")} className="bg-navy-700 hover:bg-navy-800">Enable MFA</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card className="border-profit/20 bg-profit-light/20">
            <CardContent className="flex items-center gap-4 py-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-profit-light">
                <ShieldCheck className="h-6 w-6 text-profit" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">MFA is enabled</h3>
                <p className="text-sm text-steel-500">Your account is secured with two-factor authentication.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base text-danger">Disable MFA</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-steel-500">Enter a code from your authenticator app to disable MFA.</p>
              <div className="space-y-2">
                <Label htmlFor="disableCode">Verification Code</Label>
                <Input id="disableCode" type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={disableCode} onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))} className="text-center text-lg tracking-[0.3em] font-mono max-w-xs" />
              </div>
              {!lostDevice && error && <p className="text-sm text-danger">{error}</p>}
              <Button variant="destructive" onClick={() => disableMFA(false)} disabled={loading}>{loading ? "Disabling..." : "Disable MFA"}</Button>
              <div className="pt-2">
                <button type="button" onClick={() => { setLostDevice(!lostDevice); setError(""); }} className="text-sm text-steel-500 hover:text-navy-700">
                  Lost your device? Use a recovery code
                </button>
              </div>
            </CardContent>
          </Card>

          {lostDevice && (
            <Card className="border-warning/20 bg-warning-light/10">
              <CardHeader><CardTitle className="text-base">Reset with Recovery Code</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-steel-500">Enter a saved recovery code to disable MFA, then re-enroll.</p>
                <Input maxLength={10} placeholder="XXXXXXXXXX" value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())} className="text-center text-lg tracking-widest font-mono max-w-xs" />
                {error && <p className="text-sm text-danger">{error}</p>}
                <Button variant="destructive" onClick={() => disableMFA(true)} disabled={loading}>{loading ? "Resetting..." : "Reset MFA"}</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
