"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, KeyRound } from "lucide-react";

export default function MFAVerifyPage() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [code, setCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), isRecoveryCode: useRecovery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.remainingRecoveryCodes !== undefined && data.remainingRecoveryCodes < 3) {
        alert(`Warning: Only ${data.remainingRecoveryCodes} recovery codes remaining.`);
      }
      // Update JWT session then hard-navigate to force middleware re-check
      await updateSession({ mfaVerified: true });
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-white shadow-2xl">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-navy-700 mb-4">
          <Shield className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-navy-900">Two-Factor Authentication</h1>
        <p className="mt-1 text-sm text-steel-500">
          {useRecovery ? "Enter one of your recovery codes" : "Enter the 6-digit code from your authenticator app"}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-code">{useRecovery ? "Recovery Code" : "Verification Code"}</Label>
            <Input
              id="mfa-code" type="text"
              inputMode={useRecovery ? "text" : "numeric"}
              maxLength={useRecovery ? 10 : 6}
              placeholder={useRecovery ? "XXXXXXXXXX" : "000000"}
              value={code}
              onChange={(e) => setCode(useRecovery ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, ""))}
              className={useRecovery ? "text-center text-lg tracking-widest font-mono" : "text-center text-2xl tracking-[0.5em] font-mono"}
              autoFocus autoComplete="one-time-code"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full bg-navy-700 hover:bg-navy-800" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
          <button type="button" onClick={() => { setUseRecovery(!useRecovery); setCode(""); setError(""); }}
            className="flex w-full items-center justify-center gap-2 text-sm text-steel-500 hover:text-navy-700 transition-colors">
            <KeyRound className="h-3.5 w-3.5" />
            {useRecovery ? "Use authenticator app instead" : "Use a recovery code"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
