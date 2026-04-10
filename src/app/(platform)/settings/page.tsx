import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, ShieldOff } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { user } = session;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { mfaEnabled: true } });

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account" />
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Name</span><span className="text-sm font-medium">{user.firstName} {user.lastName}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Email</span><span className="text-sm font-medium">{user.email}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Role</span><span className="text-sm font-medium">{ROLE_LABELS[user.role]}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Two-Factor Authentication</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              {dbUser?.mfaEnabled ? (
                <><div className="flex h-10 w-10 items-center justify-center rounded-full bg-profit-light"><ShieldCheck className="h-5 w-5 text-profit" /></div>
                <div><p className="text-sm font-medium text-profit">MFA Enabled</p><p className="text-xs text-steel-500">Secured with 2FA</p></div></>
              ) : (
                <><div className="flex h-10 w-10 items-center justify-center rounded-full bg-steel-100"><ShieldOff className="h-5 w-5 text-steel-400" /></div>
                <div><p className="text-sm font-medium text-steel-700">MFA Not Enabled</p><p className="text-xs text-steel-500">Add an authenticator for security</p></div></>
              )}
            </div>
            <Link href="/settings/mfa"><Button variant={dbUser?.mfaEnabled ? "outline" : "default"} className={!dbUser?.mfaEnabled ? "bg-navy-700 hover:bg-navy-800" : ""}>{dbUser?.mfaEnabled ? "Manage MFA" : "Enable MFA"}</Button></Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Bank Accounts</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Connect your bank account via Plaid for payout processing.</p>
            <Link href="/settings/bank-accounts"><Button variant="outline">Manage Bank Accounts</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
