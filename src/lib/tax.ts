// India income tax — FY 2024-25 simplified (illustrative; not legal advice).
// Returns annual tax on taxable income (after standard deduction handled by caller).

export type Regime = "new" | "old";

const newSlabs: { upTo: number; rate: number }[] = [
  { upTo: 300000, rate: 0 },
  { upTo: 600000, rate: 0.05 },
  { upTo: 900000, rate: 0.1 },
  { upTo: 1200000, rate: 0.15 },
  { upTo: 1500000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

const oldSlabs: { upTo: number; rate: number }[] = [
  { upTo: 250000, rate: 0 },
  { upTo: 500000, rate: 0.05 },
  { upTo: 1000000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

export function calcSlabTax(income: number, regime: Regime): number {
  const slabs = regime === "new" ? newSlabs : oldSlabs;
  let tax = 0;
  let last = 0;
  for (const s of slabs) {
    if (income <= last) break;
    const slice = Math.min(income, s.upTo) - last;
    tax += slice * s.rate;
    last = s.upTo;
  }
  return tax;
}

export interface TaxBreakdown {
  taxableIncome: number;
  slabTax: number;
  rebate: number;
  taxAfterRebate: number;
  cess: number;
  total: number;
  effectiveRate: number;
  bracket: string;
}

export function calcTax(
  grossIncome: number,
  regime: Regime,
  deductions = 0,
): TaxBreakdown {
  const standardDeduction = 75000; // new regime FY24-25; same applied for old for simplicity
  const taxable = Math.max(0, grossIncome - standardDeduction - (regime === "old" ? deductions : 0));
  const slabTax = calcSlabTax(taxable, regime);

  // 87A rebate
  let rebate = 0;
  if (regime === "new" && taxable <= 700000) rebate = slabTax;
  if (regime === "old" && taxable <= 500000) rebate = Math.min(slabTax, 12500);

  const afterRebate = Math.max(0, slabTax - rebate);
  const cess = afterRebate * 0.04;
  const total = afterRebate + cess;

  const slabs = regime === "new" ? newSlabs : oldSlabs;
  let bracket = "0%";
  let last = 0;
  for (const s of slabs) {
    if (taxable > last && taxable <= s.upTo) {
      bracket = `${Math.round(s.rate * 100)}%`;
      break;
    }
    last = s.upTo;
  }

  return {
    taxableIncome: taxable,
    slabTax,
    rebate,
    taxAfterRebate: afterRebate,
    cess,
    total,
    effectiveRate: grossIncome > 0 ? (total / grossIncome) * 100 : 0,
    bracket,
  };
}
