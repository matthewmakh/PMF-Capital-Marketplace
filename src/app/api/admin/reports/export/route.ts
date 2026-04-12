import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { DEAL_STATUS_LABELS } from "@/lib/constants";
import { DealStatus } from "@prisma/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "deals";

  if (type === "deals") {
    const deals = await prisma.deal.findMany({
      include: {
        _count: { select: { syndications: true, payments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const header = [
      "Merchant", "Status", "Funded Amount", "Payback Amount",
      "Factor Rate", "Total Collected", "Collection %",
      "Investors", "Payments", "Created",
    ].join(",");

    const rows = deals.map((d) => {
      const collectionPct =
        Number(d.paybackAmount) > 0
          ? ((Number(d.totalCollected) / Number(d.paybackAmount)) * 100).toFixed(1)
          : "0";
      return [
        `"${d.merchantName.replace(/"/g, '""')}"`,
        DEAL_STATUS_LABELS[d.status as DealStatus] || d.status,
        Number(d.fundedAmount).toFixed(2),
        Number(d.paybackAmount).toFixed(2),
        Number(d.factorRate).toFixed(2),
        Number(d.totalCollected).toFixed(2),
        `${collectionPct}%`,
        d._count.syndications,
        d._count.payments,
        d.createdAt.toISOString().split("T")[0],
      ].join(",");
    });

    const csv = [header, ...rows].join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="deals-report-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  if (type === "payouts") {
    const payouts = await prisma.payoutRequest.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const header = [
      "User", "Email", "Amount", "Status", "Requested", "Completed",
    ].join(",");

    const rows = payouts.map((p) => [
      `"${p.user.firstName} ${p.user.lastName}"`,
      p.user.email,
      Number(p.amount).toFixed(2),
      p.status,
      p.createdAt.toISOString().split("T")[0],
      p.completedAt ? p.completedAt.toISOString().split("T")[0] : "",
    ].join(","));

    const csv = [header, ...rows].join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="payouts-report-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
}
