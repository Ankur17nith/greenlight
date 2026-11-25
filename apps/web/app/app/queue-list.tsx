'use client';

import { LensCard } from '@/components/lens-card';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { describe, useApi } from '@/lib/use-api';

interface PendingCard {
  id: string;
  source: 'TELEGRAM' | 'GMAIL' | 'CALENDAR';
  category: string;
  headline: string;
  policy_status: 'WITHIN_POLICY' | 'FLAGGED';
  policy_reason: string;
  ai_recommendation: string;
  eval_mode: 'AI' | 'FALLBACK';
}
const code = { TELEGRAM: 'TG', GMAIL: 'GM', CALENDAR: 'CAL' } as const;
const badge = (c: PendingCard) => (c.policy_status === 'WITHIN_POLICY' ? 'WITHIN POLICY' : `FLAGGED: ${c.policy_reason || 'review'}`.slice(0, 40));

export function QueueList() {
  const { data, error } = useApi<{ cards: PendingCard[] }>('/api/pending', 3000);
  if (error && !data) return <p role="alert" className="text-sm text-stop">{describe(error)}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (data.cards.length === 0) {
    return <p className="rounded-md border border-border p-6 text-center text-muted-foreground">ALL CLEAR. No decisions waiting.</p>;
  }
  const first = data.cards[0]!;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-3">
        {data.cards.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="font-mono">[{c.category} · {code[c.source]}]</span>
              <Badge variant={c.policy_status === 'WITHIN_POLICY' ? 'go' : 'stop'}>{badge(c)}</Badge>
            </div>
            <p className="mt-2 font-medium">{c.headline}</p>
            <p className="mt-1 text-sm text-muted-foreground">AI: {c.ai_recommendation}</p>
            {c.eval_mode === 'FALLBACK' ? <p className="mt-1 font-mono text-xs text-hold">FALLBACK: AI did not judge this one</p> : null}
          </Card>
        ))}
      </div>
      <div className="space-y-2">
        <LensCard
          header={`[${first.category} · ${code[first.source]}]`}
          badge={badge(first)}
          headline={first.headline.slice(0, 42)}
          verdict={`AI: ${first.ai_recommendation}`.slice(0, 44)}
          footer="TAP: Approve · SWIPE: Next · HOLD: Deny"
          position={`1/${data.cards.length}`}
        />
        <p className="text-center text-xs text-muted-foreground">What card 1 looks like on the G2.</p>
      </div>
    </div>
  );
}
