import { auth } from "@/lib/auth";
import { canUnderwrite as canUnderwriteFn } from "@/lib/permissions";

export async function requireUnderwriter() {
  const session = await auth();
  if (!session?.user || !canUnderwriteFn(session.user.role)) {
    return { ok: false as const, status: 403 as const };
  }
  return { ok: true as const, user: session.user };
}
