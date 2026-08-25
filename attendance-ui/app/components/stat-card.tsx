import type { ReactNode } from 'react';
import { GlassCard } from './glass-card';
import { Skeleton } from './skeleton';

type StatCardProps = {
  label: string;
  value: ReactNode;
  note?: string;
  positive?: boolean;
  loading?: boolean;
};

export function StatCard({ label, value, note, positive = false, loading = false }: StatCardProps) {
  return (
    <GlassCard className="stat-card">
      <span className="stat-label t-label-sm">{label}</span>
      {loading ? (
        <Skeleton width={72} height={32} />
      ) : (
        <span className={`stat-value${positive ? ' stat-value--positive' : ''}`}>{value}</span>
      )}
      {note && <span className="stat-note">{note}</span>}
    </GlassCard>
  );
}
