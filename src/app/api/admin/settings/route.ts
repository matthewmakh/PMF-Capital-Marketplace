import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperSuperAdmin } from "@/lib/permissions";
import { logAction } from "@/lib/audit";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user || !isSuperSuperAdmin(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const settings = await prisma.systemSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  if (!map.mfa_required) map.mfa_required = "false";
  return NextResponse.json(map);
}

const updateSchema = z.object({ key: z.string().min(1), value: z.string() });

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || !isSuperSuperAdmin(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const setting = await prisma.systemSetting.upsert({ where: { key: parsed.data.key }, create: { key: parsed.data.key, value: parsed.data.value }, update: { value: parsed.data.value } });
  await logAction({ action: "SETTINGS_UPDATED", actorId: session.user.id, metadata: { key: parsed.data.key, value: parsed.data.value } });
  return NextResponse.json(setting);
}
