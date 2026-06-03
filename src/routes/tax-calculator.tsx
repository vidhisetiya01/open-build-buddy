import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, useState as _ } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { calcTax, type Regime } from "@/lib/tax";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/tax-calculator")({
  head: () => ({ meta: [{ title: "Tax calculator — Moneywise" }] }),
  component: TaxCalculator,
});

function TaxCalculator() {
  const [income, setIncome] = useState(1200000);
  const [deductions, setDeductions] = useState(150000);
  const [regime, setRegime] = useState<Regime>("new");

  const result = calcTax(income, regime, deductions);

  return (
    <AppShell
      title="Tax calculator"
      subtitle="India · FY 2024-25"
      right={
        <Link to="/dashboard" className="grid h-10 w-10 place-items-center rounded-full bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      }
    >
      <div className="space-y-5 px-5 pt-2">
        {/* Regime toggle */}
        <div className="flex rounded-2xl border border-border bg-card p-1 shadow-card">
          {(["new", "old"] as Regime[]).map((r) => (
            <button
              key={r}
              onClick={() => setRegime(r)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold capitalize transition ${
                regime === r ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
              }`}
            >
              {r} regime
            </button>
          ))}
        </div>

        <Card className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label>Annual gross income (₹)</Label>
            <Input
              inputMode="numeric"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value.replace(/\D/g, "")) || 0)}
              className="h-12 rounded-xl font-mono text-lg"
            />
          </div>
          {regime === "old" && (
            <div className="space-y-1.5">
              <Label>Deductions (80C, 80D, HRA…) (₹)</Label>
              <Input
                inputMode="numeric"
                value={deductions}
                onChange={(e) => setDeductions(Number(e.target.value.replace(/\D/g, "")) || 0)}
                className="h-12 rounded-xl font-mono"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Standard deduction of ₹75,000 is applied automatically.
          </p>
        </Card>

        {/* Result */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-[oklch(0.45_0.16_265)] p-5 text-primary-foreground shadow-elevated">
          <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">Total tax payable</p>
          <p className="mt-1 text-4xl font-extrabold tabular">{inr(result.total)}</p>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <Badge label="Bracket" value={result.bracket} />
            <Badge label="Effective" value={`${result.effectiveRate.toFixed(1)}%`} />
            <Badge label="Monthly" value={inr(result.total / 12)} />
          </div>
        </Card>

        {/* Breakdown */}
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Breakdown</h3>
          <dl className="space-y-2.5 text-sm">
            <BLine label="Taxable income" value={inr(result.taxableIncome)} />
            <BLine label="Slab tax" value={inr(result.slabTax)} />
            {result.rebate > 0 && <BLine label="87A rebate" value={`− ${inr(result.rebate)}`} accent="text-success" />}
            <BLine label="Cess (4%)" value={inr(result.cess)} />
            <div className="my-2 border-t border-border" />
            <BLine label="Total" value={inr(result.total)} bold />
          </dl>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" className="h-12 flex-1 rounded-xl">Save</Button>
          <Button className="h-12 flex-1 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">Export PDF</Button>
        </div>

        <div className="rounded-2xl bg-success-soft p-4 text-sm text-foreground">
          <p className="font-semibold">💡 Tip</p>
          <p className="mt-1 text-muted-foreground">
            {regime === "new"
              ? "The new regime favors higher incomes without large deductions. Compare with the old regime if you claim HRA + 80C."
              : "Maximize 80C (₹1.5L), 80D, and HRA to make the old regime competitive at your income."}
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60">{label}</p>
      <p className="text-sm font-bold tabular">{value}</p>
    </div>
  );
}

function BLine({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-mono tabular ${bold ? "text-lg font-bold" : "font-semibold"} ${accent ?? ""}`}>{value}</dd>
    </div>
  );
}
