'use client';

import { Button } from './components/button';
import { GlassCard } from './components/glass-card';
import { IconAlertTriangle } from './components/icons';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="shell">
      <div className="shell-content">
        <GlassCard className="empty-state">
          <span className="empty-state-icon">
            <IconAlertTriangle size={36} />
          </span>
          <p className="empty-state-title">Something interrupted the session</p>
          <p className="empty-state-copy">
            An unexpected error occurred while rendering this view. Your wallet and session state are unaffected — try
            again.
          </p>
          {error.digest && <p className="stat-note">Reference: {error.digest}</p>}
          <Button onClick={reset}>Try again</Button>
        </GlassCard>
      </div>
    </main>
  );
}
