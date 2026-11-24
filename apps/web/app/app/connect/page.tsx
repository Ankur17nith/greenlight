import { CalendarClock, Mail, MessageCircle } from 'lucide-react';
import { PageTitle, SampleNote } from '@/components/page-title';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Connect' };

const sources = [
  { icon: MessageCircle, name: 'Telegram', body: 'Add the Greenlight bot to a group. It reads requests there and replies under the original message.', scope: 'Bot token on the server' },
  { icon: Mail, name: 'Gmail', body: 'Read the Approval and Invoice labels, and reply in the same thread.', scope: 'gmail.readonly, gmail.send' },
  { icon: CalendarClock, name: 'Google Calendar', body: 'Spot invites that clash and set your response.', scope: 'calendar.events' },
];

export default function ConnectPage() {
  return (
    <>
      <PageTitle title="Connect" description="Google sign-in cannot run inside the glasses app, so accounts are connected here." />
      <SampleNote />
      <div className="space-y-3">
        {sources.map((s) => (
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
                <Badge>Not connected</Badge>
                <Button size="sm" variant="outline" disabled>
                  Connect
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </>
  );
}
