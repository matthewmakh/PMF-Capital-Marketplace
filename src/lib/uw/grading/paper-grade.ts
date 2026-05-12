import { PaperGrade } from "@prisma/client";
import type { BankStatementMetrics } from "../statements/types";

export interface PaperGradeInput {
  metrics: BankStatementMetrics;
  fico?: number | null;
  timeInBusinessMonths?: number | null;
}

export interface PaperGradeResult {
  grade: PaperGrade;
  rationale: string[];
}

const tier = {
  A: { fico: 680, tib: 24, rev: 30_000, negDays: 2, nsf: 2, openMca: 0 },
  B: { fico: 620, tib: 12, rev: 15_000, negDays: 4, nsf: 3, openMca: 1 },
  C: { fico: 550, tib: 6, rev: 10_000, negDays: 7, nsf: 5, openMca: 2 },
  D: { fico: 500, tib: 3, rev: 8_000, negDays: 10, nsf: 8, openMca: 3 },
};

function avgMonthlyTrueRev(m: BankStatementMetrics): number {
  const months = m.revenue.monthlyByMonth;
  if (months.length === 0) return 0;
  return months.reduce((s, p) => s + p.trueRev, 0) / months.length;
}

export function gradePaper(input: PaperGradeInput): PaperGradeResult {
  const { metrics, fico, timeInBusinessMonths } = input;
  const avgRev = avgMonthlyTrueRev(metrics);
  const months = metrics.period.monthCount || 1;
  const negPerMonth = metrics.riskEvents.totalNegativeDays / months;
  const nsfPerMonth = metrics.riskEvents.nsfCount / months;
  const openMca = metrics.positions.detected.length;

  const rationale: string[] = [];

  const meets = (t: keyof typeof tier): boolean => {
    const c = tier[t];
    const okFico = fico == null ? true : fico >= c.fico;
    const okTib =
      timeInBusinessMonths == null ? true : timeInBusinessMonths >= c.tib;
    const okRev = avgRev >= c.rev;
    const okNeg = negPerMonth <= c.negDays;
    const okNsf = nsfPerMonth <= c.nsf;
    const okMca = openMca <= c.openMca;
    return okFico && okTib && okRev && okNeg && okNsf && okMca;
  };

  let grade: PaperGrade = PaperGrade.UNGRADED;
  if (meets("A")) grade = PaperGrade.A;
  else if (meets("B")) grade = PaperGrade.B;
  else if (meets("C")) grade = PaperGrade.C;
  else if (meets("D")) grade = PaperGrade.D;

  // Rationale lines
  if (fico != null) rationale.push(`FICO ${fico}`);
  if (timeInBusinessMonths != null)
    rationale.push(`${timeInBusinessMonths} mo in business`);
  rationale.push(`Avg monthly true rev $${Math.round(avgRev).toLocaleString()}`);
  rationale.push(`${negPerMonth.toFixed(1)} neg days/mo`);
  rationale.push(`${nsfPerMonth.toFixed(1)} NSF/mo`);
  rationale.push(`${openMca} open MCA positions`);

  return { grade, rationale };
}
