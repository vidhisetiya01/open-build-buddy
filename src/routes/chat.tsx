import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — Moneywise" }] }),
  component: Chat,
});

interface Msg { role: "user" | "bot"; text: string; }

const seed: Msg[] = [
  { role: "bot", text: "Hi Ananya! I'm your Moneywise coach. Ask me anything — taxes, savings, budgets." },
];

const quickReplies = [
  "How much tax will I pay?",
  "What should I save monthly?",
  "Can I afford a ₹40k EMI?",
  "Best way to invest ₹10k?",
];

function fakeResponse(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes("tax")) return "Based on your ₹95,000/month income, you'd pay around ₹52,400/year under the new regime — about 4.6% effective. Want me to open the tax calculator?";
  if (lower.includes("save")) return "A healthy target for your income is 20% — about ₹19,000/month. You're already at ₹18,500, great pace! 🎉";
  if (lower.includes("emi")) return "A ₹40k EMI would push fixed costs to 65% of income. I'd suggest staying under 50% — try ₹25k EMI for breathing room.";
  if (lower.includes("invest")) return "For ₹10k/month, a mix works well: 60% diversified equity index fund, 30% balanced advantage, 10% liquid for emergencies.";
  return "Great question — give me a moment to crunch the numbers based on your profile.";
}

function Chat() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setMessages((m) => [...m, { role: "user", text: value }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: fakeResponse(value) }]);
      setTyping(false);
    }, 900);
  };

  return (
    <AppShell
      title="Moneywise AI"
      subtitle="Online · ready to help"
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
