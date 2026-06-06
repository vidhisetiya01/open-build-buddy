import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, PiggyBank, TrendingUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moneywise — Your AI financial coach" },
      { name: "description", content: "Take control of your money with AI-powered tax, savings, and daily budget guidance." },
    ],
  }),
  component: Welcome,
});

const features = [
  { icon: MessageCircle, title: "AI chat that gets your money", desc: "Ask anything — tax, savings, budgets." },
  { icon: PiggyBank, title: "Smart savings targets", desc: "Personalized goals based on real income." },
  { icon: TrendingUp, title: "Daily safe-to-spend", desc: "Know exactly how much you can spend today." },
  { icon: ShieldCheck, title: "Private by design", desc: "Your financial data stays yours." },
];

function Welcome() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background flourish */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] bg-gradient-to-br from-primary via-primary to-[oklch(0.5_0.18_265)]" />
      <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-60 h-60 w-60 rounded-full bg-success/40 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-14 text-primary-foreground md:max-w-3xl lg:max-w-5xl xl:max-w-6xl md:px-10 lg:px-16">
        <div className="inline-flex items-center gap-2.5 self-start rounded-full border border-white/25 bg-white/10 px-3 py-1.5 pr-4 shadow-[0_8px_30px_-8px_oklch(0_0_0/0.5)] backdrop-blur-md ring-1 ring-accent/40">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-[oklch(0.78_0.18_75)] text-accent-foreground shadow-[0_0_20px_oklch(0.85_0.18_85/0.6)]">
            <span className="text-base font-black">₹</span>
          </div>
          <span className="bg-gradient-to-r from-white to-accent bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
            Moneywise
          </span>
        </div>

        <div className="mt-16">
          <h1 className="text-[2.5rem] font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Your AI <br />
            <span className="text-accent">financial coach</span>
          </h1>
          <p className="mt-4 max-w-sm text-base text-primary-foreground/80 md:max-w-xl md:text-lg">
            Calculate taxes, plan savings and know exactly how much you can spend today — all in one chat.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/15 p-4 backdrop-blur-sm bg-lime-800"
            >
              <Icon className="h-5 w-5 text-accent" />
              <p className="mt-2 text-[13px] font-semibold leading-tight">{title}</p>
              <p className="mt-1 text-[11px] text-primary-foreground/70 leading-snug">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-auto space-y-3 pt-10">
          <Button asChild size="lg" className="h-12 w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold shadow-elevated">
            <Link to="/auth/signup">
              Get started <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="h-11 w-full rounded-xl text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
            <Link to="/auth/login">I already have an account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
