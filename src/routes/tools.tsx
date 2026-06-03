import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, PiggyBank, TrendingUp, Wallet, LineChart, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/tools")({
  head: () => ({ meta: [{ title: "Tools — Moneywise" }] }),
  component: Tools,
});

const tools = [
  { to: "/tax-calculator", icon: Calculator, name: "Tax Calculator", desc: "India FY24-25 · old vs new regime", color: "from-primary to-[oklch(0.45_0.16_265)]" },
  { to: "/savings", icon: PiggyBank, name: "Savings Planner", desc: "Set goals & track progress", color: "from-success to-[oklch(0.6_0.16_165)]" },
  { to: "/expenses", icon: TrendingUp, name: "Expense Tracker", desc: "Watch spending by category", color: "from-accent to-[oklch(0.7_0.16_50)]" },
  { to: "/dashboard", icon: Wallet, name: "Budget Planner", desc: "50/30/20 income allocation", color: "from-chart-4 to-[oklch(0.45_0.18_295)]" },
  { to: "/chat", icon: LineChart, name: "Investment Advisor", desc: "AI-recommended portfolio", color: "from-chart-5 to-[oklch(0.55_0.18_20)]" },
] as const;

function Tools() {
  return (
    <AppShell title="Tools" subtitle="Calculators & planners">
      <div className="space-y-3 px-5 pt-2">
        {tools.map((t) => (
          <Link key={t.to} to={t.to} className="block">
            <Card className="overflow-hidden border-0 p-0 shadow-card transition hover:-translate-y-0.5">
              <div className={`flex items-center gap-4 bg-gradient-to-br p-4 text-white ${t.color}`}>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/20 backdrop-blur">
                  <t.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold">{t.name}</p>
                  <p className="text-xs text-white/80">{t.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 opacity-80" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
