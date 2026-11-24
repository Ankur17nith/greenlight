'use client';

import { History, Inbox, Link2, ListChecks, QrCode } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const items = [
  { href: '/app', label: 'Queue', icon: Inbox },
  { href: '/app/connect', label: 'Connect', icon: Link2 },
  { href: '/app/rules', label: 'Rules', icon: ListChecks },
  { href: '/app/pair', label: 'Pair glasses', icon: QrCode },
  { href: '/app/audit', label: 'Audit log', icon: History },
];

export function AppNav() {
  const path = usePathname();
  return (
    <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === '/app' ? path === '/app' : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors',
              active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
