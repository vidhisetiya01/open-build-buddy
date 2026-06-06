import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/hooks/use-profile";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/chat")({
  ssr: false,
  head: () => ({ meta: [{ title: "Chat — Moneywise" }] }),
  component: Chat,
});

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

function Chat() {
  const { profile, derived } = useProfile();
  const firstName = (profile.name || "there").split(" ")[0];
  const hasData = profile.monthlyIncome > 0;

  const seed: Msg[] = useMemo(
    () => [
      {
        role: "assistant",
        content: hasData
          ? `Hi ${firstName}! I can see your finances — ${inr(profile.monthlyIncome)}/month income, ${inr(derived.essentials)} essentials. Ask me anything about budgeting, tax, SIPs, EMIs, insurance or retirement.`
          : `Hi ${firstName}! I'm your finance coach. Add your income & expenses on the dashboard for personalized advice — or ask me any general finance question to get started.`,
      },
    ],
    [firstName, hasData, profile.monthlyIncome, derived.essentials],
  );

  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMessages(seed), [seed]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const quickReplies = hasData
    ? [
        "How much tax will I pay this year?",
        "What should I save monthly?",
        `Can I afford a ${inr(Math.round(profile.monthlyIncome * 0.3))} EMI?`,
        "Best SIP allocation for me?",
      ]
    : [
        "Explain the new vs old tax regime",
        "How do I start a SIP?",
        "What's the 50/30/20 rule?",
        "How much emergency fund do I need?",
      ];

  const send = async (text: string) => {
    const value = text.trim();
    if (!value || isLoading) return;
    setError(null);

    const userMsg: Msg = { role: "user", content: value };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last !== seed[0]) {
          // already streaming — replace last
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m,
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const apiMessages = nextHistory.map((m) => ({ role: m.role, content: m.content }));
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          profile: hasData ? derived : null,
        }),
      });

      if (resp.status === 429) {
        setError("Too many requests — please wait a moment.");
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        setError("AI credits exhausted. Please add credits to keep chatting.");
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) {
        setError("Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) upsertAssistant(delta);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none text-card-foreground prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0 prose-strong:text-card-foreground">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-card px-4 py-3 shadow-card">
              <div className="flex gap-1">
                <Dot delay="0ms" />
                <Dot delay="150ms" />
                <Dot delay="300ms" />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
      </div>

      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Try asking
          </p>
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
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md border-t border-border bg-background/95 px-4 py-3 backdrop-blur"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-card focus-within:border-primary">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about tax, SIPs, EMIs, savings…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
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
