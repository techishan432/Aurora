import type { HTMLAttributes } from 'react';

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  elevated?: boolean;
  flush?: boolean;
};

export function GlassCard({ elevated = false, flush = false, className, children, ...rest }: GlassCardProps) {
  const classes = ['glass', elevated ? 'glass--elevated' : '', flush ? 'glass--flush' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
