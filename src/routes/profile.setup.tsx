import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/profile/setup")({
  head: () => ({ meta: [{ title: "Set up your profile — Moneywise" }] }),
  component: ProfileSetup,
});

const steps = ["Income", "Mandatory expenses", "Goals"] as const;

function ProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const total = steps.length;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-6 pb-10 pt-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="text-xs font-medium text-muted-foreground">Step {step + 1} of {total}</span>
      </div>

      {/* progress */}
      <div className="mt-4 flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      <h1 className="mt-8 text-2xl font-bold tracking-tight">{steps[step]}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {step === 0 && "Tell us about your monthly income sources."}
        {step === 1 && "Rent, EMIs, insurance — the fixed stuff."}
        {step === 2 && "How much do you want to save each month?"}
      </p>

      <div className="mt-6 space-y-4">
        {step === 0 && (
          <>
            <Field label="Monthly salary (₹)" placeholder="e.g. 75000" />
            <Field label="Freelance / side income (₹)" placeholder="Optional" />
            <Field label="Other income (₹)" placeholder="Optional" />
          </>
        )}
        {step === 1 && (
          <>
            <Field label="Rent (₹)" placeholder="e.g. 20000" />
            <Field label="EMIs (₹)" placeholder="Loans, credit card" />
            <Field label="Insurance & SIPs (₹)" placeholder="Monthly recurring" />
            <Field label="Other essentials (₹)" placeholder="Utilities, groceries baseline" />
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Savings goal per month (₹)" placeholder="e.g. 15000" />
            <Field label="Emergency fund target (₹)" placeholder="e.g. 300000" />
          </>
        )}
      </div>

      <div className="mt-auto space-y-2 pt-10">
        <Button
          size="lg"
          className="h-12 w-full rounded-xl text-base font-semibold"
          onClick={() => {
            if (step < total - 1) setStep(step + 1);
            else navigate({ to: "/dashboard" });
          }}
        >
          {step < total - 1 ? (<>Continue <ArrowRight className="ml-1 h-4 w-4" /></>) : "Finish setup"}
        </Button>
        <Button asChild variant="ghost" className="h-11 w-full rounded-xl">
          <Link to="/dashboard">Skip for now</Link>
        </Button>
      </div>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input inputMode="numeric" placeholder={placeholder} className="h-12 rounded-xl font-mono" />
    </div>
  );
}
