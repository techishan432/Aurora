import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'positive' | 'warning' | 'negative' | 'info';

const toneClass: Record<BadgeTone, string> = {
  neutral: '',
  positive: 'badge-positive',
  warning: 'badge-warning',
  negative: 'badge-negative',
  info: 'badge-info',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  const classes = ['badge', toneClass[tone], className ?? ''].filter(Boolean).join(' ');
  return <span className={classes}>{children}</span>;
}
