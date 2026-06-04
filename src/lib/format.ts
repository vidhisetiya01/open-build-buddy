// Manual INR formatting to ensure identical output on server (Cloudflare
// workerd ICU) and client (browser ICU) — avoids hydration mismatches that
// arise from Intl.NumberFormat differences (e.g. NBSP vs space after ₹).

function groupIndian(intStr: string): string {
  const negative = intStr.startsWith("-");
  const digits = negative ? intStr.slice(1) : intStr;
  if (digits.length <= 3) return (negative ? "-" : "") + digits;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return (negative ? "-" : "") + grouped + "," + last3;
}

export const inr = (n: number) => `₹${groupIndian(String(Math.round(n)))}`;

export const inrCompact = (n: number) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}${(abs / 1e7).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (abs >= 1e5) return `${sign}${(abs / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return `${sign}${abs}`;
};
