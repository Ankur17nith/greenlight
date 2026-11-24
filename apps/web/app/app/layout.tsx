import Link from 'next/link';
import { Logo } from '@/components/brand';
import { AppNav } from '@/components/shell/app-nav';
import { ThemeToggle } from '@/components/shell/theme-toggle';
import { SignOut, TokenGate } from '@/components/token-gate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-4 sm:px-6 md:grid md:grid-cols-[220px_1fr] md:gap-8">
      <aside className="py-4 md:sticky md:top-0 md:h-dvh md:py-6">
        <div className="mb-4 flex items-center justify-between md:mb-8">
          <Link href="/" aria-label="Greenlight home">
            <Logo height={24} />
          </Link>
          <ThemeToggle />
        </div>
        <AppNav />
      </aside>
      <main className="min-w-0 py-6 md:py-10">
        <TokenGate>{children}</TokenGate>
        <div className="mt-10"><SignOut /></div>
      </main>
    </div>
  );
}
