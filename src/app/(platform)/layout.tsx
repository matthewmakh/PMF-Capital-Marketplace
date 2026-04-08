import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/session-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

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
      <div className="flex h-screen overflow-hidden">
        <Sidebar userRole={role} userName={fullName} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar userName={fullName} userRole={role} />
          <main className="flex-1 overflow-y-auto bg-steel-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
