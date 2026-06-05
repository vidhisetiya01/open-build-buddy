import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { Award, Target, TrendingUp } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/savings")({
  head: () => ({ meta: [{ title: "Savings — Moneywise" }] }),
  component: Savings,
});

function Savings() {
  const { profile, derived, userId } = useProfile();
  const hasData = profile.monthlyIncome > 0;

  // Personalized goals based on the user's plan
  const emergencyTarget = profile.monthlyIncome > 0 ? profile.monthlyIncome * 6 : 300000;
  const yearlySavings = derived.monthlySavings * 12;
  const goals = [
    {
      name: "Emergency fund (6 months)",
      target: emergencyTarget,
      current: Math.min(emergencyTarget, yearlySavings * 0.5),
      color: "bg-success",
    },
    {
      name: "Annual savings target",
      target: yearlySavings || 120000,
      current: derived.monthlySavings * (new Date().getMonth() + 1),
      color: "bg-accent",
    },
  ];

  const totalSaved = goals.reduce((a, g) => a + g.current, 0);
  const onTrack = goals.filter((g) => g.current / g.target >= 0.5).length;
  const recommended = profile.monthlyIncome > 0 ? Math.round(profile.monthlyIncome * 0.2) : 19000;

  return (
    <AppShell title="Savings planner" subtitle={hasData ? `${profile.name || "Your"} plan` : "Goals & progress"}>
      <div className="space-y-5 px-5 pt-2">
        {!hasData && (
          <Card className="p-4 text-sm">
            <p className="font-semibold">No plan yet</p>
            <p className="mt-1 text-muted-foreground">
              Add your income on the{" "}
              <Link to="/dashboard" className="font-semibold text-primary">dashboard</Link> to see personalized savings goals.
            </p>
          </Card>
        )}

        <Card className="overflow-hidden border-0 bg-gradient-to-br from-success to-[oklch(0.6_0.16_165)] p-5 text-success-foreground shadow-elevated">
          <p className="text-xs font-medium uppercase tracking-wider opacity-80">Saving capacity</p>
          <p className="mt-1 text-4xl font-extrabold tabular">{inr(derived.monthlySavings)}</p>
          <p className="mt-1 text-sm opacity-90">{hasData ? `per month from your plan` : `add income to personalize`}</p>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <MiniStat icon={Target} label="Goals" value={`${goals.length}`} />
          <MiniStat icon={TrendingUp} label="On track" value={`${onTrack}`} />
          <MiniStat icon={Award} label="Saved" value={inr(totalSaved)} />
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your goals</h2>
            {userId && <Button variant="ghost" size="sm" className="text-primary">+ New</Button>}
          </div>
          <div className="space-y-3">
            {goals.map((g) => {
              const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
              return (
                <Card key={g.name} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">{g.name}</span>
                    <span className="font-mono text-sm font-semibold">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${g.color}`} style={{ width: `${Math.min(100, pct)}%` }} />
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
          <p className="mt-1 text-2xl font-bold tabular">{inr(recommended)}<span className="ml-2 text-sm font-medium text-muted-foreground">/ month</span></p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasData
              ? `Saving 20% of your ${inr(profile.monthlyIncome)} income covers a 6-month emergency fund in about ${Math.max(1, Math.round(emergencyTarget / Math.max(1, recommended)))} months.`
              : "Saving 20% of your income is the rule of thumb for a healthy buffer."}
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
      <p className="mt-1 text-lg font-bold tabular">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </Card>
  );
}
