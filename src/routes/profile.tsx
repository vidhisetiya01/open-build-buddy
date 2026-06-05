import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, ChevronRight, Download, HelpCircle, Loader2, Lock, LogOut, Shield, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { inr } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Moneywise" }] }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { profile, derived, userId, loading } = useProfile();
  const [email, setEmail] = useState<string>("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, [userId]);

  const initial = (profile.name || email || "?").trim().charAt(0).toUpperCase();

  const handleLogout = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <AppShell title="Profile" subtitle="Account & settings">
      <div className="space-y-5 px-5 pt-2">
        <Card className="flex items-center gap-4 p-5">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground">
            {initial}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">{loading ? "…" : (profile.name || "Guest")}</p>
            <p className="text-sm text-muted-foreground">{email || (userId ? "" : "Not signed in")}</p>
            <Button
              variant="link"
              className="h-auto p-0 text-xs text-primary"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              Edit financial profile
            </Button>
          </div>
        </Card>

        {userId && profile.monthlyIncome > 0 && (
          <Card className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your snapshot</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Monthly income" value={inr(profile.monthlyIncome)} />
              <Stat label="Essentials" value={inr(derived.essentials)} />
              <Stat label="Savings goal" value={inr(derived.monthlySavings)} />
              <Stat label="Health score" value={`${derived.healthScore}/100`} />
            </div>
          </Card>
        )}

        <Section title="Account">
          <Row icon={User} label="Personal info" />
          <Row icon={Lock} label="Security & password" />
          <Row icon={Bell} label="Notifications" />
        </Section>

        <Section title="Data">
          <Row icon={Download} label="Export financial data" />
          <Row icon={Shield} label="Privacy" />
        </Section>

        <Section title="Support">
          <Row icon={HelpCircle} label="Help center" />
        </Section>

        {userId ? (
          <Button
            variant="outline"
            disabled={signingOut}
            className="h-12 w-full rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            {signingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            Log out
          </Button>
        ) : (
          <Button
            className="h-12 w-full rounded-xl"
            onClick={() => navigate({ to: "/auth/login" })}
          >
            Log in
          </Button>
        )}

        <p className="text-center text-xs text-muted-foreground">Moneywise v0.1 · made with ❤️</p>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <Card className="divide-y divide-border p-0">{children}</Card>
    </div>
  );
}

function Row({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-muted/50">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
