import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default async function BankAccountsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <PageHeader title="Bank Accounts" description="Manage your linked bank accounts for payouts" />

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <Building2 className="h-12 w-12 text-steel-300 mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 mb-2">Connect Your Bank Account</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Link your bank account securely through Plaid to receive payout transfers.
            Your banking credentials are never stored on our servers.
          </p>
          <Button className="bg-navy-700 hover:bg-navy-800" disabled>
            Connect with Plaid (Coming Soon)
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Plaid integration will be available in the next release.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
