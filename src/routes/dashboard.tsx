import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Calculator, MessageCircle, Pencil, PiggyBank, Plus, TrendingUp, Wallet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { inr } from "@/lib/format";
import { useProfile, type UserProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Moneywise" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { profile, derived, setProfile, userId, loading } = useProfile();
  const navigate = useNavigate();
  const firstName = (profile.name || "there").split(" ")[0];
  const incomplete = profile.monthlyIncome === 0;
  const [editOpen, setEditOpen] = useState(false);

  // Auto-open the edit dialog for first-time users
  useEffect(() => {
    if (!loading && userId && incomplete) setEditOpen(true);
  }, [loading, userId, incomplete]);

  return (
    <AppShell
      right={
        <div className="flex items-center gap-2">
          <EditProfileButton
            profile={profile}
            onSave={setProfile}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
          <button className="relative grid h-10 w-10 place-items-center rounded-full bg-muted text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
          </button>
        </div>
      }
      title={`Hi, ${firstName} 👋`}
      subtitle={userId ? "Here's your money today" : "Sign in to save your plan"}
    >
      <div className="space-y-5 px-5 pt-2">
        {!userId && (
          <Card className="flex items-center gap-3 p-3">
            <div className="flex-1 text-xs">
              <p className="font-semibold">You're browsing as a guest</p>
              <p className="text-muted-foreground">Log in to sync your plan across devices</p>
            </div>
            <Button size="sm" onClick={() => navigate({ to: "/auth/login" })}>Log in</Button>
          </Card>
        )}

        {incomplete && (
          <Card className="flex items-center gap-3 p-3 border-accent/40 bg-accent-soft">
            <div className="flex-1 text-xs">
              <p className="font-semibold">Let's personalize your plan</p>
              <p className="text-muted-foreground">Add salary, rent and EMIs to see your numbers</p>
            </div>
            <Button size="sm" onClick={() => setEditOpen(true)}>Add</Button>
          </Card>
        )}

        {/* Health score hero card */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-[oklch(0.30_0.08_165)] via-[oklch(0.45_0.10_165)] to-[oklch(0.76_0.12_88)] p-5 text-primary-foreground shadow-elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">Financial health</p>
              <p className="mt-1 text-5xl font-extrabold tabular">{derived.healthScore}</p>
              <p className="text-xs text-primary-foreground/80">{scoreMessage(derived.healthScore)}</p>
            </div>
            <ScoreRing value={derived.healthScore} />
          </div>
          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-accent" style={{ width: `${derived.healthScore}%` }} />
          </div>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon={Wallet} label="Daily safe-to-spend" value={inr(derived.dailyBudget)} tone="accent" />
          <StatCard icon={PiggyBank} label="Can save / month" value={inr(derived.monthlySavings)} tone="success" />
        </div>

        {/* Your plan */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your plan</p>
            <button onClick={() => setEditOpen(true)} className="text-xs font-semibold text-primary">Edit</button>
          </div>
          <p className="mt-1 text-2xl font-bold tabular">{inr(profile.monthlyIncome)} <span className="text-xs font-normal text-muted-foreground">/ month income</span></p>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Essentials (rent + EMI + bills)" value={inr(derived.essentials)} pct={pct(derived.essentials, profile.monthlyIncome)} color="bg-primary" />
            <Row label="Savings goal" value={inr(derived.monthlySavings)} pct={pct(derived.monthlySavings, profile.monthlyIncome)} color="bg-success" />
            <Row label="Flexible spending" value={inr(derived.flexible)} pct={pct(derived.flexible, profile.monthlyIncome)} color="bg-accent" />
          </div>
          {profile.monthlyIncome > 0 && (
            <p className="mt-3 rounded-lg bg-muted p-2 text-xs text-muted-foreground">
              {planAdvice(derived)}
            </p>
          )}
        </Card>

        {/* Quick actions */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <ActionTile to="/chat" icon={MessageCircle} label="Ask AI" />
            <ActionTile to="/tax-calculator" icon={Calculator} label="Tax calc" />
            <ActionTile to="/savings" icon={PiggyBank} label="Savings" />
            <ActionTile to="/expenses" icon={TrendingUp} label="Expenses" />
          </div>
        </section>

        <Button asChild size="lg" className="h-12 w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-card">
          <Link to="/chat"><Plus className="mr-1 h-4 w-4" />New analysis</Link>
        </Button>
      </div>
    </AppShell>
  );
}

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function scoreMessage(s: number) {
  if (s >= 80) return "Excellent — keep going.";
  if (s >= 60) return "Doing well, room to grow.";
  if (s >= 40) return "On the right track.";
  if (s > 0) return "Tighten essentials, boost savings.";
  return "Add your numbers to start.";
}

function planAdvice(d: ReturnType<typeof import("@/hooks/use-profile").derive>) {
  const sr = d.monthlyIncome > 0 ? d.monthlySavings / d.monthlyIncome : 0;
  if (d.essentials > d.monthlyIncome) return "Essentials exceed income — review rent or EMIs first.";
  if (sr < 0.1) return "Try saving at least 10% of income — even ₹1,000 more helps.";
  if (sr < 0.2) return "Great start. Aim for 20% savings to build a buffer.";
  return "You're saving well. Consider SIPs or an emergency fund.";
}

function EditProfileButton({
  profile,
  onSave,
  open,
  onOpenChange,
}: {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [draft, setDraft] = useState<UserProfile>(profile);

  useEffect(() => {
    if (open) setDraft(profile);
  }, [open, profile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="grid h-10 w-10 place-items-center rounded-full bg-muted text-foreground" aria-label="Edit profile">
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your financial profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <NumField label="Monthly salary / income (₹)" value={draft.monthlyIncome} onChange={(v) => setDraft({ ...draft, monthlyIncome: v })} />
          <NumField label="Rent (₹/month)" value={draft.rent} onChange={(v) => setDraft({ ...draft, rent: v })} />
          <NumField label="EMI payments (₹/month)" value={draft.emi} onChange={(v) => setDraft({ ...draft, emi: v })} />
          <NumField label="Other essentials — bills, groceries (₹)" value={draft.otherEssentials} onChange={(v) => setDraft({ ...draft, otherEssentials: v })} />
          <NumField label="Savings goal (₹/month)" value={draft.monthlySavingsGoal} onChange={(v) => setDraft({ ...draft, monthlySavingsGoal: v })} />
          <NumField label="Extra flexible budget (₹)" value={draft.flexibleSpend} onChange={(v) => setDraft({ ...draft, flexibleSpend: v })} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
          >
            Save plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-xl" />
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const display = value === 0 ? "" : value;
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        inputMode="numeric"
        type="number"
        min={0}
        value={display}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-11 rounded-xl font-mono"
      />
    </div>
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
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
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
