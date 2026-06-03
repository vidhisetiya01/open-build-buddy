import { createFileRoute } from "@tanstack/react-router";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Moneywise" }] }),
  component: Reports,
});

const months = [
  { m: "Jul", income: 95000, saved: 16000 },
  { m: "Aug", income: 95000, saved: 14500 },
  { m: "Sep", income: 98000, saved: 17000 },
  { m: "Oct", income: 95000, saved: 18000 },
  { m: "Nov", income: 102000, saved: 21000 },
  { m: "Dec", income: 95000, saved: 18500 },
];

function Reports() {
  const max = Math.max(...months.map((m) => m.income));

  return (
    <AppShell title="Reports" subtitle="Last 6 months">
      <div className="space-y-5 px-5 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg savings</p>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-xl font-bold tabular">{inr(17500)}</p>
            <p className="text-xs text-success">+12% vs prev 6mo</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg spending</p>
              <TrendingDown className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-xl font-bold tabular">{inr(78500)}</p>
            <p className="text-xs text-success">−4% vs prev 6mo</p>
          </Card>
        </div>

        <Card className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Income vs savings</h3>
          <div className="mt-5 flex h-48 items-end gap-3">
            {months.map((m) => (
              <div key={m.m} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-full w-full items-end justify-center gap-1">
                  <div className="w-2.5 rounded-t bg-primary" style={{ height: `${(m.income / max) * 100}%` }} />
                  <div className="w-2.5 rounded-t bg-success" style={{ height: `${(m.saved / max) * 100}%` }} />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{m.m}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <Legend color="bg-primary" label="Income" />
            <Legend color="bg-success" label="Saved" />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Insights</h3>
          <ul className="mt-3 space-y-3 text-sm">
            <Insight tone="success" text="You hit your savings target 4 out of 6 months — keep this rhythm." />
            <Insight tone="accent" text="Food spending grew 18% over 3 months. Consider a weekly meal budget." />
            <Insight tone="primary" text="Switching to the new tax regime could save you ~₹12,000/year." />
          </ul>
        </Card>

        <Button variant="outline" className="h-12 w-full rounded-xl">
          <Download className="mr-2 h-4 w-4" /> Export 6-month report (PDF)
        </Button>
      </div>
    </AppShell>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${color}`} /> {label}
    </span>
  );
}

function Insight({ tone, text }: { tone: "success" | "accent" | "primary"; text: string }) {
  const map = {
    success: "bg-success-soft text-success-foreground border-l-success",
    accent: "bg-accent-soft text-accent-foreground border-l-accent",
    primary: "bg-primary-soft text-primary border-l-primary",
  };
  return <li className={`rounded-lg border-l-4 p-3 text-foreground ${map[tone]}`}>{text}</li>;
}
