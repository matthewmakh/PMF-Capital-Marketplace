import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import {
  reconcileSyndication,
  reconcileDealTotal,
} from "@/lib/calculations/pro-rata";

/**
 * GET /api/admin/reconcile?dealId=xxx
 *
 * Verifies that running totals on syndications and deals match the
 * sum of their immutable distribution/payment records. Returns any
 * discrepancies found.
 *
 * This is a read-only audit — it does not modify data.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const dealId = searchParams.get("dealId");

  const issues: {
    type: string;
    id: string;
    details: Record<string, string>[];
  }[] = [];

  await prisma.$transaction(async (tx) => {
    if (dealId) {
      // Reconcile a specific deal
      const dealDiscrepancy = await reconcileDealTotal(tx, dealId);
      if (dealDiscrepancy) {
        issues.push({
          type: "deal_total",
          id: dealId,
          details: [dealDiscrepancy],
        });
      }

      const syndications = await tx.syndication.findMany({
        where: { dealId },
      });
      for (const s of syndications) {
        const discrepancies = await reconcileSyndication(tx, s.id);
        if (discrepancies.length > 0) {
          issues.push({
            type: "syndication",
            id: s.id,
            details: discrepancies,
          });
        }
      }
    } else {
      // Reconcile all active deals
      const deals = await tx.deal.findMany({
        where: {
          status: { in: ["ACTIVE_REPAYING", "DELINQUENT", "PAID_OFF"] },
        },
      });

      for (const deal of deals) {
        const dealDiscrepancy = await reconcileDealTotal(tx, deal.id);
        if (dealDiscrepancy) {
          issues.push({
            type: "deal_total",
            id: deal.id,
            details: [
              {
                field: "totalCollected",
                stored: dealDiscrepancy.stored,
                computed: dealDiscrepancy.computed,
              },
            ],
          });
        }

        const syndications = await tx.syndication.findMany({
          where: { dealId: deal.id },
        });
        for (const s of syndications) {
          const discrepancies = await reconcileSyndication(tx, s.id);
          if (discrepancies.length > 0) {
            issues.push({
              type: "syndication",
              id: s.id,
              details: discrepancies,
            });
          }
        }
      }
    }
  });

  return NextResponse.json({
    clean: issues.length === 0,
    issueCount: issues.length,
    issues,
  });
}
