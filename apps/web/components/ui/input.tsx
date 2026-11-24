import * as React from 'react';
import { cn } from '@/lib/utils';

const field =
  'w-full rounded-md border border-border bg-input px-3 text-sm placeholder:text-muted-foreground focus-visible:border-ring disabled:opacity-50';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, 'h-10', className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(field, 'min-h-20 py-2', className)} {...props} />;
}
