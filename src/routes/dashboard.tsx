import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Calculator, MessageCircle, PiggyBank, Plus, TrendingUp, Wallet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Moneywise" }] }),
  component: Dashboard,
});

const monthlyIncome = 95000;
const dailyBudget = 1240;
const monthlySavings = 18500;
const healthScore = 78;

function Dashboard() {
  return (
    <AppShell
      right={
        <button className="relative grid h-10 w-10 place-items-center rounded-full bg-muted text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
        </button>
      }
      title="Hi, Ananya 👋"
      subtitle="Here's your money today"
    >
      <div className="space-y-5 px-5 pt-2">
        {/* Health score hero card */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-[oklch(0.30_0.08_165)] via-[oklch(0.45_0.10_165)] to-[oklch(0.76_0.12_88)] p-5 text-primary-foreground shadow-elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">Financial health</p>
              <p className="mt-1 text-5xl font-extrabold tabular">{healthScore}</p>
              <p className="text-xs text-primary-foreground/80">Doing great — keep going.</p>
            </div>
            <ScoreRing value={healthScore} />
          </div>
          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-accent" style={{ width: `${healthScore}%` }} />
          </div>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Wallet} label="Daily safe-to-spend" value={inr(dailyBudget)} tone="accent" />
          <StatCard icon={PiggyBank} label="Saved this month" value={inr(monthlySavings)} tone="success" />
        </div>

        {/* Quick actions */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <ActionTile to="/chat" icon={MessageCircle} label="Ask AI" />
            <ActionTile to="/tax-calculator" icon={Calculator} label="Tax calc" />
            <ActionTile to="/savings" icon={PiggyBank} label="Savings" />
            <ActionTile to="/expenses" icon={TrendingUp} label="Expenses" />
          </div>
        </section>

        {/* Recent chats */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent chats</h2>
            <Link to="/chat" className="text-xs font-semibold text-primary">View all</Link>
          </div>
          <div className="space-y-2">
            {[
              { q: "How much tax will I pay this year?", a: "Estimated ₹52,000 under new regime…" },
              { q: "Can I afford an iPhone EMI?", a: "Yes — fits within 15% of income…" },
              { q: "Best SIP for ₹10k/month?", a: "Consider a diversified equity fund…" },
            ].map((c) => (
              <Link
                key={c.q}
                to="/chat"
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3 shadow-card transition hover:border-primary/40"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.q}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.a}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Income summary */}
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Monthly income</p>
          <p className="mt-1 text-2xl font-bold tabular">{inr(monthlyIncome)}</p>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Essentials" value={inr(48000)} pct={50} color="bg-primary" />
            <Row label="Savings" value={inr(monthlySavings)} pct={20} color="bg-success" />
            <Row label="Flexible" value={inr(28500)} pct={30} color="bg-accent" />
          </div>
        </Card>

        <Button asChild size="lg" className="h-12 w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-card">
          <Link to="/chat"><Plus className="mr-1 h-4 w-4" />New analysis</Link>
        </Button>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "accent" | "success" }) {
  const isSuccess = tone === "success";
  const iconClass = tone === "accent" ? "bg-accent text-accent-foreground" : "bg-success text-success-foreground";
  
  return (
    <Card className={isSuccess ? "rounded-xl shadow p-4 bg-success-soft text-success-foreground border-0 text-neutral-900" : "p-4 bg-accent-soft text-accent-foreground border-0"}>
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${iconClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-0.5 text-xl font-bold tabular">{value}</p>
    </Card>
  );
}

function ActionTile({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}

function Row({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-muted-foreground">{label} <span className="text-xs">· {pct}%</span></span>
        <span className="font-mono text-sm font-semibold">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="oklch(1 0 0 / 0.2)" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke="oklch(0.76 0.12 88)"
        strokeWidth="6" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
      />
    </svg>
  );
}
