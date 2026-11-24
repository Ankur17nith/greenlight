'use client';

import { CalendarClock, Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError, client } from '@/lib/api';
import { describe, useApi } from '@/lib/use-api';

const sources = [
  { key: 'telegram', icon: MessageCircle, name: 'Telegram', body: 'Add the Greenlight bot to a group. It reads requests there and replies under the original message.', scope: 'Bot token on the server' },
  { key: 'gmail', icon: Mail, name: 'Gmail', body: 'Read the Approval and Invoice labels, and reply in the same thread.', scope: 'gmail.readonly, gmail.send' },
  { key: 'calendar', icon: CalendarClock, name: 'Google Calendar', body: 'Spot invites that clash and set your response.', scope: 'calendar.events' },
] as const;

export function Sources() {
  const { data, error } = useApi<{ google: boolean; telegram: boolean }>('/api/connections');
  const [msg, setMsg] = useState('');

  const connectGoogle = async () => {
    setMsg('');
    try {
      const { url } = await client().get<{ url: string }>('/auth/google');
      window.location.href = url; // Google sign-in happens in the browser, never in the glasses WebView
    } catch (e) {
      setMsg(e instanceof ApiError && e.status === 501 ? 'Google is not configured on the server yet.' : describe(e instanceof ApiError ? e : new ApiError(0, '')));
    }
  };

  if (error) return <p role="alert" className="text-sm text-stop">{describe(error)}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-3">
      {sources.map((s) => {
        const on = s.key === 'telegram' ? data.telegram : data.google;
        return (
          <Card key={s.name}>
            <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <s.icon className="mt-0.5 size-5 text-primary" aria-hidden />
                <div>
                  <CardTitle>{s.name}</CardTitle>
                  <CardDescription className="mt-1">{s.body}</CardDescription>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">{s.scope}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={on ? 'go' : undefined}>{on ? 'Connected' : 'Not connected'}</Badge>
                {s.key !== 'telegram' ? (
                  <Button size="sm" variant="outline" onClick={connectGoogle}>
                    {on ? 'Reconnect' : 'Connect'}
                  </Button>
                ) : null}
              </div>
            </CardHeader>
          </Card>
        );
      })}
      <p role="status" className="text-sm text-muted-foreground">{msg}</p>
    </div>
  );
}
