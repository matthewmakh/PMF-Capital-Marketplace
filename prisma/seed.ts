import { PrismaClient, UserRole, DealStatus, PayoutStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ============================================================
  // USERS
  // ============================================================

  const superSuperAdmin = await prisma.user.upsert({
    where: { email: "matt@tyeny.com" },
    update: {},
    create: {
      email: "matt@tyeny.com",
      passwordHash: await bcrypt.hash("Tyemakharadze9", 12),
      firstName: "Matt",
      lastName: "System",
      role: UserRole.SUPER_SUPER_ADMIN,
      isActive: true,
      isHidden: true,
    },
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@pmfcapital.com" },
    update: {},
    create: {
      email: "admin@pmfcapital.com",
      passwordHash: await bcrypt.hash("Test123!", 12),
      firstName: "James",
      lastName: "Morrison",
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "ops@pmfcapital.com" },
    update: {},
    create: {
      email: "ops@pmfcapital.com",
      passwordHash: await bcrypt.hash("Test123!", 12),
      firstName: "Sarah",
      lastName: "Chen",
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const rep1 = await prisma.user.upsert({
    where: { email: "rep1@pmfcapital.com" },
    update: {},
    create: {
      email: "rep1@pmfcapital.com",
      passwordHash: await bcrypt.hash("Test123!", 12),
      firstName: "Michael",
      lastName: "Torres",
      role: UserRole.SYNDICATE_REP,
      isActive: true,
    },
  });

  const rep2 = await prisma.user.upsert({
    where: { email: "rep2@pmfcapital.com" },
    update: {},
    create: {
      email: "rep2@pmfcapital.com",
      passwordHash: await bcrypt.hash("Test123!", 12),
      firstName: "Jessica",
      lastName: "Park",
      role: UserRole.SYNDICATE_REP,
      isActive: true,
    },
  });

  const exec = await prisma.user.upsert({
    where: { email: "exec@pmfcapital.com" },
    update: {},
    create: {
      email: "exec@pmfcapital.com",
      passwordHash: await bcrypt.hash("Test123!", 12),
      firstName: "David",
      lastName: "Whitfield",
      role: UserRole.READ_ONLY,
      isActive: true,
    },
  });

  console.log("Users seeded.");

  // ============================================================
  // DEALS
  // ============================================================

  const deal1 = await prisma.deal.upsert({
    where: { id: "deal-001" },
    update: {},
    create: {
      id: "deal-001",
      merchantName: "Metro Quick Mart LLC",
      merchantDba: "Metro Quick Mart",
      merchantIndustry: "Retail",
      merchantState: "NY",
      fundedAmount: 50000,
      paybackAmount: 67500,
      factorRate: 1.35,
      termDays: 180,
      paymentFrequency: "daily",
      expectedPayments: 180,
      syndicationMin: 100,
      syndicationMax: 25000,
      syndicationOpen: 0,
      status: DealStatus.ACTIVE_REPAYING,
      fundedAt: new Date("2025-11-01"),
      firstPaymentAt: new Date("2025-11-04"),
      lastPaymentAt: new Date("2026-04-05"),
      totalCollected: 42000,
      createdById: admin.id,
      reviewedById: superAdmin.id,
      notes: "Strong retail location, consistent daily revenue. Renewal customer.",
    },
  });

  const deal2 = await prisma.deal.upsert({
    where: { id: "deal-002" },
    update: {},
    create: {
      id: "deal-002",
      merchantName: "Bella's Italian Kitchen",
      merchantDba: "Bella's",
      merchantIndustry: "Restaurant",
      merchantState: "NJ",
      fundedAmount: 35000,
      paybackAmount: 47250,
      factorRate: 1.35,
      termDays: 150,
      paymentFrequency: "daily",
      expectedPayments: 150,
      syndicationMin: 100,
      syndicationMax: 15000,
      syndicationOpen: 5000,
      status: DealStatus.OPEN_FOR_SYNDICATION,
      createdById: admin.id,
      reviewedById: superAdmin.id,
      notes: "Popular restaurant in downtown area. First-time funding.",
    },
  });

  const deal3 = await prisma.deal.upsert({
    where: { id: "deal-003" },
    update: {},
    create: {
      id: "deal-003",
      merchantName: "Summit Auto Repair",
      merchantIndustry: "Automotive",
      merchantState: "PA",
      fundedAmount: 75000,
      paybackAmount: 101250,
      factorRate: 1.35,
      termDays: 200,
      paymentFrequency: "daily",
      expectedPayments: 200,
      syndicationMin: 500,
      syndicationMax: 30000,
      syndicationOpen: 75000,
      status: DealStatus.PENDING_REVIEW,
      createdById: admin.id,
      notes: "Auto repair chain. 3 locations. Strong revenue.",
      internalNotes: "Awaiting bank statement review.",
    },
  });

  const deal4 = await prisma.deal.upsert({
    where: { id: "deal-004" },
    update: {},
    create: {
      id: "deal-004",
      merchantName: "Sunrise Laundromat",
      merchantIndustry: "Services",
      merchantState: "CT",
      fundedAmount: 20000,
      paybackAmount: 27000,
      factorRate: 1.35,
      termDays: 120,
      paymentFrequency: "daily",
      expectedPayments: 120,
      syndicationMin: 100,
      syndicationMax: 10000,
      syndicationOpen: 0,
      status: DealStatus.PAID_OFF,
      fundedAt: new Date("2025-06-01"),
      firstPaymentAt: new Date("2025-06-03"),
      lastPaymentAt: new Date("2025-10-01"),
      closedAt: new Date("2025-10-01"),
      totalCollected: 27000,
      createdById: admin.id,
      reviewedById: superAdmin.id,
      notes: "Fully paid off. Excellent payment history.",
    },
  });

  const deal5 = await prisma.deal.upsert({
    where: { id: "deal-005" },
    update: {},
    create: {
      id: "deal-005",
      merchantName: "Downtown Deli & Catering",
      merchantDba: "Downtown Deli",
      merchantIndustry: "Restaurant",
      merchantState: "NY",
      fundedAmount: 40000,
      paybackAmount: 56000,
      factorRate: 1.4,
      termDays: 160,
      paymentFrequency: "daily",
      expectedPayments: 160,
      syndicationMin: 100,
      syndicationMax: 20000,
      syndicationOpen: 0,
      status: DealStatus.DELINQUENT,
      fundedAt: new Date("2025-09-15"),
      firstPaymentAt: new Date("2025-09-18"),
      lastPaymentAt: new Date("2026-02-10"),
      totalCollected: 28000,
      missedPayments: 12,
      createdById: admin.id,
      reviewedById: superAdmin.id,
      notes: "Missed multiple payments starting January. Under review.",
    },
  });

  const deal6 = await prisma.deal.upsert({
    where: { id: "deal-006" },
    update: {},
    create: {
      id: "deal-006",
      merchantName: "Greenfield Medical Supply",
      merchantIndustry: "Healthcare",
      merchantState: "MA",
      fundedAmount: 60000,
      paybackAmount: 78000,
      factorRate: 1.3,
      termDays: 180,
      paymentFrequency: "weekly",
      expectedPayments: 26,
      syndicationMin: 250,
      syndicationMax: 25000,
      syndicationOpen: 15000,
      status: DealStatus.OPEN_FOR_SYNDICATION,
      createdById: admin.id,
      reviewedById: superAdmin.id,
      notes: "Medical supply distributor. Weekly ACH payments.",
    },
  });

  console.log("Deals seeded.");

  // ============================================================
  // SYNDICATIONS
  // ============================================================

  // Deal 1 (Active) — fully syndicated
  const synd1a = await prisma.syndication.upsert({
    where: { dealId_userId: { dealId: deal1.id, userId: rep1.id } },
    update: {},
    create: {
      dealId: deal1.id,
      userId: rep1.id,
      amount: 30000,
      ownershipPct: 60.0,
      principalReturned: 25200,
      profitEarned: 0,
      totalDistributed: 25200,
    },
  });

  const synd1b = await prisma.syndication.upsert({
    where: { dealId_userId: { dealId: deal1.id, userId: rep2.id } },
    update: {},
    create: {
      dealId: deal1.id,
      userId: rep2.id,
      amount: 20000,
      ownershipPct: 40.0,
      principalReturned: 16800,
      profitEarned: 0,
      totalDistributed: 16800,
    },
  });

  // Deal 2 (Open) — partially syndicated
  await prisma.syndication.upsert({
    where: { dealId_userId: { dealId: deal2.id, userId: rep1.id } },
    update: {},
    create: {
      dealId: deal2.id,
      userId: rep1.id,
      amount: 15000,
      ownershipPct: 42.86,
    },
  });

  await prisma.syndication.upsert({
    where: { dealId_userId: { dealId: deal2.id, userId: rep2.id } },
    update: {},
    create: {
      dealId: deal2.id,
      userId: rep2.id,
      amount: 15000,
      ownershipPct: 42.86,
    },
  });

  // Deal 4 (Paid off) — fully syndicated and returned
  await prisma.syndication.upsert({
    where: { dealId_userId: { dealId: deal4.id, userId: rep1.id } },
    update: {},
    create: {
      dealId: deal4.id,
      userId: rep1.id,
      amount: 12000,
      ownershipPct: 60.0,
      principalReturned: 12000,
      profitEarned: 4200,
      totalDistributed: 16200,
    },
  });

  await prisma.syndication.upsert({
    where: { dealId_userId: { dealId: deal4.id, userId: rep2.id } },
    update: {},
    create: {
      dealId: deal4.id,
      userId: rep2.id,
      amount: 8000,
      ownershipPct: 40.0,
      principalReturned: 8000,
      profitEarned: 2800,
      totalDistributed: 10800,
    },
  });

  // Deal 5 (Delinquent) — fully syndicated
  await prisma.syndication.upsert({
    where: { dealId_userId: { dealId: deal5.id, userId: rep1.id } },
    update: {},
    create: {
      dealId: deal5.id,
      userId: rep1.id,
      amount: 25000,
      ownershipPct: 62.5,
      principalReturned: 17500,
      profitEarned: 0,
      totalDistributed: 17500,
    },
  });

  await prisma.syndication.upsert({
    where: { dealId_userId: { dealId: deal5.id, userId: rep2.id } },
    update: {},
    create: {
      dealId: deal5.id,
      userId: rep2.id,
      amount: 15000,
      ownershipPct: 37.5,
      principalReturned: 10500,
      profitEarned: 0,
      totalDistributed: 10500,
    },
  });

  console.log("Syndications seeded.");

  // ============================================================
  // PAYMENTS (sample for Deal 1)
  // ============================================================

  const paymentDates = [];
  const startDate = new Date("2025-11-04");
  for (let i = 0; i < 112; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    // Skip weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      paymentDates.push(date);
    }
  }

  // Create ~80 payments for deal 1 at $375/day (total ~$42,000 after 112 payments)
  const dailyPayment = 375;
  for (let i = 0; i < Math.min(paymentDates.length, 80); i++) {
    await prisma.payment.create({
      data: {
        dealId: deal1.id,
        amount: dailyPayment,
        paymentDate: paymentDates[i],
        paymentNumber: i + 1,
        postedById: admin.id,
      },
    });
  }

  console.log("Payments seeded.");

  // ============================================================
  // PAYOUT REQUESTS
  // ============================================================

  await prisma.payoutRequest.create({
    data: {
      userId: rep1.id,
      amount: 5000,
      status: PayoutStatus.COMPLETED,
      approvedById: superAdmin.id,
      approvedAt: new Date("2026-01-15"),
      completedAt: new Date("2026-01-17"),
      notes: "Monthly payout from Deal 4 profits.",
    },
  });

  await prisma.payoutRequest.create({
    data: {
      userId: rep2.id,
      amount: 2500,
      status: PayoutStatus.PENDING,
      notes: "Requesting partial return from Deal 1.",
    },
  });

  console.log("Payout requests seeded.");
  console.log("Database seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
