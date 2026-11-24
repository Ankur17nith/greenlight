'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getToken, setToken } from '@/lib/api';

/** Asks for the dashboard token once (demo auth). Children render only after it is stored. */
export function TokenGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'out' | 'in'>('loading');
  const [value, setValue] = useState('');

  useEffect(() => {
    setState(getToken() ? 'in' : 'out');
  }, []);

  if (state === 'loading') return null;
  if (state === 'in') return <>{children}</>;

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Dashboard token</CardTitle>
        <CardDescription>Paste the DASHBOARD_TOKEN from your server environment. It is kept in this browser only.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!value.trim()) return;
            setToken(value.trim());
            setState('in');
          }}
        >
          <Input type="password" aria-label="Dashboard token" autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} />
          <Button type="submit">Continue</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function SignOut() {
  return (
    <button
      className="text-xs text-muted-foreground underline"
      onClick={() => {
        setToken(null);
        location.reload();
      }}
    >
      Forget token
    </button>
  );
}
