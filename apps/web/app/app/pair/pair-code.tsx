'use client';

import { Copy, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError, client, groupCode, secondsLeft } from '@/lib/api';
import { describe } from '@/lib/use-api';

export function PairCode() {
  const [code, setCode] = useState<{ code: string; expires_at: string } | null>(null);
  const [left, setLeft] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const make = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const c = await client().send<{ code: string; expires_at: string }>('POST', '/api/pair');
      setCode(c);
      setLeft(secondsLeft(c.expires_at));
    } catch (e) {
      setError(describe(e instanceof ApiError ? e : new ApiError(0, '')));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void make();
  }, [make]);

  useEffect(() => {
    if (!code) return;
    const t = setInterval(() => setLeft(secondsLeft(code.expires_at)), 1000);
    return () => clearInterval(t);
  }, [code]);

  const expired = !!code && left === 0;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pairing code</CardTitle>
        <CardDescription>Type this once in the Greenlight screen inside the Even Realities app.</CardDescription>
      </CardHeader>
      <CardContent>
        <p
          aria-label={code ? `Pairing code ${code.code.split('').join(' ')}` : 'Generating code'}
          className={`font-mono text-5xl font-semibold tracking-[0.2em] sm:text-6xl ${expired ? 'text-muted-foreground line-through' : 'text-primary'}`}
        >
          {code ? groupCode(code.code) : '--- ---'}
        </p>
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {error ? <span className="text-stop">{error}</span> : expired ? 'Code expired. Make a new one.' : code ? `Expires in ${mm}:${ss}. Works once.` : ''}
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" size="sm" disabled={!code || expired} onClick={() => code && navigator.clipboard?.writeText(code.code)}>
            <Copy /> Copy
          </Button>
          <Button size="sm" disabled={busy} onClick={make}>
            <RefreshCw /> New code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
