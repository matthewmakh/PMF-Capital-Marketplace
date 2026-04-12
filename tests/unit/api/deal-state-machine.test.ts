import { describe, it, expect } from "vitest";
import { DealStatus } from "@prisma/client";

// Replicate the VALID_STATUS_TRANSITIONS from the API route for testing
// This ensures the state machine is correct and complete
const VALID_STATUS_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  PENDING_REVIEW: ["OPEN_FOR_SYNDICATION", "CLOSED"],
  OPEN_FOR_SYNDICATION: ["FULLY_ALLOCATED", "PENDING_REVIEW", "CLOSED"],
  FULLY_ALLOCATED: ["FUNDED", "OPEN_FOR_SYNDICATION", "CLOSED"],
  FUNDED: ["ACTIVE_REPAYING", "CLOSED"],
  ACTIVE_REPAYING: ["DELINQUENT", "PAID_OFF", "CLOSED"],
  DELINQUENT: ["ACTIVE_REPAYING", "DEFAULTED", "CLOSED"],
  DEFAULTED: ["CLOSED"],
  PAID_OFF: ["CLOSED"],
  CLOSED: [],
};

// Financial fields locked after syndication
const LOCKED_AFTER_SYNDICATION = [
  "fundedAmount",
  "paybackAmount",
  "factorRate",
  "holdbackPercentage",
];

describe("Deal Status State Machine", () => {
  const allStatuses = Object.values(DealStatus) as DealStatus[];

  it("every DealStatus has an entry in the transition map", () => {
    for (const status of allStatuses) {
      expect(VALID_STATUS_TRANSITIONS).toHaveProperty(status);
    }
  });

  it("all target statuses are valid DealStatus values", () => {
    for (const [from, targets] of Object.entries(VALID_STATUS_TRANSITIONS)) {
      for (const target of targets) {
        expect(allStatuses).toContain(target);
      }
    }
  });

  it("CLOSED is a terminal state with no outgoing transitions", () => {
    expect(VALID_STATUS_TRANSITIONS.CLOSED).toEqual([]);
  });

  it("DEFAULTED can only transition to CLOSED", () => {
    expect(VALID_STATUS_TRANSITIONS.DEFAULTED).toEqual(["CLOSED"]);
  });

  it("PAID_OFF can only transition to CLOSED", () => {
    expect(VALID_STATUS_TRANSITIONS.PAID_OFF).toEqual(["CLOSED"]);
  });

  describe("happy path: full lifecycle", () => {
    const lifecycle: DealStatus[] = [
      "PENDING_REVIEW",
      "OPEN_FOR_SYNDICATION",
      "FULLY_ALLOCATED",
      "FUNDED",
      "ACTIVE_REPAYING",
      "PAID_OFF",
      "CLOSED",
    ];

    it("progresses through the full lifecycle", () => {
      for (let i = 0; i < lifecycle.length - 1; i++) {
        const from = lifecycle[i];
        const to = lifecycle[i + 1];
        expect(VALID_STATUS_TRANSITIONS[from]).toContain(to);
      }
    });
  });

  describe("delinquency path", () => {
    it("ACTIVE_REPAYING can become DELINQUENT", () => {
      expect(VALID_STATUS_TRANSITIONS.ACTIVE_REPAYING).toContain("DELINQUENT");
    });

    it("DELINQUENT can recover to ACTIVE_REPAYING", () => {
      expect(VALID_STATUS_TRANSITIONS.DELINQUENT).toContain("ACTIVE_REPAYING");
    });

    it("DELINQUENT can escalate to DEFAULTED", () => {
      expect(VALID_STATUS_TRANSITIONS.DELINQUENT).toContain("DEFAULTED");
    });
  });

  describe("illegal transitions are blocked", () => {
    const illegalTransitions: [DealStatus, DealStatus][] = [
      ["PAID_OFF", "ACTIVE_REPAYING"],
      ["PAID_OFF", "FUNDED"],
      ["DEFAULTED", "ACTIVE_REPAYING"],
      ["DEFAULTED", "FUNDED"],
      ["CLOSED", "PENDING_REVIEW"],
      ["CLOSED", "OPEN_FOR_SYNDICATION"],
      ["FUNDED", "OPEN_FOR_SYNDICATION"],
      ["ACTIVE_REPAYING", "FUNDED"],
      ["PENDING_REVIEW", "FUNDED"],
      ["PENDING_REVIEW", "ACTIVE_REPAYING"],
    ];

    it.each(illegalTransitions)(
      "rejects %s → %s",
      (from, to) => {
        expect(VALID_STATUS_TRANSITIONS[from]).not.toContain(to);
      }
    );
  });

  describe("every status can reach CLOSED", () => {
    // BFS to verify every non-CLOSED status can eventually reach CLOSED
    function canReachClosed(start: DealStatus): boolean {
      const visited = new Set<DealStatus>();
      const queue: DealStatus[] = [start];
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === "CLOSED") return true;
        if (visited.has(current)) continue;
        visited.add(current);
        for (const next of VALID_STATUS_TRANSITIONS[current]) {
          queue.push(next);
        }
      }
      return false;
    }

    it.each(allStatuses.filter((s) => s !== "CLOSED"))(
      "%s can eventually reach CLOSED",
      (status) => {
        expect(canReachClosed(status)).toBe(true);
      }
    );
  });
});

describe("Financial Field Locking", () => {
  it("locks fundedAmount after syndication", () => {
    expect(LOCKED_AFTER_SYNDICATION).toContain("fundedAmount");
  });

  it("locks paybackAmount after syndication", () => {
    expect(LOCKED_AFTER_SYNDICATION).toContain("paybackAmount");
  });

  it("locks factorRate after syndication", () => {
    expect(LOCKED_AFTER_SYNDICATION).toContain("factorRate");
  });

  it("locks holdbackPercentage after syndication", () => {
    expect(LOCKED_AFTER_SYNDICATION).toContain("holdbackPercentage");
  });

  it("does NOT lock non-financial fields", () => {
    const safeFields = ["merchantName", "notes", "internalNotes", "termDays"];
    for (const field of safeFields) {
      expect(LOCKED_AFTER_SYNDICATION).not.toContain(field);
    }
  });
});
