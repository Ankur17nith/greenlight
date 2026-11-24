import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      outline: 'border-border text-muted-foreground',
      go: 'border-go/30 bg-go-soft text-go',
      stop: 'border-stop/30 bg-stop-soft text-stop',
      hold: 'border-hold/30 bg-hold-soft text-hold',
    },
  },
  defaultVariants: { variant: 'outline' },
});

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
