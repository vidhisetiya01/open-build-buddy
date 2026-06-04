import { useEffect, useState } from "react";

export interface UserProfile {
  name: string;
  monthlyIncome: number;
  monthlySavings: number;
  dailyBudget: number;
  healthScore: number;
  essentials: number;
  flexible: number;
}

export const samplePeople: UserProfile[] = [
  {
    name: "Ananya Sharma",
    monthlyIncome: 95000,
    monthlySavings: 18500,
    dailyBudget: 1240,
    healthScore: 78,
    essentials: 48000,
    flexible: 28500,
  },
  {
    name: "Rohan Mehta",
    monthlyIncome: 150000,
    monthlySavings: 45000,
    dailyBudget: 2100,
    healthScore: 88,
    essentials: 60000,
    flexible: 45000,
  },
  {
    name: "Priya Iyer",
    monthlyIncome: 55000,
    monthlySavings: 8000,
    dailyBudget: 720,
    healthScore: 62,
    essentials: 32000,
    flexible: 15000,
  },
  {
    name: "Arjun Verma",
    monthlyIncome: 220000,
    monthlySavings: 80000,
    dailyBudget: 3200,
    healthScore: 92,
    essentials: 80000,
    flexible: 60000,
  },
];

const KEY = "moneywise.profile.v1";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(samplePeople[0]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setProfile({ ...samplePeople[0], ...JSON.parse(raw) });
    } catch {}
  }, []);

  const update = (p: UserProfile) => {
    setProfile(p);
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {}
  };

  return { profile, setProfile: update };
}
