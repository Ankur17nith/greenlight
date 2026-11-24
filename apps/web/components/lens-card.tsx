import { cn } from '@/lib/utils';

export interface LensProps {
  header: string; // [REFUND · TG]
  badge: string; // ✓ WITHIN POLICY
  headline: string; // max 42 chars
  verdict: string; // AI: ...
  footer: string; // [TAP: Approve] ...
  position?: string; // 1/3
  className?: string;
}

/**
 * A preview of the G2 display: 576 x 288, monochrome green, four fixed text
 * rows. It is a picture of the layout in docs/G2_UI.md, not the real SDK output.
 */
export function LensCard({ header, badge, headline, verdict, footer, position, className }: LensProps) {
  return (
    <div
      role="img"
      aria-label={`G2 display preview: ${header} ${badge}. ${headline}. ${verdict}. ${footer}`}
      className={cn('lens relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-[#14301f] p-4 sm:p-6', className)}
    >
      <div className="flex h-full flex-col justify-between text-[10px] leading-tight sm:text-sm">
        <div className="flex items-start justify-between gap-2 opacity-80">
          <span>{header}</span>
          <span>{badge}</span>
        </div>
        <div className="text-[13px] font-semibold leading-snug sm:text-xl">{headline}</div>
        <div className="opacity-90">{verdict}</div>
        <div className="flex items-end justify-between gap-2 border-t border-[#14301f] pt-2 opacity-80">
          <span>{footer}</span>
          {position ? <span>{position}</span> : null}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_2px,rgb(0_0_0/0.18)_3px)]" />
    </div>
  );
}
