import { ArrowRight, CalendarClock, Check, Mail, MessageCircle, ShieldCheck, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { LogoMark } from '@/components/brand';
import { LensCard } from '@/components/lens-card';
import { SiteHeader } from '@/components/shell/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sampleAudit, sampleRules } from '@/lib/mock';

const steps = [
  { icon: MessageCircle, title: 'A request arrives', body: 'From a Telegram group, Gmail or Google Calendar. Your team asks; nobody has to chase you.' },
  { icon: ShieldCheck, title: 'Policy Guard checks it', body: 'Your plain-English rules run first. The glasses show what it is, who sent it and whether it is within policy.' },
  { icon: Check, title: 'You decide in one tap', body: 'Tap to approve, hold to decline, swipe for the next. The answer goes back to where the request came from.' },
];

const safety = [
  { icon: Undo2, title: '3-second undo', body: 'Nothing is sent until the countdown ends. Tap again to cancel.' },
  { icon: ShieldCheck, title: 'The AI only recommends', body: 'Only your gesture triggers an action. The model never approves anything.' },
  { icon: Check, title: 'Every tap is logged', body: 'Requester, request, verdict, decision and time, on the dashboard.' },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <Badge variant="go" className="mb-5">
                <span className="size-1.5 rounded-full bg-signal" aria-hidden /> Built for Even Realities G2
              </Badge>
              <h1 className="font-pixel text-4xl leading-[1.05] tracking-tight sm:text-6xl">
                Approve in one tap.
                <br />
                <span className="text-primary">From your glasses.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                Greenlight puts one team request at a time on your G2, already checked against your own company rules. Refunds, expenses, vendor sign-offs and calendar clashes, answered without opening a laptop.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/app">
                    Open the dashboard <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#how">See how it works</a>
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><MessageCircle className="size-4" /> Telegram</li>
                <li className="flex items-center gap-2"><Mail className="size-4" /> Gmail</li>
                <li className="flex items-center gap-2"><CalendarClock className="size-4" /> Google Calendar</li>
              </ul>
            </div>

            <div className="space-y-3">
              <LensCard
                header="[REFUND · TG]"
                badge="✓ WITHIN POLICY"
                headline="$320 AWS refund · @rohan (Acme)"
                verdict="AI: Approve. Under $500 limit"
                footer="TAP: Approve · SWIPE: Next · HOLD: Deny"
                position="1/3"
              />
              <p className="text-center text-xs text-muted-foreground">
                Layout preview of the 576 × 288 display, with sample data.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <h2 className="font-pixel text-3xl tracking-tight sm:text-4xl">Read. Decide. Done.</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">No chat threads, no inbox scrolling. Every card is one operational decision.</p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((s, i) => (
                <Card key={s.title}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <s.icon className="size-5 text-primary" aria-hidden />
                      <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                    </div>
                    <CardTitle className="mt-3">{s.title}</CardTitle>
                    <CardDescription>{s.body}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Policy Guard */}
        <section id="rules" className="border-t border-border bg-card/40">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2">
            <div>
              <h2 className="font-pixel text-3xl tracking-tight sm:text-4xl">Your rules, in your words.</h2>
              <p className="mt-3 text-muted-foreground">
                Write two to four rules once. Every incoming request is checked against them before it reaches your glasses, and a plain fallback flags anything the AI cannot judge.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Policy Guard</CardTitle>
                <CardDescription>Example rules (sample)</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {sampleRules.map((r, i) => (
                    <li key={r} className="flex gap-3 rounded-md border border-border bg-background/60 px-3 py-2 text-sm">
                      <span className="font-mono text-muted-foreground">{i + 1}</span>
                      {r}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Audit */}
        <section id="audit" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <h2 className="font-pixel text-3xl tracking-tight sm:text-4xl">A record of every tap.</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">Requester, request, verdict, decision and time. Sample data shown.</p>
            <Card className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Request</th>
                    <th className="px-4 py-3 font-medium">Verdict</th>
                    <th className="px-4 py-3 font-medium">Decision</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleAudit.slice(0, 3).map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">{r.headline}</td>
                      <td className="px-4 py-3">
                        <Badge variant={r.policy_status === 'WITHIN_POLICY' ? 'go' : 'stop'}>
                          {r.policy_status === 'WITHIN_POLICY' ? 'Within policy' : 'Flagged'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{r.decision === 'APPROVED' ? 'Approved' : r.decision === 'DECLINED' ? 'Declined' : 'Snoozed'}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{r.decided_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </section>

        {/* Safety */}
        <section id="safety" className="border-t border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <h2 className="font-pixel text-3xl tracking-tight sm:text-4xl">Built so a mis-tap is cheap.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {safety.map((s) => (
                <Card key={s.title}>
                  <CardHeader>
                    <s.icon className="size-5 text-primary" aria-hidden />
                    <CardTitle className="mt-3">{s.title}</CardTitle>
                    <CardDescription>{s.body}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <LogoMark size={20} />
            <span>Greenlight · Heads Up hackathon entry</span>
          </div>
          <span>MIT licensed · Greenlight never moves funds</span>
        </div>
      </footer>
    </>
  );
}
