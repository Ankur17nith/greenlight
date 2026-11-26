import type { RawRequest, Verdict } from "@greenlight/shared";
import { evaluate, evaluateRules, parseRequest, fallbackVerdict, type Complete } from "@greenlight/policy";

export type EvalResult = { verdict: Verdict; eval_mode: "AI" | "FALLBACK" | "RULES" };
export type Evaluator = (req: RawRequest, rules: string[]) => Promise<EvalResult>;

/**
 * Picks how requests are judged:
 *  - a model is configured: the model decides, with the plain fallback if it fails (eval_mode AI or FALLBACK)
 *  - no model: plain-code rules decide the clear cases (eval_mode RULES); needs no key
 * POLICY_MODE=rules forces rules-only even when a model is configured.
 */
export function makeEvaluator(complete: Complete | null, mode?: string): Evaluator {
  return async (req, rules) => {
    if (!complete || mode === "rules") {
      try {
        return { verdict: evaluateRules(req, rules).verdict, eval_mode: "RULES" };
      } catch {
        return { verdict: fallbackVerdict(req, parseRequest(req.text), "Rules unavailable"), eval_mode: "FALLBACK" };
      }
    }
    const r = await evaluate(req, rules, { complete });
    return { verdict: r.verdict, eval_mode: r.eval_mode };
  };
}
