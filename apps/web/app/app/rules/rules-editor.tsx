'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { ApiError, client } from '@/lib/api';
import { describe, useApi } from '@/lib/use-api';

const MAX_RULES = 4;
const MAX_LEN = 200;
const examples = ['Flag any refund or expense over $500.', 'Never double-book investor calls.', 'Flag requests from people not in our contact list.'];

export function RulesEditor() {
  const { data, error } = useApi<{ rules: string[] }>('/api/policies');
  const [rules, setRules] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // Until rules are saved the server uses the three demo rules, so start the editor from them.
  useEffect(() => {
    if (data) setRules(data.rules.length >= 2 ? data.rules : examples);
  }, [data]);

  const save = async () => {
    setBusy(true);
    setMsg('');
    try {
      const r = await client().send<{ rules: string[] }>('PUT', '/api/policies', { rules: rules.map((x) => x.trim()) });
      setRules(r.rules);
      setSaved(true);
      setMsg('Saved. The next request is checked against these rules.');
    } catch (e) {
      setMsg(describe(e instanceof ApiError ? e : new ApiError(0, '')));
    } finally {
      setBusy(false);
    }
  };

  if (error) return <p role="alert" className="text-sm text-stop">{describe(error)}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Loading rules…</p>;

  const update = (i: number, v: string) => {
    setSaved(false);
    setMsg('');
    setRules((r) => r.map((x, j) => (j === i ? v.slice(0, MAX_LEN) : x)));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Policy Guard rules</CardTitle>
        <CardDescription>Two to four rules, in plain English. Every request is checked against them.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rules.map((r, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-2 w-5 font-mono text-xs text-muted-foreground">{i + 1}</span>
            <div className="flex-1">
              <Textarea
                aria-label={`Rule ${i + 1}`}
                value={r}
                onChange={(e) => update(i, e.target.value)}
                rows={2}
              />
              <p className="mt-1 text-right font-mono text-xs text-muted-foreground">
                {r.length}/{MAX_LEN}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove rule ${i + 1}`}
              disabled={rules.length <= 2}
              onClick={() => {
                setSaved(false);
                setRules((x) => x.filter((_, j) => j !== i));
              }}
            >
              <Trash2 />
            </Button>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            disabled={rules.length >= MAX_RULES}
            onClick={() => {
              setSaved(false);
              setRules((r) => [...r, examples[r.length % examples.length]]);
            }}
          >
            <Plus /> Add a rule
          </Button>
          <Button size="sm" onClick={save} disabled={busy || rules.some((r) => !r.trim())}>
            {busy ? 'Saving…' : 'Save rules'}
          </Button>
          <span role="status" className="text-sm text-muted-foreground">
            {msg}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
