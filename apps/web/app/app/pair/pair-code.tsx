'use client';

import { Copy, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TTL = 10 * 60;

function makeCode() {
  const n = Math.floor(100000 + Math.random() * 900000).toString();
  return `${n.slice(0, 3)}-${n.slice(3)}`;
}

export function PairCode() {
  // The code is generated in the browser for this preview. The real one comes from POST /api/pair.
  const [code, setCode] = useState<string | null>(null);
  const [left, setLeft] = useState(TTL);

  useEffect(() => {
    setCode(makeCode());
  }, []);

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const expired = left === 0;
  const mm = String(Math.floor(left / 60)).padStart(1, '0');
  const ss = String(left % 60).padStart(2, '0');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pairing code</CardTitle>
        <CardDescription>Type this once in the Greenlight screen inside the Even Realities app.</CardDescription>
      </CardHeader>
      <CardContent>
        <p
          aria-label={code ? `Pairing code ${code.replace('-', ' ')}` : 'Generating code'}
          className="font-mono text-5xl font-semibold tracking-[0.2em] text-primary sm:text-6xl"
        >
          {code ?? '--- ---'}
        </p>
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {expired ? 'Code expired. Make a new one.' : `Expires in ${mm}:${ss}`}
        </p>
        <div className="mt-5 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!code || expired}
            onClick={() => code && navigator.clipboard?.writeText(code.replace('-', ''))}
          >
            <Copy /> Copy
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setCode(makeCode());
              setLeft(TTL);
            }}
          >
            <RefreshCw /> New code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
