import type { RawRequest, Verdict } from "@greenlight/shared";
import { fallbackVerdict } from "./evaluate";
import { parseRequest, type Currency, type Parsed } from "./parse";

/**
 * Rules-only mode: decides the clear cases with plain code and no model.
 * It understands two kinds of plain-English rule and says so for the rest:
 *  - an amount limit ("Flag any refund or expense over $500")
 *  - a calendar clash ("Never double-book investor calls")
 * A request is WITHIN_POLICY only when at least one rule applied to it and none was broken.
 */

export interface AmountRule { kind: "amount"; limit: number; inclusive: boolean; currency: Currency | null }
export interface ClashRule { kind: "clash"; keyword: string | null }
export type CompiledRule = AmountRule | ClashRule | { kind: "unknown" };

const SYMBOLS: Record<string, Currency> = { $: "USD", "€": "EUR", "£": "GBP", "₹": "INR" };
const CODES: Record<string, Currency> = { usd: "USD", eur: "EUR", gbp: "GBP", inr: "INR", rs: "INR", aed: "AED" };
const SIGN: Record<Currency, string> = { USD: "$", EUR: "€", GBP: "£", INR: "₹", AED: "AED " };
const NUM = String.raw`\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?`;
const LIMIT = new RegExp(
  String.raw`\b(over|above|more than|exceed(?:s|ing)?|greater than|at least|at or above|under|below|less than)\s+(?:([$€£₹])|(usd|eur|gbp|inr|rs|aed)\.?\s*)?\s*(${NUM})(k\b)?`,
  "i",
);
const OR_MORE = new RegExp(String.raw`(?:([$€£₹])|\b(usd|eur|gbp|inr|rs|aed)\.?\s*)?\s*(${NUM})(k\b)?\s*(?:\+|or more|or above|and above)`, "i");

export function compileRule(text: string): CompiledRule {
  const t = text.trim();
  const clash = /\b(double[- ]?book|overlap|clash|conflict)/i.test(t);
  if (clash) {
    const kw = t.match(/\b(investor|board|customer|client|candidate|interview)\b/i)?.[1]?.toLowerCase() ?? null;
    return { kind: "clash", keyword: kw };
  }
  // Only rules that say to flag, hold or stop something are limits; "under $500 is fine" is not a trigger.
  if (!/\b(flag|hold|stop|block|decline|reject|review|escalate|never|don't|do not|needs?)\b/i.test(t)) return { kind: "unknown" };
  const m = t.match(LIMIT);
  if (m) {
    const dir = m[1]!.toLowerCase();
    if (/^(under|below|less than)$/.test(dir)) return { kind: "unknown" };
    const cur = m[2] ? SYMBOLS[m[2]]! : m[3] ? CODES[m[3].toLowerCase()]! : null;
    const n = Number(m[4]!.replace(/,/g, "")) * (m[5] ? 1000 : 1);
    return { kind: "amount", limit: n, inclusive: /at least|at or above/.test(dir), currency: cur };
  }
  const o = t.match(OR_MORE);
  if (o) {
    const cur = o[1] ? SYMBOLS[o[1]]! : o[2] ? CODES[o[2].toLowerCase()]! : null;
    return { kind: "amount", limit: Number(o[3]!.replace(/,/g, "")) * (o[4] ? 1000 : 1), inclusive: true, currency: cur };
  }
  return { kind: "unknown" };
}

const money = (n: number, c: Currency) => `${SIGN[c]}${Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(2)}`;

function category(req: RawRequest, parsed: Parsed): Verdict["category"] {
  if (req.source === "CALENDAR") return "CALENDAR";
  if (/\b(refund|reimburse|credit back)/i.test(req.text)) return "REFUND";
  return parsed.amount !== null ? "EXPENSE" : "SIGN_OFF";
}

export interface RulesResult { verdict: Verdict; checked: number; total: number }

export function evaluateRules(req: RawRequest, rules: string[]): RulesResult {
  const parsed = parseRequest(req.text);
  const compiled = rules.map(compileRule);
  const base = fallbackVerdict(req, parsed);
  const cat = category(req, parsed);
  const flagged = (reason: string, rec: string, checked: number): RulesResult => ({
    verdict: { ...base, category: cat, policy_status: "FLAGGED", policy_reason: reason.slice(0, 24), recommendation: rec.slice(0, 44), suggested_reply: "Thanks for sending this. I cannot approve it as it stands. Let's talk." },
    checked, total: rules.length,
  });

  if (parsed.ambiguous) return flagged("Several amounts", "Check which amount is meant", 0);

  let applied = 0;
  let loosest: AmountRule | null = null;
  for (const r of compiled) {
    if (r.kind === "amount" && parsed.amount !== null) {
      const cur = r.currency ?? parsed.currency ?? "USD";
      if (parsed.currency && parsed.currency !== cur) return flagged("Other currency", "Check the currency", applied);
      applied++;
      const broke = r.inclusive ? parsed.amount >= r.limit : parsed.amount > r.limit;
      if (broke) return flagged(`Over ${money(r.limit, cur)}`, `Decline. Over ${money(r.limit, cur)} limit`, applied);
      if (!loosest || r.limit > loosest.limit) loosest = r;
    }
    if (r.kind === "clash" && req.source === "CALENDAR") {
      if (r.keyword && !new RegExp(r.keyword, "i").test(req.text)) continue; // a clash with something this rule does not cover
      applied++;
      return flagged("Double-book", "Decline. Overlaps another event", applied);
    }
  }
  if (applied === 0) return flagged("No rule covers this", "Review manually", 0);
  const unchecked = compiled.filter((r) => r.kind === "unknown").length;
  const lim = loosest ? money(loosest.limit, loosest.currency ?? parsed.currency ?? "USD") : "";
  return {
    verdict: {
      ...base, category: cat, policy_status: "WITHIN_POLICY",
      policy_reason: (unchecked ? `Checked ${rules.length - unchecked} of ${rules.length} rules` : "Within your rules").slice(0, 24),
      recommendation: loosest ? `Approve. Under ${lim} limit` : "Approve. No rule broken",
      suggested_reply: "Approved. Please go ahead.",
    },
    checked: applied, total: rules.length,
  };
}
