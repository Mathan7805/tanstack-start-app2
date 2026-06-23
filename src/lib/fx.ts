// Static FX rates → INR. Update periodically.
// Source: indicative mid-market rates (Jun 2026).
export const FX_TO_INR: Record<string, number> = {
  INR: 1,
  USD: 85.4,
  GBP: 108.2,
  EUR: 92.1,
  AED: 23.25,
  SGD: 63.1,
  AUD: 56.4,
  CAD: 62.0,
  JPY: 0.54,
  CHF: 96.5,
  CNY: 11.85,
  HKD: 10.9,
  ZAR: 4.65,
  SAR: 22.75,
  NZD: 51.8,
  SEK: 8.05,
  NOK: 7.95,
  DKK: 12.35,
};

const SYMBOL_TO_CODE: Record<string, string> = {
  "₹": "INR", "rs": "INR", "rs.": "INR", "inr": "INR",
  "$": "USD", "us$": "USD", "usd": "USD",
  "£": "GBP", "gbp": "GBP",
  "€": "EUR", "eur": "EUR",
  "د.إ": "AED", "aed": "AED", "dhs": "AED", "dhs.": "AED",
  "s$": "SGD", "sgd": "SGD",
  "a$": "AUD", "aud": "AUD",
  "c$": "CAD", "cad": "CAD",
  "¥": "JPY", "jpy": "JPY",
  "chf": "CHF", "cny": "CNY", "rmb": "CNY",
  "hk$": "HKD", "hkd": "HKD",
  "zar": "ZAR", "sar": "SAR", "sek": "SEK", "nok": "NOK", "dkk": "DKK", "nzd": "NZD",
};

export function normalizeCurrency(input?: string | null): string {
  if (!input) return "INR";
  const raw = String(input).trim().toLowerCase();
  if (!raw) return "INR";
  const direct = raw.toUpperCase();
  if (FX_TO_INR[direct] != null) return direct;
  if (SYMBOL_TO_CODE[raw]) return SYMBOL_TO_CODE[raw];
  // last resort: take first 3 letters if alphabetic
  const m = raw.match(/[a-z]{3}/);
  if (m) {
    const code = m[0].toUpperCase();
    if (FX_TO_INR[code] != null) return code;
  }
  return "INR";
}

export function toINR(amount?: number | null, currency?: string | null): { inr: number | null; rate: number; code: string } {
  const code = normalizeCurrency(currency);
  const rate = FX_TO_INR[code] ?? 1;
  if (amount == null || !Number.isFinite(Number(amount))) return { inr: null, rate, code };
  return { inr: Number(amount) * rate, rate, code };
}

export function fmtMoney(amount?: number | null, code: string = "INR"): string {
  if (amount == null || !Number.isFinite(Number(amount))) return "—";
  const n = Number(amount);
  if (code === "INR") {
    return `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;
  }
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${code} ${new Intl.NumberFormat("en-US").format(Math.round(n))}`;
  }
}
