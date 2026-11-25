import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { LogoMark } from '@/components/brand';
import { HowItWorks } from '@/components/landing/how-it-works';
import { LensCard } from '@/components/lens-card';
import { Reveal } from '@/components/motion/reveal';
import { SiteHeader } from '@/components/shell/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sampleAudit, sampleRules } from '@/lib/mock';

const safety = [
  { title: '3-second undo', body: 'Nothing is sent until the countdown ends. Tap again to cancel.' },
  { title: 'The AI only recommends', body: 'Only your gesture triggers an action. The model never approves anything.' },
  { title: 'Every approval and decline is logged', body: 'Requester, request, verdict, decision and time, on the dashboard.' },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <h1 className="font-pixel text-4xl leading-[1.05] tracking-tight sm:text-6xl">Approve requests from your glasses.</h1>
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
              <p className="mt-8 text-sm text-muted-foreground">Works with Telegram, Gmail and Google Calendar</p>
            </div>

            <div className="space-y-3">
              <LensCard
                header="[REFUND · TG]"
                badge="WITHIN POLICY"
                headline="$320 AWS refund · @rohan (Acme)"
                verdict="AI: Approve. Under $500 limit"
                footer="TAP: Approve · SWIPE: Next · HOLD: Deny"
                position="1/3"
              />
              <p className="text-center text-xs text-muted-foreground">
                Layout preview of the 576 × 288 display, with sample data
              </p>
            </div>
          </div>
        </section>

        <HowItWorks />

        {/* Policy Guard */}
        <section id="rules" className="border-t border-border bg-card/40">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2">
            <Reveal>
              <h2 className="font-pixel text-3xl tracking-tight sm:text-4xl">Rules</h2>
              <p className="mt-3 text-muted-foreground">
                Write two to four rules once. Every incoming request is checked against them before it reaches your glasses, and a plain fallback flags anything the AI cannot judge.
              </p>
            </Reveal>
            <Reveal delay={120}>
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
            </Reveal>
          </div>
        </section>

        {/* Audit */}
        <section id="audit" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <Reveal>
              <h2 className="font-pixel text-3xl tracking-tight sm:text-4xl">Audit log</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">Requester, request, verdict, decision and time. These rows are sample data.</p>
            </Reveal>
            <Reveal delay={100}>
            <Card className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border text-xs text-muted-foreground">
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
            </Reveal>
          </div>
        </section>

        {/* Safety */}
        <section id="safety" className="border-t border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <Reveal>
              <h2 className="font-pixel text-3xl tracking-tight sm:text-4xl">Safety</h2>
            </Reveal>
            <dl className="mt-8 grid gap-x-12 gap-y-6 md:grid-cols-3">
              {safety.map((s) => (
                <div key={s.title} className="border-t border-border pt-4">
                  <dt className="font-medium">{s.title}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{s.body}</dd>
                </div>
              ))}
            </dl>
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
