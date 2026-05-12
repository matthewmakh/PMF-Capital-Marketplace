import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canUnderwrite } from "@/lib/permissions";
import { SessionProvider } from "@/components/providers/session-provider";
import { UwShell } from "@/components/uw/shell/uw-shell";

export default async function UwLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }
  if (!canUnderwrite(session.user.role)) {
    redirect("/dashboard");
  }

  const { firstName, lastName, role } = session.user;
  const fullName = `${firstName} ${lastName}`;

  return (
    <SessionProvider>
      <UwShell userName={fullName} userRole={role}>
        {children}
      </UwShell>
    </SessionProvider>
  );
}
