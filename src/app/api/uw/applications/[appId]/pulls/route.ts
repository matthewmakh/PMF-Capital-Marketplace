import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUnderwriter } from "@/lib/uw/permissions";
import {
  idVerify,
  ofacScreen,
  pullBusinessCredit,
  pullConsumerCredit,
} from "@/lib/uw/vendors/microbilt";
import { lookup as datamerchLookup } from "@/lib/uw/vendors/datamerch";
import { searchLiens } from "@/lib/uw/vendors/ucc";
import { lookupBusiness as kybLookup } from "@/lib/uw/vendors/kyb";
import { logAction, getRequestContext } from "@/lib/audit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ appId: string }> }
) {
  const guard = await requireUnderwriter();
  if (!guard.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: guard.status });
  }
  const { appId } = await params;

  const app = await prisma.uwApplication.findUnique({
    where: { id: appId },
    include: { owners: { orderBy: { ownershipPct: "desc" } } },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const primary = app.owners[0];

  // Run pulls in parallel; each adapter resolves to a typed VendorResult.
  const [ofac, idv, consumer, business, dm, ucc, kyb] = await Promise.all([
    primary
      ? ofacScreen({
          firstName: primary.firstName,
          lastName: primary.lastName,
          legalName: app.legalName,
        })
      : Promise.resolve({ ok: false as const, error: "No primary owner" }),
    primary
      ? idVerify({
          firstName: primary.firstName,
          lastName: primary.lastName,
          homeAddress: primary.homeAddress ?? undefined,
        })
      : Promise.resolve({ ok: false as const, error: "No primary owner" }),
    primary && primary.pgConsent
      ? pullConsumerCredit({
          firstName: primary.firstName,
          lastName: primary.lastName,
          pullType: "soft",
        })
      : Promise.resolve({
          ok: false as const,
          error: "No PG consent on file — cannot pull consumer credit",
        }),
    pullBusinessCredit({
      legalName: app.legalName,
      ein: app.ein ?? undefined,
      state: app.state ?? undefined,
    }),
    datamerchLookup({ legalName: app.legalName, ein: app.ein ?? undefined }),
    searchLiens({
      legalName: app.legalName,
      state: app.state ?? undefined,
      ein: app.ein ?? undefined,
    }),
    kybLookup({
      legalName: app.legalName,
      state: app.state ?? undefined,
      ein: app.ein ?? undefined,
    }),
  ]);

  const pulls = [
    { vendor: "microbilt_ofac", result: ofac },
    { vendor: "microbilt_id_verify", result: idv },
    { vendor: "microbilt_consumer_credit", result: consumer },
    { vendor: "microbilt_business_credit", result: business },
    { vendor: "datamerch", result: dm },
    { vendor: "ucc_liens", result: ucc },
    { vendor: "kyb", result: kyb },
  ];

  await prisma.$transaction(
    pulls.map((p) =>
      prisma.uwVendorPull.create({
        data: {
          applicationId: appId,
          vendor: p.vendor,
          status: p.result.ok ? "ok" : "error",
          resultJson: p.result.ok ? (p.result.data as unknown as object) : undefined,
          errorMessage: !p.result.ok ? p.result.error : null,
        },
      })
    )
  );

  const ctx = getRequestContext(req);
  await logAction({
    action: "UW_VENDOR_PULL",
    actorId: guard.user.id,
    resourceType: "UwApplication",
    resourceId: appId,
    metadata: {
      vendors: pulls.map((p) => ({ vendor: p.vendor, ok: p.result.ok })),
    },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  return NextResponse.json({ runs: pulls.length });
}
