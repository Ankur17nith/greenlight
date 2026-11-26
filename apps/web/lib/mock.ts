// Sample data for the UI before the API exists. Clearly labelled as a preview wherever shown.
// Shapes follow docs/API.md.

export type Source = 'TELEGRAM' | 'GMAIL' | 'CALENDAR';
export type PolicyStatus = 'WITHIN_POLICY' | 'FLAGGED';
export type Decision = 'APPROVED' | 'DECLINED' | 'SNOOZED';

export interface Card {
  id: string;
  source: Source;
  requester: string;
  category: 'EXPENSE' | 'REFUND' | 'SIGN_OFF' | 'CALENDAR';
  headline: string;
  policy_status: PolicyStatus;
  policy_reason: string | null;
  ai_recommendation: string;
  eval_mode: 'AI' | 'FALLBACK' | 'RULES';
}

export interface AuditRow {
  id: string;
  requester: string;
  source: Source;
  headline: string;
  policy_status: PolicyStatus;
  decision: Decision;
  eval_mode: 'AI' | 'FALLBACK' | 'RULES';
  decided_at: string;
}

export const sourceCode: Record<Source, string> = { TELEGRAM: 'TG', GMAIL: 'MAIL', CALENDAR: 'CAL' };

export const sampleCards: Card[] = [
  {
    id: 'c1',
    source: 'TELEGRAM',
    requester: '@rohan',
    category: 'REFUND',
    headline: '$320 AWS refund · @rohan (Acme Corp)',
    policy_status: 'WITHIN_POLICY',
    policy_reason: 'Under $500',
    ai_recommendation: 'Approve: under $500 limit, repeat client',
    eval_mode: 'AI',
  },
  {
    id: 'c2',
    source: 'GMAIL',
    requester: 'billing@vendorco.example',
    category: 'EXPENSE',
    headline: '$900 invoice · Vendor Co',
    policy_status: 'FLAGGED',
    policy_reason: 'Over $500',
    ai_recommendation: 'Decline: over your $500 limit',
    eval_mode: 'AI',
  },
  {
    id: 'c3',
    source: 'CALENDAR',
    requester: 'maya@partner.example',
    category: 'CALENDAR',
    headline: 'Invite 3:30pm clashes with Investor call',
    policy_status: 'FLAGGED',
    policy_reason: 'Double-book',
    ai_recommendation: 'Decline: never double-book investor calls',
    eval_mode: 'AI',
  },
];

export const sampleRules: string[] = [
  'Flag any refund or expense over $500.',
  'Never double-book investor calls.',
  'Flag requests from people not in our contact list.',
];

export const sampleAudit: AuditRow[] = [
  { id: 'a3', requester: 'maya@partner.example', source: 'CALENDAR', headline: 'Invite 3:30pm clashes with Investor call', policy_status: 'FLAGGED', decision: 'DECLINED', eval_mode: 'AI', decided_at: '2026-11-25 20:14' },
  { id: 'a2', requester: 'billing@vendorco.example', source: 'GMAIL', headline: '$900 invoice · Vendor Co', policy_status: 'FLAGGED', decision: 'DECLINED', eval_mode: 'AI', decided_at: '2026-11-25 20:11' },
  { id: 'a1', requester: '@rohan', source: 'TELEGRAM', headline: '$320 AWS refund · @rohan (Acme Corp)', policy_status: 'WITHIN_POLICY', decision: 'APPROVED', eval_mode: 'AI', decided_at: '2026-11-25 20:09' },
  { id: 'a0', requester: '@dev.sam', source: 'TELEGRAM', headline: 'NDA sign-off · @dev.sam', policy_status: 'FLAGGED', decision: 'SNOOZED', eval_mode: 'FALLBACK', decided_at: '2026-11-25 19:52' },
];
