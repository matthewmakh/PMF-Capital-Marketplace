"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ShieldCheck, Copy, CheckCircle2 } from "lucide-react";

export default function SetupMFAPage() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [step, setStep] = useState<"intro" | "scan" | "recovery">("intro");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function startSetup() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mfa/setup");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep("scan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function confirmSetup() {
    if (code.length !== 6) { setError("Enter a 6-digit code"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mfa/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecoveryCodes(data.recoveryCodes);
      setStep("recovery");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDone() {
    await updateSession({ mfaVerified: true, mfaEnabled: true });
    window.location.href = "/dashboard";
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {step === "intro" && (
        <Card className="bg-white shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-navy-700 mb-4">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-navy-900">Set Up Two-Factor Authentication</h1>
            <p className="mt-2 text-sm text-steel-500">Your organization requires 2FA. You&apos;ll need an authenticator app like Google Authenticator, Apple Passwords, Authy, or 1Password.</p>
          </CardHeader>
          <CardContent>
            {error && <p className="mb-3 text-sm text-danger">{error}</p>}
            <Button onClick={startSetup} disabled={loading} className="w-full bg-navy-700 hover:bg-navy-800">
              {loading ? "Setting up..." : "Get Started"}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "scan" && (
        <Card className="bg-white shadow-2xl">
          <CardHeader className="text-center pb-2">
            <h2 className="text-lg font-semibold text-navy-900">Scan QR Code</h2>
            <p className="text-sm text-steel-500 mt-1">Open your authenticator app and scan this code</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="MFA QR Code" className="h-48 w-48 rounded-lg border" />
              </div>
            )}
            <div className="rounded-lg bg-steel-50 p-3">
              <p className="text-xs text-steel-400 mb-1">Can&apos;t scan? Enter manually:</p>
              <p className="font-mono text-sm font-semibold text-navy-800 break-all select-all">{secret}</p>
            </div>
            <div className="border-t pt-4 space-y-3">
              <h3 className="text-base font-semibold text-navy-900">Enter Verification Code</h3>
              <div className="space-y-2">
                <Label htmlFor="code">6-digit code from your app</Label>
                <Input id="code" type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="text-center text-2xl tracking-[0.5em] font-mono" autoFocus autoComplete="one-time-code" />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button onClick={confirmSetup} disabled={loading} className="w-full bg-navy-700 hover:bg-navy-800">
                {loading ? "Verifying..." : "Verify & Enable MFA"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "recovery" && (
        <Card className="border-profit/30 bg-white shadow-2xl">
          <CardContent className="py-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-profit-light">
                <ShieldCheck className="h-7 w-7 text-profit" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-navy-900 text-center mb-2">MFA Enabled</h2>
            <p className="text-sm text-steel-500 text-center mb-6">Save these recovery codes. Each can only be used once.</p>
            <div className="rounded-lg bg-steel-50 p-4 mb-4">
              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((rc, i) => (
                  <div key={i} className="rounded bg-white px-3 py-1.5 font-mono text-sm text-navy-800 text-center border">{rc}</div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { navigator.clipboard.writeText(recoveryCodes.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex-1">
                {copied ? <CheckCircle2 className="h-4 w-4 mr-2 text-profit" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied!" : "Copy Codes"}
              </Button>
              <Button onClick={handleDone} className="flex-1 bg-navy-700 hover:bg-navy-800">Continue to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
