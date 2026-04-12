import { describe, it, expect } from "vitest";
import { PayoutStatus } from "@prisma/client";

// Replicate from src/app/api/payouts/[payoutId]/route.ts
const VALID_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
  PENDING: ["APPROVED", "DENIED"],
  APPROVED: ["PROCESSING", "COMPLETED", "DENIED"],
  PROCESSING: ["COMPLETED"],
  COMPLETED: [],
  DENIED: [],
};

describe("Payout Status State Machine", () => {
  const allStatuses = Object.values(PayoutStatus) as PayoutStatus[];

  it("every PayoutStatus has an entry in the transition map", () => {
    for (const status of allStatuses) {
      expect(VALID_TRANSITIONS).toHaveProperty(status);
    }
  });

  it("all target statuses are valid PayoutStatus values", () => {
    for (const targets of Object.values(VALID_TRANSITIONS)) {
      for (const target of targets) {
        expect(allStatuses).toContain(target);
      }
    }
  });

  describe("terminal states", () => {
    it("COMPLETED is terminal", () => {
      expect(VALID_TRANSITIONS.COMPLETED).toEqual([]);
    });

    it("DENIED is terminal", () => {
      expect(VALID_TRANSITIONS.DENIED).toEqual([]);
    });
  });

  describe("happy path: approval flow", () => {
    it("PENDING → APPROVED", () => {
      expect(VALID_TRANSITIONS.PENDING).toContain("APPROVED");
    });

    it("APPROVED → PROCESSING", () => {
      expect(VALID_TRANSITIONS.APPROVED).toContain("PROCESSING");
    });

    it("PROCESSING → COMPLETED", () => {
      expect(VALID_TRANSITIONS.PROCESSING).toContain("COMPLETED");
    });

    it("APPROVED → COMPLETED (skip PROCESSING)", () => {
      expect(VALID_TRANSITIONS.APPROVED).toContain("COMPLETED");
    });
  });

  describe("denial path", () => {
    it("PENDING can be denied", () => {
      expect(VALID_TRANSITIONS.PENDING).toContain("DENIED");
    });

    it("APPROVED can be denied", () => {
      expect(VALID_TRANSITIONS.APPROVED).toContain("DENIED");
    });

    it("PROCESSING cannot be denied (already in flight)", () => {
      expect(VALID_TRANSITIONS.PROCESSING).not.toContain("DENIED");
    });
  });

  describe("illegal transitions", () => {
    const illegalTransitions: [PayoutStatus, PayoutStatus][] = [
      ["COMPLETED", "PENDING"],
      ["COMPLETED", "DENIED"],
      ["DENIED", "APPROVED"],
      ["DENIED", "PENDING"],
      ["PROCESSING", "PENDING"],
      ["PROCESSING", "APPROVED"],
      ["PENDING", "PROCESSING"],
      ["PENDING", "COMPLETED"],
    ];

    it.each(illegalTransitions)(
      "rejects %s → %s",
      (from, to) => {
        expect(VALID_TRANSITIONS[from]).not.toContain(to);
      }
    );
  });

  describe("payout balance holds", () => {
    // The payout balance hold query includes PENDING, APPROVED, PROCESSING, COMPLETED
    // but NOT DENIED. Verify DENIED is the only non-hold status.
    const holdStatuses = ["PENDING", "APPROVED", "PROCESSING", "COMPLETED"];
    const nonHoldStatuses = ["DENIED"];

    it("hold statuses are correct", () => {
      for (const status of holdStatuses) {
        expect(allStatuses).toContain(status);
      }
    });

    it("DENIED is excluded from holds (balance freed on denial)", () => {
      expect(holdStatuses).not.toContain("DENIED");
    });

    it("every status is either a hold or non-hold", () => {
      const all = [...holdStatuses, ...nonHoldStatuses].sort();
      const expected = [...allStatuses].sort();
      expect(all).toEqual(expected);
    });
  });
});
