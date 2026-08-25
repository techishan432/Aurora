import Link from 'next/link';
import { GlassCard } from './components/glass-card';
import { IconCompass } from './components/icons';

export default function NotFound() {
  return (
    <main className="shell">
      <div className="shell-content center-wrap">
        <GlassCard className="empty-state empty-state--narrow">
          <span className="empty-state-icon">
            <IconCompass size={36} />
          </span>
          <p className="empty-state-title">This page drifted off the map</p>
          <p className="empty-state-copy">
            The route you followed does not exist. Head back to Aurora to open sessions and verify attendance.
          </p>
          <Link href="/" className="btn btn-primary link-unstyled">
            Back to Aurora
          </Link>
        </GlassCard>
      </div>
    </main>
  );
}
