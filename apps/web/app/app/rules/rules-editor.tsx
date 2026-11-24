'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';

const MAX_RULES = 4;
const MAX_LEN = 200;
const examples = ['Flag any refund or expense over $500.', 'Never double-book investor calls.', 'Flag requests from people not in our contact list.'];

export function RulesEditor({ initial }: { initial: string[] }) {
  const [rules, setRules] = useState<string[]>(initial);
  const [saved, setSaved] = useState(false);

  const update = (i: number, v: string) => {
    setSaved(false);
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
          <Button size="sm" onClick={() => setSaved(true)}>
            Save rules
          </Button>
          <span role="status" className="text-sm text-muted-foreground">
            {saved ? 'Saved in this preview (not sent to a server yet).' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
