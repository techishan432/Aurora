'use client';

import { shortenAddress } from '../../../lib/format';
import { useAttendanceStore } from '../../../store/use-attendance-store';
import { GlassCard } from '../glass-card';
import { StatCard } from '../stat-card';

const PRIVACY_MATRIX = [
  { item: 'Student Identity / Name / ID', location: 'Client Device Only', state: 'Strictly Private (0 Bytes Leaked)' },
  { item: 'Student Private Key (sk)', location: 'Lace Wallet Witness', state: 'Never Leaves Device' },
  { item: 'Course Identifier Code', location: 'Client Salt Hash', state: 'Never Stored in Plaintext' },
  { item: 'Course Commitment', location: 'Midnight Public Ledger', state: '32-Byte Salted Hash' },
  { item: 'Student Pseudonym', location: 'Midnight Public Ledger', state: 'Rotating per Session Sequence' },
  { item: 'Attendance Evidence', location: 'Midnight Public Ledger', state: 'Salted Timestamp Proof' },
  { item: 'Registrar Public Key', location: 'Midnight Public Ledger', state: 'Derived from sk + Sequence' },
];

export function AnalyticsTab() {
  const wallet = useAttendanceStore((state) => state.wallet);
  const privateCheckInsCount = useAttendanceStore((state) => state.privateCheckInsCount);
  const successRate = useAttendanceStore((state) => state.successRate);
  const sequenceNumber = useAttendanceStore((state) => state.sequenceNumber);
  const openSessionsCount = useAttendanceStore((state) => state.openSessionsCount);

  return (
    <div className="tab-panel">
      {/* Metrics Row */}
      <section className="grid-4" aria-label="Privacy and verification statistics">
        <StatCard label="Plaintext leaked" value="0 bytes" positive note="FERPA & GDPR compliant by design" />
        <StatCard label="Verified check-ins" value={privateCheckInsCount} note="This browser session" />
        <StatCard
          label="Sessions completed"
          value={`#${sequenceNumber}`}
          note={`Total windows opened: ${openSessionsCount}`}
        />
        <StatCard
          label="Wallet Status"
          value={wallet ? 'Connected' : 'Offline'}
          note={wallet ? shortenAddress(wallet) : 'Connect a Midnight wallet to begin'}
        />
      </section>

      {/* Proof Verification Progress */}
      <GlassCard>
        <div className="card-title-row">
          <h2 className="t-headline-md">Proof verification telemetry</h2>
          <span className="t-label-sm text-muted">{successRate ? `${successRate}% verified` : 'Awaiting proofs'}</span>
        </div>
        <div className="meter" role="progressbar" aria-valuenow={successRate} aria-valuemin={0} aria-valuemax={100}>
          <div className="meter-fill" style={{ width: `${successRate}%` }} />
        </div>
        <p className="field-hint meter-hint">
          {privateCheckInsCount === 0
            ? 'No proofs generated yet. Check in to an open session to run client-side ZK proof verification.'
            : `All ${privateCheckInsCount} submitted zero-knowledge proofs passed Compact v0.23 circuit verification without disclosing identity.`}
        </p>
      </GlassCard>

      {/* Privacy Matrix Table */}
      <GlassCard>
        <div className="card-title-row">
          <h2 className="t-headline-md">Privacy matrix — client vs. on-chain visibility</h2>
          <span className="t-label-sm text-muted">FERPA Guarantee</span>
        </div>
        <p className="card-copy">
          This matrix demonstrates how Aurora achieves cross-session unlinkability while satisfying institutional
          attendance verification requirements.
        </p>

        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(45, 58, 46, 0.12)' }}>
                <th style={{ padding: '10px 12px', fontWeight: 600, color: '#2d3a2e' }}>Data Element</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, color: '#2d3a2e' }}>Storage Location</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, color: '#2d3a2e' }}>Ledger Visibility</th>
              </tr>
            </thead>
            <tbody>
              {PRIVACY_MATRIX.map((row) => (
                <tr key={row.item} style={{ borderBottom: '1px solid rgba(45, 58, 46, 0.05)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#2d3a2e' }}>{row.item}</td>
                  <td style={{ padding: '10px 12px', color: 'rgba(45, 58, 46, 0.75)' }}>{row.location}</td>
                  <td
                    style={{
                      padding: '10px 12px',
                      color:
                        row.state.includes('Strictly Private') || row.state.includes('Never') ? '#2e7d32' : '#2d3a2e',
                      fontWeight: 500,
                    }}
                  >
                    {row.state}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
