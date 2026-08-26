'use client';

import React, { useEffect, useState } from 'react';
import { shortenAddress } from '../../../lib/format';
import { config } from '../../../lib/config';
import { useAttendanceStore, type TransactionStatus } from '../../../store/use-attendance-store';
import { Badge, type BadgeTone } from '../badge';
import { Button } from '../button';
import { Field } from '../field';
import { GlassCard } from '../glass-card';
import { IconCopy, IconRadio, IconShieldCheck } from '../icons';
import { StatCard } from '../stat-card';

const PRESET_COURSES = [
  'CS-401 · Distributed Systems & ZK',
  'BIO-204 · Computational Genomics',
  'MATH-301 · Applied Cryptography',
  'AI-502 · Privacy-Preserving ML',
];

const PRIVACY_MATRIX = [
  { item: 'Student Identity / Name / ID', location: 'Client Device Only', state: 'Strictly Private (0 Bytes Leaked)' },
  { item: 'Student Private Key (sk)', location: '1AM Wallet Witness', state: 'Never Leaves Device' },
  { item: 'Course Identifier Code', location: 'Client Salt Hash', state: 'Never Stored in Plaintext' },
  { item: 'Course Commitment', location: 'Midnight Public Ledger', state: '32-Byte Salted Hash' },
  { item: 'Student Pseudonym', location: 'Midnight Public Ledger', state: 'Rotating per Session Sequence' },
  { item: 'Anti-Replay Nullifier', location: 'Midnight Public Ledger', state: 'Single Check-in Proof per Session' },
  { item: 'Attendance Evidence', location: 'Midnight Public Ledger', state: 'Salted Timestamp Proof' },
  { item: 'Registrar Public Key', location: 'Midnight Public Ledger', state: 'Derived from sk + Sequence' },
];

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

type DashboardTabProps = {
  courseCodeInput: string;
  onCourseCodeChange: (value: string) => void;
  studentIdInput: string;
  onStudentIdChange: (value: string) => void;
};

export function DashboardTab({
  courseCodeInput,
  onCourseCodeChange,
  studentIdInput,
  onStudentIdChange,
}: DashboardTabProps) {
  const wallet = useAttendanceStore((state) => state.wallet);
  const walletName = useAttendanceStore((state) => state.walletName);
  const isConnecting = useAttendanceStore((state) => state.isConnecting);
  const sessionState = useAttendanceStore((state) => state.sessionState);
  const courseCode = useAttendanceStore((state) => state.courseCode);
  const sessionStartTime = useAttendanceStore((state) => state.sessionStartTime);
  const cohortCapacity = useAttendanceStore((state) => state.cohortCapacity);
  const studentPseudonym = useAttendanceStore((state) => state.studentPseudonym);
  const courseCommitment = useAttendanceStore((state) => state.courseCommitment);
  const nullifierCommitment = useAttendanceStore((state) => state.nullifierCommitment);
  const registrarKey = useAttendanceStore((state) => state.registrarKey);
  const sequenceNumber = useAttendanceStore((state) => state.sequenceNumber);
  const attendanceCount = useAttendanceStore((state) => state.attendanceCount);
  const privateCheckInsCount = useAttendanceStore((state) => state.privateCheckInsCount);
  const currentBlock = useAttendanceStore((state) => state.currentBlock);
  const isProving = useAttendanceStore((state) => state.isProving);
  const zkStep = useAttendanceStore((state) => state.zkStep);
  const verifiedStudents = useAttendanceStore((state) => state.verifiedStudents);
  const activities = useAttendanceStore((state) => state.activities);
  const connect = useAttendanceStore((state) => state.connect);
  const disconnect = useAttendanceStore((state) => state.disconnect);
  const openSession = useAttendanceStore((state) => state.openSession);
  const closeSession = useAttendanceStore((state) => state.closeSession);
  const submitCheckIn = useAttendanceStore((state) => state.submitCheckIn);
  const notify = useAttendanceStore((state) => state.notify);

  const isOpen = sessionState === 'OPEN';

  // Live timer for active session
  const [elapsedSec, setElapsedSec] = useState<number>(0);

  useEffect(() => {
    if (!isOpen || !sessionStartTime) {
      setElapsedSec(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, sessionStartTime]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const copyValue = (val: string, label: string) => {
    if (!val) return;
    void navigator.clipboard
      .writeText(val)
      .then(() => notify('success', `${label} copied to clipboard.`))
      .catch(() => notify('error', 'Clipboard unavailable in this browser.'));
  };

  const handleOpen = (e: React.FormEvent) => {
    e.preventDefault();
    openSession(courseCodeInput || PRESET_COURSES[0]);
  };

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    void submitCheckIn(studentIdInput || 'STU-94021', courseCodeInput || courseCode || PRESET_COURSES[0]);
  };

  const attendancePercentage = Math.min(100, Math.round((attendanceCount / cohortCapacity) * 100));

  return (
    <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ========================================================================= */}
      {/* SECTION 1: Session Lifecycle & Real-Time Cohort Analytics                */}
      {/* ========================================================================= */}
      <section aria-label="Session Lifecycle Analytics">
        <div
          style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <h2 className="t-headline-sm" style={{ fontWeight: 600, color: '#2d3a2e' }}>
            1. Session Lifecycle &amp; Cohort Analytics
          </h2>
          <span className="t-label-sm live-label">
            <span className="live-dot" aria-hidden="true" />
            Live Reactive State
          </span>
        </div>
        <div className="grid-4">
          <StatCard
            label="Session Status"
            value={isOpen ? `OPEN (${formatElapsed(elapsedSec)})` : 'CLOSED'}
            positive={isOpen}
            note={isOpen ? courseCode : 'No active window'}
          />
          <StatCard
            label="Cohort Attendance"
            value={`${attendanceCount} / ${cohortCapacity}`}
            positive={attendanceCount > 0}
            note={`${attendancePercentage}% of enrolled cohort`}
          />
          <StatCard
            label="Total Verified Check-Ins"
            value={privateCheckInsCount}
            note="Across all sessions on Midnight"
          />
          <StatCard label="Ledger Sequence Epoch" value={`#${sequenceNumber}`} note="Rotates pseudonyms per session" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: Cryptographic Privacy & FERPA Compliance Telemetry            */}
      {/* ========================================================================= */}
      <section aria-label="Zero-Knowledge Privacy Telemetry">
        <div
          style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <h2 className="t-headline-sm" style={{ fontWeight: 600, color: '#2d3a2e' }}>
            2. Zero-Knowledge Privacy &amp; Compliance Telemetry
          </h2>
          <span className="t-label-sm text-muted">FERPA &amp; GDPR Standard</span>
        </div>
        <div className="grid-4">
          <StatCard label="Plaintext Leaked" value="0 bytes" positive note="Strictly client-side witness only" />
          <StatCard label="Anonymity Entropy" value="256 bits" note="SHA-256 / Compact Field" />
          <StatCard label="Cross-Session Unlinkability" value="100%" positive note="Guaranteed via sequence salt" />
          <StatCard label="Anti-Replay Nullifier" value="Active" positive note="Single check-in per session" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: Interactive Multi-Role ZK Attendance Studio                    */}
      {/* ========================================================================= */}
      <section aria-label="Interactive Multi-Role ZK Studio">
        <div
          style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <h2 className="t-headline-sm" style={{ fontWeight: 600, color: '#2d3a2e' }}>
            3. Interactive Multi-Role ZK Attendance Studio
          </h2>
          <Badge tone={isOpen ? 'positive' : 'neutral'}>{isOpen ? 'Window Active' : 'Window Closed'}</Badge>
        </div>
        <div className="grid-2">
          {/* Role 1: Instructor / Session Manager */}
          <GlassCard>
            <div className="card-title-row">
              <h3 className="t-headline-md">Instructor · Session manager</h3>
              <Badge tone={isOpen ? 'positive' : 'neutral'}>{sessionState}</Badge>
            </div>
            <p className="card-copy">
              Publish a salted 32-byte course commitment to open an attendance window. Plaintext course identifiers
              never reach the ledger.
            </p>

            {isOpen ? (
              <div className="row-stack">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="t-label-sm text-muted">Active Window</p>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#2e7d32' }}>
                    Elapsed: {formatElapsed(elapsedSec)}
                  </span>
                </div>
                <p className="session-display">{courseCode}</p>
                <p className="field-hint" style={{ marginTop: '0.5rem' }}>
                  Students can check in with zero-knowledge proofs until you close this window.
                </p>
                <div className="hero-actions" style={{ marginTop: '1.25rem' }}>
                  <Button variant="danger" onClick={closeSession}>
                    Close Session &amp; Rotate Sequence
                  </Button>
                </div>
              </div>
            ) : (
              <form className="modal-form" onSubmit={handleOpen}>
                <Field
                  id="dashboard-course-code"
                  label="Course Code"
                  placeholder="e.g. CS-401 · Distributed Systems & ZK"
                  value={courseCodeInput}
                  onChange={(e) => onCourseCodeChange(e.target.value)}
                  autoComplete="off"
                />

                {/* Quick Presets */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                  {PRESET_COURSES.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onCourseCodeChange(preset)}
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        border: '1px solid rgba(45, 58, 46, 0.12)',
                        background: courseCodeInput === preset ? '#2d3a2e' : 'rgba(255,255,255,0.7)',
                        color: courseCodeInput === preset ? '#ffffff' : '#2d3a2e',
                        cursor: 'pointer',
                      }}
                    >
                      {preset.split('·')[0]}
                    </button>
                  ))}
                </div>

                <Button type="submit" disabled={!courseCodeInput.trim()}>
                  <IconRadio size={15} />
                  Open Attendance Window
                </Button>
              </form>
            )}
          </GlassCard>

          {/* Role 2: Student / Private Check-In */}
          <GlassCard>
            <div className="card-title-row">
              <h3 className="t-headline-md">Student · Private check-in</h3>
              <Badge tone={isOpen ? 'positive' : 'warning'}>{isOpen ? 'Ready' : 'Session Closed'}</Badge>
            </div>
            <p className="card-copy">
              Your student ID is hashed on-device with your private witness. The public ledger receives only a ZK proof,
              nullifier, and rotating pseudonym.
            </p>

            <form className="modal-form" onSubmit={handleCheckIn}>
              <Field
                id="dashboard-student-id"
                label="Student ID"
                placeholder="e.g. STU-94021"
                hint="Hashed locally on this device — never transmitted in plaintext."
                value={studentIdInput}
                onChange={(e) => onStudentIdChange(e.target.value)}
                autoComplete="off"
              />

              {/* Rotating Pseudonym Display */}
              <div className="field">
                <span className="field-label">Your Rotating Pseudonym</span>
                <div className="pseudonym-box">
                  <span className="pseudonym-value">{studentPseudonym || 'Generated upon check-in'}</span>
                  {studentPseudonym && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => copyValue(studentPseudonym, 'Pseudonym')}
                      aria-label="Copy pseudonym"
                    >
                      <IconCopy size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Live ZK Proving Pipeline Progress */}
              {isProving && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(61, 90, 62, 0.06)',
                    border: '1px solid rgba(61, 90, 62, 0.15)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#2d3a2e',
                      marginBottom: '8px',
                    }}
                  >
                    <span>ZK Proof Pipeline</span>
                    <span>Step {zkStep} of 4</span>
                  </div>
                  <div className="meter" style={{ height: '6px' }}>
                    <div className="meter-fill" style={{ width: `${(zkStep / 4) * 100}%` }} />
                  </div>
                  <p style={{ fontSize: '11px', color: '#2d3a2e', marginTop: '6px', opacity: 0.8 }}>
                    {zkStep === 1 && '1. Salting local secret key witness sk...'}
                    {zkStep === 2 && '2. Deriving rotating pseudonym & anti-replay nullifier...'}
                    {zkStep === 3 && '3. Hashing salted attendance evidence...'}
                    {zkStep === 4 && '4. Submitting ZK proof to Midnight preprod...'}
                  </p>
                </div>
              )}

              <Button type="submit" disabled={!isOpen || isProving || !studentIdInput.trim()} loading={isProving}>
                <IconShieldCheck size={15} />
                {isProving ? 'Generating ZK Proof...' : 'Generate Proof & Check In'}
              </Button>
              {!isOpen && <p className="field-hint">Waiting for your instructor to open an attendance session.</p>}
            </form>
          </GlassCard>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: Compact v0.23 On-Chain Ledger State Inspector                 */}
      {/* ========================================================================= */}
      <section aria-label="On-Chain Ledger State">
        <GlassCard>
          <div className="card-title-row">
            <h2 className="t-headline-md">4. On-chain ledger state (Midnight Preprod)</h2>
            <span className="t-label-sm live-label">
              <span className="live-dot" aria-hidden="true" />
              Compact v0.23 Advanced Ledger Slots
            </span>
          </div>
          <p className="card-copy">
            Public contract storage verified by Midnight validator nodes. Notice that only 32-byte salted commitments
            appear on-chain.
          </p>

          <div className="step-list" style={{ marginTop: '1rem' }}>
            <div
              className="step-item"
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(45,58,46,0.06)',
              }}
            >
              <span className="t-label-sm text-muted">state</span>
              <p className="step-title" style={{ fontFamily: 'var(--font-mono)' }}>
                {sessionState}
              </p>
              <p className="step-copy">Public session status</p>
            </div>

            <div
              className="step-item"
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(45,58,46,0.06)',
              }}
            >
              <span className="t-label-sm text-muted">sequence</span>
              <p className="step-title" style={{ fontFamily: 'var(--font-mono)' }}>
                #{sequenceNumber}
              </p>
              <p className="step-copy">Rotates pseudonyms</p>
            </div>

            <div
              className="step-item"
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(45,58,46,0.06)',
              }}
            >
              <span className="t-label-sm text-muted">attendanceCount</span>
              <p className="step-title" style={{ fontFamily: 'var(--font-mono)' }}>
                {attendanceCount}
              </p>
              <p className="step-copy">Verified attendees</p>
            </div>

            <div
              className="step-item"
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(45,58,46,0.06)',
              }}
            >
              <span className="t-label-sm text-muted">courseCommitment</span>
              <p className="step-title mono" style={{ fontSize: '11px', overflowWrap: 'anywhere' }}>
                {courseCommitment.slice(0, 18)}…
              </p>
              <p className="step-copy">Salted course hash</p>
            </div>

            <div
              className="step-item"
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(45,58,46,0.06)',
              }}
            >
              <span className="t-label-sm text-muted">studentCommitment</span>
              <p className="step-title mono" style={{ fontSize: '11px', overflowWrap: 'anywhere' }}>
                {studentPseudonym ? `${studentPseudonym.slice(0, 18)}…` : 'none<Bytes<32>>()'}
              </p>
              <p className="step-copy">Rotating student pseudonym</p>
            </div>

            <div
              className="step-item"
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(45,58,46,0.06)',
              }}
            >
              <span className="t-label-sm text-muted">nullifierCommitment</span>
              <p className="step-title mono" style={{ fontSize: '11px', overflowWrap: 'anywhere' }}>
                {nullifierCommitment.slice(0, 18)}…
              </p>
              <p className="step-copy">Anti-replay nullifier</p>
            </div>

            <div
              className="step-item"
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(45,58,46,0.06)',
              }}
            >
              <span className="t-label-sm text-muted">registrar</span>
              <p className="step-title mono" style={{ fontSize: '11px', overflowWrap: 'anywhere' }}>
                {registrarKey.slice(0, 18)}…
              </p>
              <p className="step-copy">Registrar public key</p>
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <a
              href={
                config.contractAddress && config.contractAddress !== '<YOUR_DEPLOYED_CONTRACT_ADDRESS>'
                  ? `https://${config.network === 'mainnet' ? '' : 'preprod.'}midnightexplorer.com/contracts/0x${config.contractAddress.replace(/^0x/, '')}`
                  : 'https://preprod.midnightexplorer.com/'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
              }}
            >
              Verify On-Chain on Midnight Explorer ↗
            </a>
          </div>
        </GlassCard>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: Verified Student Pseudonym & Anti-Replay Registry             */}
      {/* ========================================================================= */}
      <section aria-label="Verified Student Registry">
        <GlassCard>
          <div className="card-title-row">
            <h2 className="t-headline-md">5. Verified student pseudonym &amp; nullifier registry</h2>
            <Badge tone="positive">{verifiedStudents.length} Verified Records</Badge>
          </div>
          <p className="card-copy">
            On-chain zero-knowledge check-in registry. Notice that names, emails, and student IDs are absent — only
            cryptographically sound pseudonyms and nullifiers exist.
          </p>

          {verifiedStudents.length === 0 ? (
            <div
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                color: 'rgba(45,58,46,0.6)',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '12px',
                marginTop: '1rem',
              }}
            >
              No check-ins recorded in the current session. Submit a student check-in to witness real-time on-chain
              verification.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(45, 58, 46, 0.12)' }}>
                    <th style={{ padding: '8px 10px', fontWeight: 600, color: '#2d3a2e' }}>Rotating Pseudonym</th>
                    <th style={{ padding: '8px 10px', fontWeight: 600, color: '#2d3a2e' }}>Anti-Replay Nullifier</th>
                    <th style={{ padding: '8px 10px', fontWeight: 600, color: '#2d3a2e' }}>Course</th>
                    <th style={{ padding: '8px 10px', fontWeight: 600, color: '#2d3a2e' }}>Epoch</th>
                    <th style={{ padding: '8px 10px', fontWeight: 600, color: '#2d3a2e' }}>Time</th>
                    <th style={{ padding: '8px 10px', fontWeight: 600, color: '#2d3a2e' }}>ZK Status</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedStudents.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid rgba(45, 58, 46, 0.05)' }}>
                      <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: '#2d3a2e' }}>
                        {entry.pseudonym.slice(0, 14)}…
                      </td>
                      <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: '#2e7d32' }}>
                        {entry.nullifier.slice(0, 14)}…
                      </td>
                      <td style={{ padding: '8px 10px', color: '#2d3a2e' }}>{entry.courseCode.split('·')[0]}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>#{entry.sequence}</td>
                      <td style={{ padding: '8px 10px', color: 'rgba(45,58,46,0.7)' }}>
                        {new Date(entry.checkedInAt).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <Badge tone="positive">Verified ZK</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: FERPA Privacy Matrix — Client Witness vs On-Chain Visibility   */}
      {/* ========================================================================= */}
      <section aria-label="Privacy Matrix">
        <GlassCard>
          <div className="card-title-row">
            <h2 className="t-headline-md">6. Privacy matrix — client vs. on-chain visibility</h2>
            <span className="t-label-sm text-muted">FERPA &amp; GDPR Guarantee</span>
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
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: Midnight Preprod Consensus & Runtime Telemetry                */}
      {/* ========================================================================= */}
      <section aria-label="Midnight Consensus & Network Settings">
        <GlassCard>
          <div className="card-title-row">
            <h2 className="t-headline-md">7. Midnight consensus &amp; network runtime</h2>
            <Badge tone={wallet ? 'positive' : 'warning'}>{wallet ? 'Connected' : 'Disconnected'}</Badge>
          </div>
          <p className="card-copy">
            Live validator consensus and cryptographic runtime parameters on the Midnight Network preprod testnet.
          </p>

          <div className="step-list" style={{ marginTop: '1rem' }}>
            <div
              className="step-item"
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(45,58,46,0.06)',
              }}
            >
              <span className="t-label-sm text-muted">Network &amp; Chain ID</span>
              <p className="step-title">Midnight Preprod</p>
              <p className="step-copy mono">Chain: preprod</p>
            </div>

            <div
              className="step-item"
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(45,58,46,0.06)',
              }}
            >
              <span className="t-label-sm text-muted">Block Height</span>
              <p className="step-title mono">#{currentBlock.toLocaleString()}</p>
              <p className="step-copy">Finality: ~2.4s</p>
            </div>

            <div
              className="step-item"
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(45,58,46,0.06)',
              }}
            >
              <span className="t-label-sm text-muted">Shielded Gas Fee</span>
              <p className="step-title mono">0.0014 NIGHT</p>
              <p className="step-copy">Zero DUST required</p>
            </div>

            <div
              className="step-item"
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(45,58,46,0.06)',
              }}
            >
              <span className="t-label-sm text-muted">Connected 1AM Session</span>
              <p className="step-title" style={{ fontSize: '12px' }}>
                {walletName ?? '1AM / Midnight Lace'}
              </p>
              <p className="step-copy mono">{wallet ? shortenAddress(wallet) : 'Not Connected'}</p>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '12px' }}>
            {wallet ? (
              <Button variant="ghost" onClick={disconnect}>
                Disconnect Wallet
              </Button>
            ) : (
              <Button onClick={() => void connect()} loading={isConnecting}>
                Connect 1AM Wallet
              </Button>
            )}
          </div>
        </GlassCard>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: Real-Time On-Chain Audit & Transaction Stream                 */}
      {/* ========================================================================= */}
      <section aria-label="Live Transaction Stream">
        <GlassCard>
          <div className="card-title-row">
            <h2 className="t-headline-md">8. Live on-chain transaction &amp; audit stream</h2>
            <span className="t-label-sm live-label">
              <span className="live-dot" aria-hidden="true" />
              Midnight Preprod Feed
            </span>
          </div>
          <p className="card-copy">
            Real-time transaction history broadcasted to the Midnight Network preprod testnet.
          </p>

          <div className="row-stack" style={{ marginTop: '0.75rem' }}>
            {activities.slice(0, 8).map((activity) => (
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
        </GlassCard>
      </section>
    </div>
  );
}
