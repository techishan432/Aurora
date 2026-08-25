'use client';

import { useAttendanceStore, type TransactionStatus } from '../../../store/use-attendance-store';
import { Badge, type BadgeTone } from '../badge';
import { EmptyState } from '../empty-state';
import { GlassCard } from '../glass-card';
import { IconActivity } from '../icons';

const statusTone: Record<TransactionStatus, BadgeTone> = {
  pending: 'warning',
  processing: 'info',
  confirmed: 'positive',
  failed: 'negative',
};

const statusLabel: Record<TransactionStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  confirmed: 'Confirmed',
  failed: 'Failed',
};

export function ActivityTab() {
  const activities = useAttendanceStore((state) => state.activities);

  return (
    <div className="tab-panel">
      <GlassCard>
        <div className="card-title-row">
          <h2 className="t-headline-md">On-chain audit feed</h2>
          <span className="t-label-sm live-label">
            <span className="live-dot" aria-hidden="true" />
            Live Preprod stream
          </span>
        </div>
        <p className="card-copy">Real-time transaction history broadcasted to the Midnight Network preprod testnet.</p>

        {activities.length === 0 ? (
          <EmptyState
            icon={<IconActivity size={32} />}
            title="No on-chain activity yet"
            copy="Open an attendance session or submit a check-in to broadcast your first transaction to the Midnight ledger."
          />
        ) : (
          <div className="row-stack" style={{ marginTop: '0.75rem' }}>
            {activities.map((activity) => (
              <div className="list-row" key={activity.id}>
                <div className="list-row-main">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="list-row-title">{activity.action}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor:
                          activity.role === 'Instructor'
                            ? 'rgba(45, 58, 46, 0.1)'
                            : activity.role === 'Student'
                              ? 'rgba(46, 125, 50, 0.1)'
                              : 'rgba(29, 78, 216, 0.1)',
                        color:
                          activity.role === 'Instructor'
                            ? '#2d3a2e'
                            : activity.role === 'Student'
                              ? '#2e7d32'
                              : '#1d4ed8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {activity.role}
                    </span>
                  </div>
                  {activity.details && (
                    <span style={{ fontSize: '12px', color: 'rgba(45, 58, 46, 0.65)' }}>{activity.details}</span>
                  )}
                  <span className="list-row-sub">
                    {activity.hash && <span className="activity-hash">{activity.hash}</span>}
                    {activity.hash && <span aria-hidden="true"> · </span>}
                    <span className="activity-time">{new Date(activity.at).toLocaleTimeString()}</span>
                  </span>
                </div>
                <Badge tone={statusTone[activity.status]}>{statusLabel[activity.status]}</Badge>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
