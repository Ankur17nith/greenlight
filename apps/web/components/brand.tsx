/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils';

/** The full logo. Swaps with the theme: paper logo in light, night logo in dark. */
export function Logo({ className, height = 28 }: { className?: string; height?: number }) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <img src="/logo.svg" alt="Greenlight" height={height} style={{ height }} className="block dark:hidden" />
      <img src="/logo-dark.svg" alt="Greenlight" height={height} style={{ height }} className="hidden dark:block" />
    </span>
  );
}

/** Just the two-lens mark. */
export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <img src="/logo-mark.svg" alt="" aria-hidden width={size} height={size} className="block dark:hidden" />
      <img src="/logo-mark-dark.svg" alt="" aria-hidden width={size} height={size} className="hidden dark:block" />
    </span>
  );
}
