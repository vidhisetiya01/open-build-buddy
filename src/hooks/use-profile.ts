import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  name: string;
  monthlyIncome: number;
  rent: number;
  emi: number;
  otherEssentials: number;
  flexibleSpend: number;
  monthlySavingsGoal: number;
}

export interface DerivedProfile extends UserProfile {
  essentials: number;
  monthlySavings: number;
  dailyBudget: number;
  healthScore: number;
  flexible: number;
}

export const emptyProfile: UserProfile = {
  name: "",
  monthlyIncome: 0,
  rent: 0,
  emi: 0,
  otherEssentials: 0,
  flexibleSpend: 0,
  monthlySavingsGoal: 0,
};

const KEY = "moneywise.profile.v2";

export function derive(p: UserProfile): DerivedProfile {
  const essentials = p.rent + p.emi + p.otherEssentials;
  const remaining = Math.max(0, p.monthlyIncome - essentials);
  const monthlySavings = Math.min(p.monthlySavingsGoal, remaining);
  const flexible = Math.max(0, remaining - monthlySavings);
  const dailyBudget = Math.round((flexible + p.flexibleSpend) / 30) || Math.round(flexible / 30);
  const savingsRate = p.monthlyIncome > 0 ? monthlySavings / p.monthlyIncome : 0;
  const essentialsRate = p.monthlyIncome > 0 ? essentials / p.monthlyIncome : 1;
  let healthScore = Math.round(savingsRate * 180 + (1 - Math.min(1, essentialsRate)) * 40);
  healthScore = Math.max(0, Math.min(100, healthScore));
  return { ...p, essentials, monthlySavings, dailyBudget, healthScore, flexible };
}

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile>(emptyProfile);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLocal = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...emptyProfile, ...JSON.parse(raw) } as UserProfile;
    } catch {}
    return emptyProfile;
  };

  const loadFromSupabase = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, monthly_income, rent, emi, other_essentials, flexible_spend, monthly_savings_goal")
      .eq("id", uid)
      .maybeSingle();
    if (data) {
      setProfileState({
        name: data.display_name ?? "",
        monthlyIncome: Number(data.monthly_income ?? 0),
        rent: Number(data.rent ?? 0),
        emi: Number(data.emi ?? 0),
        otherEssentials: Number(data.other_essentials ?? 0),
        flexibleSpend: Number(data.flexible_spend ?? 0),
        monthlySavingsGoal: Number(data.monthly_savings_goal ?? 0),
      });
    } else {
      setProfileState(loadLocal());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const fallbackName =
          (data.user?.user_metadata as Record<string, string> | undefined)?.display_name ||
          (data.user?.user_metadata as Record<string, string> | undefined)?.full_name ||
          data.user?.email?.split("@")[0] ||
          "";
        setProfileState((p) => ({ ...p, name: p.name || fallbackName }));
        loadFromSupabase(uid);
      } else {
        setProfileState(loadLocal());
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadFromSupabase(uid);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadFromSupabase]);

  const setProfile = useCallback(
    async (p: UserProfile) => {
      setProfileState(p);
      try {
        localStorage.setItem(KEY, JSON.stringify(p));
      } catch {}
      if (userId) {
        await supabase.from("profiles").upsert({
          id: userId,
          display_name: p.name,
          monthly_income: p.monthlyIncome,
          rent: p.rent,
          emi: p.emi,
          other_essentials: p.otherEssentials,
          flexible_spend: p.flexibleSpend,
          monthly_savings_goal: p.monthlySavingsGoal,
        });
      }
    },
    [userId],
  );

  return { profile, derived: derive(profile), setProfile, userId, loading };
}
