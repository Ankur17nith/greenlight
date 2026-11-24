import { PageTitle, SampleNote } from '@/components/page-title';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { sampleAudit, sourceCode } from '@/lib/mock';

export const metadata = { title: 'Audit log' };

const decisionLabel = { APPROVED: 'Approved', DECLINED: 'Declined', SNOOZED: 'Snoozed' } as const;
const decisionVariant = { APPROVED: 'go', DECLINED: 'stop', SNOOZED: 'hold' } as const;

export default function AuditPage() {
  return (
    <>
      <PageTitle title="Audit log" description="Every tap on the glasses: who asked, what for, the policy verdict, your decision and when." />
      <SampleNote />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Request</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Verdict</th>
              <th className="px-4 py-3 font-medium">Decision</th>
              <th className="px-4 py-3 font-medium">Engine</th>
              <th className="px-4 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody aria-live="polite">
            {sampleAudit.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div>{r.headline}</div>
                  <div className="text-xs text-muted-foreground">{r.requester}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{sourceCode[r.source]}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.policy_status === 'WITHIN_POLICY' ? 'go' : 'stop'}>
                    {r.policy_status === 'WITHIN_POLICY' ? '✓ Within policy' : '⚠ Flagged'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={decisionVariant[r.decision]}>{decisionLabel[r.decision]}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{r.eval_mode}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.decided_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
