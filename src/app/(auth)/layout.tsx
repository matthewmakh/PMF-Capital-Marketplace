import { SessionProvider } from "@/components/providers/session-provider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen items-center justify-center bg-navy-900">
        <div className="w-full max-w-md px-4">{children}</div>
      </div>
    </SessionProvider>
  );
}
