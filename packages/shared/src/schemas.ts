import { z } from "zod";

export const Source = z.enum(["TELEGRAM", "GMAIL", "CALENDAR"]);
export const Category = z.enum(["EXPENSE", "REFUND", "SIGN_OFF", "CALENDAR"]);
export const PolicyStatus = z.enum(["WITHIN_POLICY", "FLAGGED"]);
export const EvalMode = z.enum(["AI", "FALLBACK"]);
export const CardStatus = z.enum(["PENDING", "APPROVED", "DECLINED", "SNOOZED"]);
export const Action = z.enum(["APPROVE", "DECLINE", "SNOOZE"]);

/** What the model returns. Limits come from docs/POLICY_GUARD.md. */
export const Verdict = z.object({
  category: Category,
  headline: z.string().min(1).max(42),
  policy_status: PolicyStatus,
  policy_reason: z.string().max(24),
  recommendation: z.string().min(1).max(44),
  suggested_reply: z.string().min(1).max(280),
});
export type Verdict = z.infer<typeof Verdict>;

/** A card as stored and served by GET /api/queue. */
export const RequestCard = Verdict.extend({
  id: z.string().min(1),
  source: Source,
  external_id: z.string().min(1),
  requester: z.string().min(1),
  eval_mode: EvalMode,
  status: CardStatus,
  snoozed_until: z.string().nullable(),
  created_at: z.string(),
  decided_at: z.string().nullable(),
});
export type RequestCard = z.infer<typeof RequestCard>;

export const Decision = z.object({ action: Action });
export type Decision = z.infer<typeof Decision>;

/** A raw inbound request before evaluation. */
export const RawRequest = z.object({
  source: Source,
  external_id: z.string().min(1),
  requester: z.string().min(1),
  text: z.string(),
});
export type RawRequest = z.infer<typeof RawRequest>;
