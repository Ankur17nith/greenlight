import Fastify from "fastify";
import cors from "@fastify/cors";
import { Decision, type RawRequest, type Verdict } from "@greenlight/shared";
import { z } from "zod";
import * as q from "./db.ts";
import { updateToRequest, type TgUpdate } from "./telegram.ts";

export interface Deps {
  db: q.Db;
  /** Evaluates a request against the rules. Never throws; falls back to FLAGGED. */
  evaluate: (req: RawRequest, rules: string[]) => Promise<{ verdict: Verdict; eval_mode: "AI" | "FALLBACK" }>;
  /** Performs the external write for a card. Throws on failure. Returns a label for the response. */
  writeBack: (card: q.Row, action: "APPROVE" | "DECLINE") => Promise<string>;
  telegramSecret: string;
  corsOrigin?: string | boolean;
  now?: () => Date;
}

export const DEFAULT_RULES = ["Flag any refund or expense over $500.", "Never double-book investor calls.", "Flag requests from people not in our contact list."];
export const SNOOZE_MS = 60 * 60 * 1000;

const err = (code: string, message: string) => ({ error: { code, message } });
const Rules = z.array(z.string().trim().min(1).max(200)).min(2).max(4);

export async function buildApp(deps: Deps) {
  const app = Fastify({ logger: false });
  await app.register(cors, { origin: deps.corsOrigin ?? true });
  const now = () => deps.now?.() ?? new Date();
  const { db } = deps;
  const inflight = new Set<string>();

  const auth = (kind: "G2" | "DASHBOARD") => async (req: any, reply: any) => {
    const h = String(req.headers.authorization ?? "");
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    if (!token || q.sessionKind(db, token) !== kind) return reply.code(401).send(err("UNAUTHORIZED", "Missing or invalid session"));
  };

  app.get("/health", async () => ({ ok: true }));

  app.post("/telegram/webhook", async (req, reply) => {
    if (!deps.telegramSecret || req.headers["x-telegram-bot-api-secret-token"] !== deps.telegramSecret) {
      return reply.code(401).send(err("BAD_SECRET", "Invalid webhook secret"));
    }
    const r = updateToRequest(req.body as TgUpdate);
    if (!r) return { ok: true, ignored: true };
    const rules = q.getPolicies(db);
    const { verdict, eval_mode } = await deps.evaluate(r, rules.length ? rules : DEFAULT_RULES);
    const row = q.insertCard(db, { source: r.source, external_id: r.external_id, requester: r.requester, verdict, eval_mode, now: now() });
    return { ok: true, duplicate: row === null };
  });

  // suggested_reply stays server side.
  app.get("/api/queue", { preHandler: auth("G2") }, async () => ({ cards: q.queue(db, now()).map(q.toCard) }));

  app.post<{ Params: { id: string } }>("/api/decisions/:id/act", { preHandler: auth("G2") }, async (req, reply) => {
    const parsed = Decision.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send(err("BAD_ACTION", "action must be APPROVE, DECLINE or SNOOZE"));
    const action = parsed.data.action;
    const card = q.getCard(db, req.params.id);
    if (!card) return reply.code(404).send(err("NOT_FOUND", "Unknown card"));

    const want = action === "APPROVE" ? "APPROVED" : action === "DECLINE" ? "DECLINED" : null;
    if (card.status !== "PENDING") {
      // Same action repeated: idempotent success. Different action: conflict.
      if (want && card.status === want) return { id: card.id, status: card.status, write_back: "ALREADY_DONE", decided_at: card.decided_at };
      return reply.code(409).send({ ...err("CONFLICT", "Card already decided"), status: card.status });
    }

    if (action === "SNOOZE") {
      q.snooze(db, card.id, new Date(now().getTime() + SNOOZE_MS), now());
      return { id: card.id, status: "PENDING", snoozed: true, write_back: "NONE", decided_at: null };
    }

    // A double tap must never double-send: one in-flight write per card.
    if (inflight.has(card.id)) return reply.code(409).send({ ...err("IN_PROGRESS", "Action in progress"), status: card.status });
    inflight.add(card.id);
    try {
      let label: string;
      try {
        label = await deps.writeBack(card, action as "APPROVE" | "DECLINE");
      } catch {
        return reply.code(502).send(err("WRITE_FAILED", "The external write failed; card is still pending"));
      }
      q.decide(db, card.id, want!, now());
      const done = q.getCard(db, card.id)!;
      return { id: done.id, status: done.status, write_back: label, decided_at: done.decided_at };
    } finally {
      inflight.delete(card.id);
    }
  });

  app.get("/api/audit", { preHandler: auth("DASHBOARD") }, async () => ({
    rows: q.audit(db).map((r) => ({
      id: r.id, requester: r.requester, category: r.category, headline: r.headline, policy_status: r.policy_status,
      decision: r.status, eval_mode: r.eval_mode, decided_at: r.decided_at,
    })),
  }));

  app.get("/api/policies", { preHandler: auth("DASHBOARD") }, async () => ({ rules: q.getPolicies(db) }));
  app.put("/api/policies", { preHandler: auth("DASHBOARD") }, async (req, reply) => {
    const p = z.object({ rules: Rules }).safeParse(req.body);
    if (!p.success) return reply.code(400).send(err("BAD_RULES", "Send 2 to 4 rules, each 1 to 200 characters"));
    q.setPolicies(db, p.data.rules);
    return { rules: p.data.rules };
  });

  app.post("/api/pair", { preHandler: auth("DASHBOARD") }, async () => q.createPairCode(db, now()));
  app.post("/api/pair/exchange", async (req, reply) => {
    const p = z.object({ code: z.string().regex(/^\d{6}$/) }).safeParse(req.body);
    if (!p.success || !q.consumePairCode(db, p.data.code, now())) {
      return reply.code(400).send(err("BAD_CODE", "Code is invalid, used or expired"));
    }
    return { token: q.createSession(db, "G2") };
  });

  return app;
}
