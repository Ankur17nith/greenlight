import { LensCard } from '@/components/lens-card';
import { PageTitle, SampleNote } from '@/components/page-title';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { sampleCards, sourceCode } from '@/lib/mock';

export const metadata = { title: 'Queue' };

export default function QueuePage() {
  const first = sampleCards[0];
  return (
    <>
      <PageTitle title="Queue" description="What is waiting for your decision. You answer these on the glasses; this is the same list." />
      <SampleNote />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          {sampleCards.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-mono">[{c.category} · {sourceCode[c.source]}]</span>
                <Badge variant={c.policy_status === 'WITHIN_POLICY' ? 'go' : 'stop'}>
                  {c.policy_status === 'WITHIN_POLICY' ? '✓ Within policy' : `⚠ Flagged: ${c.policy_reason}`}
                </Badge>
              </div>
              <p className="mt-2 font-medium">{c.headline}</p>
              <p className="mt-1 text-sm text-muted-foreground">AI: {c.ai_recommendation}</p>
            </Card>
          ))}
        </div>
        <div className="space-y-2">
          <LensCard
            header={`[${first.category} · ${sourceCode[first.source]}]`}
            badge="✓ WITHIN POLICY"
            headline={first.headline.slice(0, 42)}
            verdict={`AI: ${first.ai_recommendation}`.slice(0, 44)}
            footer="TAP: Approve · SWIPE: Next · HOLD: Deny"
            position={`1/${sampleCards.length}`}
          />
          <p className="text-center text-xs text-muted-foreground">What card 1 looks like on the G2.</p>
        </div>
      </div>
    </>
  );
}
