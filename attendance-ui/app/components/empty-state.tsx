import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  copy?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, copy, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <span className="empty-state-icon">{icon}</span>}
      <p className="empty-state-title">{title}</p>
      {copy && <p className="empty-state-copy">{copy}</p>}
      {action}
    </div>
  );
}
