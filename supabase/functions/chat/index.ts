// Lovable AI streaming chat for Moneywise finance assistant
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Profile {
  name?: string;
  monthlyIncome?: number;
  rent?: number;
  emi?: number;
  otherEssentials?: number;
  flexibleSpend?: number;
  monthlySavingsGoal?: number;
  essentials?: number;
  monthlySavings?: number;
  dailyBudget?: number;
  healthScore?: number;
  flexible?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, profile } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
      profile?: Profile;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const p = profile ?? {};
    const profileBlock = p.monthlyIncome
      ? `User financial snapshot (INR, monthly unless stated):
- Name: ${p.name || "User"}
- Monthly income: ₹${p.monthlyIncome}
- Rent: ₹${p.rent ?? 0}
- EMIs: ₹${p.emi ?? 0}
- Other essentials: ₹${p.otherEssentials ?? 0}
- Flexible spend budget: ₹${p.flexibleSpend ?? 0}
- Monthly savings goal: ₹${p.monthlySavingsGoal ?? 0}
- Derived essentials total: ₹${p.essentials ?? 0}
- Derived monthly savings: ₹${p.monthlySavings ?? 0}
- Derived flexible remaining: ₹${p.flexible ?? 0}
- Safe-to-spend per day: ₹${p.dailyBudget ?? 0}
- Health score: ${p.healthScore ?? 0}/100`
      : `The user has not entered their income/expenses yet. Gently suggest they tap the pencil icon on the dashboard to add monthly income, rent, EMIs, etc., so you can personalize advice.`;

    const system = `You are Moneywise, a friendly Indian personal finance coach.
Audience: salaried individuals in India. Currency: INR (₹). Tax context: FY 2024-25 (new & old regimes, 87A rebate, ₹75k standard deduction).
Cover any finance topic: budgeting, taxes, EMIs, loans, investing (SIP, mutual funds, stocks, NPS, PPF, EPF), insurance, real estate, credit cards, retirement, emergency funds.
Personalize using the snapshot when available. Use concrete ₹ numbers. Keep replies concise (under 120 words), use short paragraphs or bullet points, and end with one actionable next step.
Add a brief disclaimer only when giving specific investment or tax-filing recommendations.

${profileBlock}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
