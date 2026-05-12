import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUnderwriter } from "@/lib/uw/permissions";
import { intakeSchema } from "@/lib/uw/validation";
import { logAction, getRequestContext } from "@/lib/audit";
import { safeEncrypt } from "@/lib/encryption";
import crypto from "crypto";

export async function POST(req: Request) {
  const guard = await requireUnderwriter();
  if (!guard.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: guard.status });
  }

  const body = await req.json();
  const parsed = intakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid intake payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const publicToken = crypto.randomBytes(18).toString("base64url");

  const app = await prisma.uwApplication.create({
    data: {
      publicToken,
      legalName: data.legalName,
      dba: data.dba || null,
      ein: data.ein || null,
      entityType: data.entityType || null,
      naics: data.naics || null,
      state: data.state || null,
      businessPhone: data.businessPhone || null,
      businessEmail: data.businessEmail || null,
      businessAddress: data.businessAddress || null,
      timeInBusinessMonths: data.timeInBusinessMonths ?? null,
      requestedAmount: data.requestedAmount ?? null,
      useOfFunds: data.useOfFunds || null,
      monthlyRevenueClaim: data.monthlyRevenueClaim ?? null,
      createdById: guard.user.id,
      status: "INTAKE",
      owners: {
        create: data.owners.map((o) => ({
          firstName: o.firstName,
          lastName: o.lastName,
          ssnEnc: o.ssn ? safeEncrypt(o.ssn.replace(/-/g, "")) : null,
          dob: o.dob ? new Date(o.dob) : null,
          ownershipPct: o.ownershipPct,
          phone: o.phone || null,
          email: o.email || null,
          homeAddress: o.homeAddress || null,
          ficoClaim: typeof o.ficoClaim === "number" ? o.ficoClaim : null,
          pgConsent: !!o.pgConsent,
          pgConsentAt: o.pgConsent ? new Date() : null,
        })),
      },
    },
  });

  const ctx = getRequestContext(req);
  await logAction({
    action: "UW_APP_CREATED",
    actorId: guard.user.id,
    resourceType: "UwApplication",
    resourceId: app.id,
    metadata: { legalName: data.legalName, requestedAmount: data.requestedAmount },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  return NextResponse.json({ id: app.id, publicToken: app.publicToken });
}
