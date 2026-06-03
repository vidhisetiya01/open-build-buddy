import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronRight, Download, HelpCircle, Lock, LogOut, Shield, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Moneywise" }] }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  return (
    <AppShell title="Profile" subtitle="Account & settings">
      <div className="space-y-5 px-5 pt-2">
        <Card className="flex items-center gap-4 p-5">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground">
            A
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">Ananya Sharma</p>
            <p className="text-sm text-muted-foreground">ananya@example.com</p>
            <Button variant="link" className="h-auto p-0 text-xs text-primary" onClick={() => navigate({ to: "/profile/setup" })}>
              Edit financial profile
            </Button>
          </div>
        </Card>

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

        <Button
          variant="outline"
          className="h-12 w-full rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => navigate({ to: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </Button>

        <p className="text-center text-xs text-muted-foreground">Moneywise v0.1 · made with ❤️</p>
      </div>
    </AppShell>
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
