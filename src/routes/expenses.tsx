import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ShoppingBag, Utensils, Car, Film, Zap, Home, CreditCard } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Expenses — Moneywise" }] }),
  component: Expenses,
});

function Expenses() {
  const { profile, derived } = useProfile();
  const hasData = profile.monthlyIncome > 0;

  // Derive category budgets from the user's plan. Flexible bucket is split
  // across discretionary categories so totals match what they entered.
  const flex = Math.max(0, derived.flexible);
  const otherEss = Math.max(0, profile.otherEssentials);
  const categories = [
    { icon: Home, name: "Rent", spent: profile.rent, budget: profile.rent, color: "bg-primary" },
    { icon: CreditCard, name: "EMIs", spent: profile.emi, budget: profile.emi, color: "bg-chart-4" },
    { icon: Utensils, name: "Food & groceries", spent: Math.round(otherEss * 0.6), budget: Math.round(otherEss * 0.6), color: "bg-success" },
    { icon: Zap, name: "Utilities", spent: Math.round(otherEss * 0.4), budget: Math.round(otherEss * 0.4), color: "bg-chart-5" },
    { icon: Car, name: "Transport", spent: Math.round(flex * 0.25), budget: Math.round(flex * 0.3), color: "bg-accent" },
    { icon: ShoppingBag, name: "Shopping", spent: Math.round(flex * 0.35), budget: Math.round(flex * 0.4), color: "bg-destructive" },
    { icon: Film, name: "Entertainment", spent: Math.round(flex * 0.2), budget: Math.round(flex * 0.3), color: "bg-chart-4" },
  ].filter((c) => c.budget > 0 || c.spent > 0);

  const totalSpent = categories.reduce((a, c) => a + c.spent, 0);
  const totalBudget = categories.reduce((a, c) => a + c.budget, 0) || 1;
  const pct = Math.round((totalSpent / totalBudget) * 100);

  return (
    <AppShell title="Expenses" subtitle={hasData ? `${profile.name?.split(" ")[0] || "Your"} budget` : "This month"}>
      <div className="space-y-5 px-5 pt-2">
        {!hasData && (
          <Card className="p-4 text-sm">
            <p className="font-semibold">No expenses yet</p>
            <p className="mt-1 text-muted-foreground">
              Set your income and bills on the{" "}
              <Link to="/dashboard" className="font-semibold text-primary">dashboard</Link> to see your budget breakdown.
            </p>
          </Card>
        )}

        <Card className="p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Spent so far</p>
              <p className="mt-1 text-3xl font-extrabold tabular">{inr(totalSpent)}</p>
              <p className="text-xs text-muted-foreground">of {inr(totalBudget)} budget</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pct > 90 ? "bg-destructive/15 text-destructive" : "bg-success-soft text-success"}`}>
              {pct}%
            </span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${pct > 90 ? "bg-destructive" : "bg-success"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </Card>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Categories</h2>
            <Button size="sm" className="h-8 rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-1 h-3.5 w-3.5" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories yet — add your essentials on the dashboard.</p>
            )}
            {categories.map((c) => {
              const p = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0;
              const over = c.spent > c.budget;
              return (
                <Card key={c.name} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl ${c.color}/15 text-foreground`}>
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{c.name}</span>
                        <span className={`font-mono text-sm font-semibold ${over ? "text-destructive" : ""}`}>
                          {inr(c.spent)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${over ? "bg-destructive" : c.color}`} style={{ width: `${Math.min(p, 100)}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {over ? `Over budget by ${inr(c.spent - c.budget)}` : `${inr(c.budget - c.spent)} left`}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
