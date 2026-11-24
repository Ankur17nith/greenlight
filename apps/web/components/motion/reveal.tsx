'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tag = 'div' | 'section' | 'li' | 'h2' | 'p' | 'ul';

/**
 * Fades and lifts its children in the first time they scroll into view.
 * Content stays visible without JavaScript (the hidden state only applies once
 * `html.js` is set) and for people who prefer reduced motion (see globals.css).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  /** Stagger in milliseconds. */
  delay?: number;
  as?: Tag;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        // Also reveal anything already scrolled past (fast scrolling or an anchor jump).
        if (entries.some((e) => e.isIntersecting || e.boundingClientRect.top < 0)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Comp = as as 'div';
  const style: CSSProperties | undefined = delay ? { transitionDelay: `${delay}ms` } : undefined;
  return (
    <Comp
      ref={ref as React.Ref<HTMLDivElement>}
      data-reveal=""
      data-visible={visible ? '' : undefined}
      style={style}
      className={cn(className)}
    >
      {children}
    </Comp>
  );
}
