import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/hooks/use-profile";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — Moneywise" }] }),
  component: Chat,
});

interface Msg { role: "user" | "bot"; text: string; }

function Chat() {
  const { profile, derived } = useProfile();
  const firstName = (profile.name || "there").split(" ")[0];
  const hasData = profile.monthlyIncome > 0;

  const seed: Msg[] = useMemo(
    () => [
      {
        role: "bot",
        text: hasData
          ? `Hi ${firstName}! I see ${inr(profile.monthlyIncome)}/month income and ${inr(derived.essentials)} essentials. Ask me anything.`
          : `Hi ${firstName}! Add your income and expenses on the dashboard so I can give you specific advice.`,
      },
    ],
    [firstName, hasData, profile.monthlyIncome, derived.essentials],
  );

  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Refresh greeting when profile loads
  useEffect(() => setMessages(seed), [seed]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const reply = (q: string): string => {
    const lower = q.toLowerCase();
    if (!hasData) return "I need your income & expenses first — head to the dashboard and tap the pencil icon to add them.";

    const yearly = profile.monthlyIncome * 12;
    if (lower.includes("tax")) {
      const est = Math.max(0, Math.round((yearly - 750000) * 0.1));
      return `On ${inr(yearly)}/year, you'd pay around ${inr(est)} under the new regime. Open the tax calculator for an exact breakdown.`;
    }
    if (lower.includes("save")) {
      const target = Math.round(profile.monthlyIncome * 0.2);
      const gap = target - derived.monthlySavings;
      return gap > 0
        ? `A 20% target is ${inr(target)}/month — you're at ${inr(derived.monthlySavings)}, ${inr(gap)} short. Trim flexible spend to bridge it.`
        : `You're already saving ${inr(derived.monthlySavings)}/month (${Math.round((derived.monthlySavings / profile.monthlyIncome) * 100)}% of income). 🎉`;
    }
    if (lower.includes("emi") || lower.includes("afford")) {
      const safeEmi = Math.round(profile.monthlyIncome * 0.4 - profile.emi);
      return safeEmi > 0
        ? `You can comfortably add up to ${inr(safeEmi)} in EMI without exceeding 40% of income. Current EMI: ${inr(profile.emi)}.`
        : `Your EMIs already use 40%+ of income. Avoid new ones until existing loans wind down.`;
    }
    if (lower.includes("invest") || lower.includes("sip")) {
      const sip = Math.max(1000, Math.round(derived.monthlySavings * 0.7));
      return `With ${inr(derived.monthlySavings)} saving capacity, start a ${inr(sip)} SIP — 60% diversified equity, 30% balanced, 10% liquid.`;
    }
    if (lower.includes("spend") || lower.includes("today") || lower.includes("daily")) {
      return `Your safe-to-spend is ${inr(derived.dailyBudget)}/day after essentials and savings.`;
    }
    return `Based on your plan — ${inr(profile.monthlyIncome)} income, ${inr(derived.essentials)} essentials — you have ${inr(derived.flexible)} flexible each month. What specifically would you like to optimize?`;
  };

  const quickReplies = hasData
    ? [
        "How much tax will I pay?",
        "What should I save monthly?",
        `Can I afford a ${inr(Math.round(profile.monthlyIncome * 0.3))} EMI?`,
        "Best way to invest?",
      ]
    : ["How does this work?", "What can you help me with?"];

  const send = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setMessages((m) => [...m, { role: "user", text: value }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: reply(value) }]);
      setTyping(false);
    }, 700);
  };

  return (
    <AppShell
      title="Moneywise AI"
      subtitle={hasData ? `Coaching ${firstName}` : "Online · ready to help"}
      right={
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
      }
    >
      <div ref={scrollRef} className="space-y-3 px-4 pb-4 pt-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-card ${
                m.role === "user"
                  ? "rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md bg-card text-card-foreground"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-card px-4 py-3 shadow-card">
              <div className="flex gap-1">
                <Dot delay="0ms" /><Dot delay="150ms" /><Dot delay="300ms" />
              </div>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary hover:bg-primary-soft"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md border-t border-border bg-background/95 px-4 py-3 backdrop-blur"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-card focus-within:border-primary">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your money…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
      style={{ animationDelay: delay }}
    />
  );
}
