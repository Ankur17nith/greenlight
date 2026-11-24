'use client';

import { useEffect, useRef, useState } from 'react';
import { LensCard, type LensProps } from '@/components/lens-card';
import { cn } from '@/lib/utils';

type Step = { title: string; body: string; lens: Omit<LensProps, 'className'> };

const base = { header: '[REFUND · TG]', headline: '$320 AWS refund · @rohan (Acme)', position: '1/3' };

const steps: Step[] = [
  {
    title: 'A request arrives',
    body: 'Rohan posts in your Telegram group. Greenlight picks it up from Telegram, Gmail or Google Calendar, so nobody has to chase you.',
    lens: { ...base, badge: '… CHECKING', verdict: 'Reading the request', footer: '' },
  },
  {
    title: 'Policy Guard checks it',
    body: 'Your plain-English rules run first. The card shows what it is, who sent it and whether it is within policy, with a one-line recommendation.',
    lens: { ...base, badge: '✓ WITHIN POLICY', verdict: 'AI: Approve. Under $500 limit', footer: 'TAP: Approve · SWIPE: Next · HOLD: Deny' },
  },
  {
    title: 'You tap, with time to undo',
    body: 'One tap approves. Nothing is sent for three seconds, and another tap cancels. Hold declines; swipe moves to the next card.',
    lens: { ...base, badge: '✓ WITHIN POLICY', verdict: 'AI: Approve. Under $500 limit', footer: 'CONFIRMING IN 3s… [TAP TO UNDO]' },
  },
  {
    title: 'It lands where it started',
    body: 'The approval is posted under Rohan’s message, and the decision is added to your audit log with the time and the verdict.',
    lens: { header: '✓ APPROVED', badge: '', headline: base.headline, verdict: 'Sent to Telegram', footer: 'Next card…', position: '2/3' },
  },
];

/**
 * Scroll-driven walkthrough: the G2 display stays pinned on large screens and
 * changes as each step scrolls into the middle of the viewport. On small
 * screens each step shows its own card instead.
 */
export function HowItWorks() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <h2 className="font-pixel text-3xl tracking-tight sm:text-4xl">Read. Decide. Done.</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">No chat threads, no inbox scrolling. Every card is one operational decision.</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ol className="relative">
            {steps.map((s, i) => (
              <li
                key={s.title}
                data-step={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className="flex min-h-[28vh] items-center py-6 lg:min-h-[62vh]"
              >
                <div className={cn('transition-opacity duration-500', i === active ? 'opacity-100' : 'lg:opacity-35')}>
                  <span className="font-mono text-xs text-primary">STEP 0{i + 1}</span>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{s.title}</h3>
                  <p className="mt-2 max-w-md text-muted-foreground">{s.body}</p>
                  <div className="mt-5 lg:hidden">
                    <LensCard {...s.lens} />
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div key={active} className="animate-in fade-in zoom-in-95 duration-300">
                <LensCard {...steps[active].lens} />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2" aria-hidden>
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className={cn('h-1 rounded-full transition-all duration-300', i === active ? 'w-8 bg-signal' : 'w-3 bg-border')}
                  />
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">Layout preview of the 576 × 288 display, with sample data.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
