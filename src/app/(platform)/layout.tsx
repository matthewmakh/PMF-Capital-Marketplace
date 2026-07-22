import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/session-provider";
import { PlatformShell } from "@/components/layout/platform-shell";
import { Toaster } from "@/components/ui/sonner";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { firstName, lastName, role } = session.user;
  const fullName = `${firstName} ${lastName}`;

  return (
    <SessionProvider>
      <PlatformShell userName={fullName} userRole={role}>
        {children}
      </PlatformShell>
      <Toaster />
    </SessionProvider>
  );
}
