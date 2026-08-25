'use client';

import { useAttendanceStore } from '../../../store/use-attendance-store';
import type { TabId } from '../../types';
import { Badge } from '../badge';
import { Button } from '../button';
import { EmptyState } from '../empty-state';
import { GlassCard } from '../glass-card';
import { IconLock, IconRadio, IconRefresh, IconShieldCheck } from '../icons';
import { ManualGuide } from '../manual-guide';
import { StatCard } from '../stat-card';

type HomeTabProps = {
  onOpenSession: () => void;
  onCheckIn: () => void;
  onNavigate: (tab: TabId) => void;
};

export function HomeTab({ onOpenSession, onCheckIn }: HomeTabProps) {
  const sessionState = useAttendanceStore((state) => state.sessionState);
  const courseCode = useAttendanceStore((state) => state.courseCode);
  const wallet = useAttendanceStore((state) => state.wallet);
  const walletName = useAttendanceStore((state) => state.walletName);
  const privateCheckInsCount = useAttendanceStore((state) => state.privateCheckInsCount);
  const successRate = useAttendanceStore((state) => state.successRate);
  const sequenceNumber = useAttendanceStore((state) => state.sequenceNumber);
  const closeSession = useAttendanceStore((state) => state.closeSession);

  const isOpen = sessionState === 'OPEN';

  return (
    <div className="tab-panel">
      {/* Session Statistics Grid */}
      <section className="grid-4" aria-label="Session statistics">
        <StatCard
          label="Session status"
          value={isOpen ? 'Open' : 'Closed'}
          positive={isOpen}
          note={isOpen ? courseCode : 'No active window'}
        />
        <StatCard label="Private check-ins" value={privateCheckInsCount} note="This session" />
        <StatCard label="Proof accuracy" value={successRate ? `${successRate}%` : '—'} note="Verified ZK proofs" />
        <StatCard label="Ledger sequence" value={`#${sequenceNumber}`} note="Rotates on every close" />
      </section>

      {/* Privacy Guarantee & Current Session Card */}
      <section className="grid-2">
        <GlassCard>
          <h2 className="t-headline-md card-title-row">The privacy guarantee</h2>
          <div className="row-stack">
            <div className="feature-row">
              <span className="feature-icon">
                <IconShieldCheck />
              </span>
              <div>
                <p className="feature-title">Nothing personal on-chain</p>
                <p className="feature-copy">
                  Course codes and student IDs are hashed on-device. The ledger stores only salted 32-byte commitments.
                </p>
              </div>
            </div>
            <div className="feature-row">
              <span className="feature-icon">
                <IconRefresh />
              </span>
              <div>
                <p className="feature-title">Rotating pseudonyms</p>
                <p className="feature-copy">
                  Every session derives a fresh pseudonym, so check-ins can never be linked across sessions.
                </p>
              </div>
            </div>
            <div className="feature-row">
              <span className="feature-icon">
                <IconLock />
              </span>
              <div>
                <p className="feature-title">Keys stay local</p>
                <p className="feature-copy">
                  Your private witness never leaves the wallet. Proofs are generated — never shared.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="card-title-row">
            <h2 className="t-headline-md">Current session</h2>
            <Badge tone={isOpen ? 'positive' : 'neutral'}>{isOpen ? 'Open now' : 'Closed'}</Badge>
          </div>

          {isOpen ? (
            <div className="row-stack">
              <p className="t-label-sm text-muted">Current course</p>
              <p className="session-display">{courseCode}</p>
              <p className="t-body-md text-muted session-wallet-row">
                {wallet ? (
                  <>
                    Connected wallet: <code>{walletName ?? 'Midnight Wallet'}</code>
                  </>
                ) : (
                  'No wallet connected yet.'
                )}
              </p>
              <div className="hero-actions">
                <Button onClick={onCheckIn}>Check in</Button>
                <Button variant="danger" onClick={closeSession}>
                  Close window
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<IconRadio size={32} />}
              title="No session open"
              copy="Open an attendance window to start accepting private check-ins from your cohort."
              action={
                <Button variant="ghost" onClick={onOpenSession}>
                  Open attendance window
                </Button>
              }
            />
          )}
        </GlassCard>
      </section>

      {/* How Aurora Works */}
      <GlassCard>
        <h2 className="t-headline-md card-title-row">How Aurora works</h2>
        <div className="step-list">
          <div className="step-item">
            <span className="step-number">1</span>
            <p className="step-title">Open a window</p>
            <p className="step-copy">The instructor publishes a salted course commitment to the Midnight ledger.</p>
          </div>
          <div className="step-item">
            <span className="step-number">2</span>
            <p className="step-title">Check in privately</p>
            <p className="step-copy">
              Each student submits a zero-knowledge proof from their wallet — identity stays local.
            </p>
          </div>
          <div className="step-item">
            <span className="step-number">3</span>
            <p className="step-title">Close and rotate</p>
            <p className="step-copy">
              Closing the session advances the sequence, unlinking the cohort from future sessions.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* User Manual */}
      <ManualGuide isOpen={isOpen} onOpenSession={onOpenSession} onCheckIn={onCheckIn} />
    </div>
  );
}
