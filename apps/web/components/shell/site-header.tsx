import Link from 'next/link';
import { Logo } from '@/components/brand';
import { ThemeToggle } from '@/components/shell/theme-toggle';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Greenlight home">
          <Logo height={26} />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Main">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#rules" className="hover:text-foreground">Rules</a>
          <a href="#audit" className="hover:text-foreground">Audit log</a>
          <a href="#safety" className="hover:text-foreground">Safety</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/app">Open dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
