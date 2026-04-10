const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Add MFA and idempotency columns if missing
  console.log("Ensuring schema columns exist...");
  const alters = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "mfaEnabled" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "mfaSecret" TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "mfaRecoveryCodes" TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "mfaVerifiedAt" TIMESTAMP(3)`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT UNIQUE`,
  ];
  for (const sql of alters) {
    try { await prisma.$executeRawUnsafe(sql); } catch {}
  }

  // Reset passwords
  console.log("Resetting passwords...");
  const ssaHash = await bcrypt.hash("Tyemakharadze9", 12);
  const testHash = await bcrypt.hash("Test123!", 12);

  const users = [
    { email: "matt@tyeny.com", hash: ssaHash, first: "Matt", last: "System", role: "SUPER_SUPER_ADMIN", hidden: true },
    { email: "admin@pmfcapital.com", hash: testHash, first: "James", last: "Morrison", role: "SUPER_ADMIN", hidden: false },
    { email: "ops@pmfcapital.com", hash: testHash, first: "Sarah", last: "Chen", role: "ADMIN", hidden: false },
    { email: "rep1@pmfcapital.com", hash: testHash, first: "Michael", last: "Torres", role: "SYNDICATE_REP", hidden: false },
    { email: "rep2@pmfcapital.com", hash: testHash, first: "Jessica", last: "Park", role: "SYNDICATE_REP", hidden: false },
    { email: "exec@pmfcapital.com", hash: testHash, first: "David", last: "Whitfield", role: "READ_ONLY", hidden: false },
  ];

  for (const u of users) {
    const updated = await prisma.$executeRawUnsafe(`UPDATE users SET "passwordHash" = $1 WHERE email = $2`, u.hash, u.email);
    if (updated === 0) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO users (id, email, "passwordHash", "firstName", "lastName", role, "isActive", "isHidden", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::"UserRole", true, $6, NOW(), NOW())`,
        u.email, u.hash, u.first, u.last, u.role, u.hidden
      );
      console.log(`  ${u.email} — created`);
    } else {
      console.log(`  ${u.email} — password updated`);
    }
  }
  console.log("Done.");
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
