import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { Award, Target, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/savings")({
  head: () => ({ meta: [{ title: "Savings — Moneywise" }] }),
  component: Savings,
});

const goals = [
  { name: "Emergency fund", target: 300000, current: 175000, color: "bg-success" },
  { name: "Goa trip 2026", target: 80000, current: 32000, color: "bg-accent" },
  { name: "New laptop", target: 120000, current: 90000, color: "bg-primary" },
];

function Savings() {
  return (
    <AppShell title="Savings planner" subtitle="Goals & progress">
      <div className="space-y-5 px-5 pt-2">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-success to-[oklch(0.6_0.16_165)] p-5 text-success-foreground shadow-elevated">
          <p className="text-xs font-medium uppercase tracking-wider opacity-80">Total saved</p>
          <p className="mt-1 text-4xl font-extrabold tabular">{inr(297000)}</p>
          <p className="mt-1 text-sm opacity-90">+{inr(18500)} this month</p>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <MiniStat icon={Target} label="Goals" value="3" />
          <MiniStat icon={TrendingUp} label="On track" value="2" />
          <MiniStat icon={Award} label="Badges" value="5" />
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your goals</h2>
            <Button variant="ghost" size="sm" className="text-primary">+ New</Button>
          </div>
          <div className="space-y-3">
            {goals.map((g) => {
              const pct = Math.round((g.current / g.target) * 100);
              return (
                <Card key={g.name} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">{g.name}</span>
                    <span className="font-mono text-sm font-semibold">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${g.color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span className="font-mono">{inr(g.current)}</span>
                    <span className="font-mono">{inr(g.target)}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <Card className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Monthly recommendation</h3>
          <p className="mt-1 text-2xl font-bold tabular">{inr(19000)}<span className="ml-2 text-sm font-medium text-muted-foreground">/ month</span></p>
          <p className="mt-1 text-sm text-muted-foreground">
            Saving 20% of your income hits all goals within 14 months.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="flex flex-col items-center justify-center p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-1 text-xl font-bold tabular">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </Card>
  );
}
