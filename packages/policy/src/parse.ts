export type Currency = "USD" | "EUR" | "GBP" | "INR" | "AED";

export interface Parsed {
  /** Intended amount, or null when none or ambiguous. */
  amount: number | null;
  currency: Currency | null;
  /** True when more than one distinct amount remains after dropping "not $X" mentions. */
  ambiguous: boolean;
  /** First @handle mentioned in the text, if any. */
  mention: string | null;
}

const SYMBOLS: Record<string, Currency> = { $: "USD", "€": "EUR", "£": "GBP", "₹": "INR" };
const CODES: Record<string, Currency> = {
  usd: "USD", eur: "EUR", gbp: "GBP", inr: "INR", rs: "INR", aed: "AED", dhs: "AED",
};

const NUM = String.raw`\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?`;
const CODE = "usd|eur|gbp|inr|rs\\.?|aed|dhs";
// prefix: $320, Rs 4,000, USD 320 ; suffix: 320 USD
const PREFIX = new RegExp(String.raw`(?:([$€£₹])|\b(${CODE})\s*)\s*(${NUM})(k\b)?`, "gi");
const SUFFIX = new RegExp(String.raw`(${NUM})(k)?\s*(${CODE})\b`, "gi");

interface Hit { value: number; currency: Currency; index: number; end: number }

function toValue(raw: string, k?: string): number {
  const n = Number(raw.replace(/,/g, ""));
  return Math.round((k ? n * 1000 : n) * 100) / 100;
}

function code(c: string): Currency {
  return CODES[c.toLowerCase().replace(".", "")]!;
}

export function parseRequest(text: string): Parsed {
  const hits: Hit[] = [];
  for (const m of text.matchAll(PREFIX)) {
    const currency = m[1] ? SYMBOLS[m[1]]! : code(m[2]!);
    hits.push({ value: toValue(m[3]!, m[4]), currency, index: m.index!, end: m.index! + m[0].length });
  }
  for (const m of text.matchAll(SUFFIX)) {
    const index = m.index!;
    // skip if already covered by a prefix hit (e.g. "USD 320 USD")
    if (hits.some((h) => index < h.end && index + m[0].length > h.index)) continue;
    hits.push({ value: toValue(m[1]!, m[2]), currency: code(m[3]!), index, end: index + m[0].length });
  }
  hits.sort((a, b) => a.index - b.index);

  // "$300 not $3,000": a hit directly preceded by "not" / "instead of" is a correction, not the ask.
  const kept = hits.filter((h) => !/\b(?:not|instead of|rather than)\s*$/i.test(text.slice(0, h.index)));
  const mention = text.match(/@[A-Za-z0-9_]{3,32}/)?.[0] ?? null;

  const distinct = [...new Set(kept.map((h) => h.value))];
  if (distinct.length === 0) return { amount: null, currency: null, ambiguous: false, mention };
  if (distinct.length > 1) return { amount: null, currency: null, ambiguous: true, mention };
  return { amount: distinct[0]!, currency: kept[0]!.currency, ambiguous: false, mention };
}
