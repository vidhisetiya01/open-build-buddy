import { createFileRoute } from "@tanstack/react-router";
import { Plus, ShoppingBag, Utensils, Car, Film, Zap, Home } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Expenses — Moneywise" }] }),
  component: Expenses,
});

const categories = [
  { icon: Home, name: "Rent", spent: 20000, budget: 20000, color: "bg-primary" },
  { icon: Utensils, name: "Food", spent: 8200, budget: 10000, color: "bg-success" },
  { icon: Car, name: "Transport", spent: 3400, budget: 5000, color: "bg-accent" },
  { icon: ShoppingBag, name: "Shopping", spent: 4900, budget: 4000, color: "bg-destructive" },
  { icon: Film, name: "Entertainment", spent: 1800, budget: 3000, color: "bg-chart-4" },
  { icon: Zap, name: "Utilities", spent: 2200, budget: 3000, color: "bg-chart-5" },
];

function Expenses() {
  const totalSpent = categories.reduce((a, c) => a + c.spent, 0);
  const totalBudget = categories.reduce((a, c) => a + c.budget, 0);
  const pct = Math.round((totalSpent / totalBudget) * 100);

  return (
    <AppShell title="Expenses" subtitle="This month">
      <div className="space-y-5 px-5 pt-2">
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
            {categories.map((c) => {
              const p = Math.round((c.spent / c.budget) * 100);
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
