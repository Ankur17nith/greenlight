'use client';

import { Check, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatTime, type AuditRow } from '@/lib/api';
import { describe, useApi } from '@/lib/use-api';

const decisionLabel = { APPROVED: 'Approved', DECLINED: 'Declined' } as const;
const decisionVariant = { APPROVED: 'go', DECLINED: 'stop' } as const;

/** Polls every 3 seconds so a tap on the glasses shows up here within 5 (task D2-5). */
export function AuditTable() {
  const { data, error } = useApi<{ rows: AuditRow[] }>('/api/audit', 3000);
  if (error && !data) return <p role="alert" className="text-sm text-stop">{describe(error)}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <Card className="overflow-x-auto">
      {error ? <p role="alert" className="px-4 pt-3 text-xs text-hold">Connection lost. Showing the last data.</p> : null}
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-border text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Request</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Verdict</th>
            <th className="px-4 py-3 font-medium">Decision</th>
            <th className="px-4 py-3 font-medium">Engine</th>
            <th className="px-4 py-3 font-medium">Time (UTC)</th>
          </tr>
        </thead>
        <tbody aria-live="polite">
          {data.rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No decisions yet. Approve or decline a card on the glasses and it appears here.
              </td>
            </tr>
          ) : null}
          {data.rows.map((r) => (
            <tr key={r.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <div>{r.headline}</div>
                <div className="text-xs text-muted-foreground">{r.requester}</div>
              </td>
              <td className="px-4 py-3 font-mono text-xs">{r.category}</td>
              <td className="px-4 py-3">
                <Badge variant={r.policy_status === 'WITHIN_POLICY' ? 'go' : 'stop'}>
                  {r.policy_status === 'WITHIN_POLICY' ? <Check className="size-3.5" aria-hidden /> : <TriangleAlert className="size-3.5" aria-hidden />}
                  {r.policy_status === 'WITHIN_POLICY' ? 'Within policy' : 'Flagged'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={decisionVariant[r.decision]}>{decisionLabel[r.decision]}</Badge>
              </td>
              <td className="px-4 py-3 font-mono text-xs">{r.eval_mode}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.decided_at ? formatTime(r.decided_at) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
