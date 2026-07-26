'use client';

import React, { useState, useEffect } from 'react';
import { config } from '../lib/config';
import { useAttendanceStore } from '../store/use-attendance-store';

const shortenAddress = (address: string) =>
  address.length > 22 ? `${address.slice(0, 12)}…${address.slice(-8)}` : address;

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'analytics' | 'activity' | 'settings'>('home');
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  // Form states
  const [inputCourseCode, setInputCourseCode] = useState('');
  const [inputStudentId, setInputStudentId] = useState('');

  const {
    wallet,
    walletName,
    isConnecting,
    isSyncing,
    walletError,
    sessionState,
    courseCode,
    studentPseudonym,
    openSessionsCount,
    privateCheckInsCount,
    successRate,
    sequenceNumber,
    activities,
    connect,
    disconnect,
    clearWalletError,
    openSession,
    closeSession,
    submitCheckIn,
  } = useAttendanceStore();

  // Auto-connect on page load
  useEffect(() => {
    if (!wallet && !isConnecting && !walletError) {
      void connect();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-retry wallet connection if it fails due to syncing
  useEffect(() => {
    if (wallet || isConnecting || isSyncing) return;
    if (!walletError || !walletError.toLowerCase().includes('sync')) return;
    const timer = setTimeout(() => void connect(), 5000);
    return () => clearTimeout(timer);
  }, [wallet, isConnecting, isSyncing, walletError, connect]);

  const handleOpenSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openSession(inputCourseCode);
    setShowOpenModal(false);
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCheckIn(inputStudentId, inputCourseCode);
    setShowCheckInModal(false);
  };

  return (
    <main>
      {/* Top Bar Navigation */}
      <nav className="top-nav">
        <div className="brand-section">
          <div className="brand-icon">
            <span>ZK</span>
          </div>
          <div className="brand-titles">
            <div className="eyebrow">
              <span className="status-dot"></span> MIDNIGHT NETWORK • PREPROD
            </div>
            <h1>Private Student Attendance</h1>
          </div>
        </div>

        <div className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity Audit
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        <div className="wallet-control">
          {wallet ? (
            <button className="btn-secondary wallet-button" onClick={disconnect} title={`Disconnect ${wallet}`}>
              <span className="wallet-status-dot" aria-hidden="true" />
              <span className="wallet-label">{walletName ?? 'Wallet'}</span>
              <span className="wallet-address">{shortenAddress(wallet)}</span>
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => void connect()}
              disabled={isConnecting || isSyncing}
              style={{ minWidth: '160px' }}
            >
              <span>
                {isSyncing
                  ? '⏳ Syncing wallet…'
                  : isConnecting
                    ? 'Connecting…'
                    : walletError?.toLowerCase().includes('sync')
                      ? 'Retrying in 5s…'
                      : 'Connect Wallet'}
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Deployment Banner alert if unconfigured */}
      {!config.isConfigured && (
        <div className="aside-banner deployment-banner">
          <span>⚠️</span>
          <div>
            <strong>Contract not deployed yet.</strong> Run{' '}
            <code>npm run preprod-remote --workspace=@midnight-ntwrk/attendance-cli</code> to deploy, then set{' '}
            <code>NEXT_PUBLIC_CONTRACT_ADDRESS</code> in <code>attendance-ui/.env.local</code>.
          </div>
        </div>
      )}

      {walletError && (
        <div className="aside-banner" role="alert">
          <span>⚠️</span>
          <div className="notice-message">{walletError}</div>
          <button className="notice-dismiss" type="button" onClick={clearWalletError} aria-label="Dismiss notice">×</button>
        </div>
      )}

      {/* HOME TAB */}
      {activeTab === 'home' && (
        <div className="tab-content">
          <section className="hero-banner">
            <div className="hero-content">
              <div className="eyebrow" style={{ marginBottom: '8px' }}>
                ZERO-KNOWLEDGE ATTENDANCE VERIFICATION
              </div>
              <h2>Verifiable Student Check-Ins with Zero Plaintext Leakage</h2>
              <p>
                Empower educational institutions with privacy-first attendance on the Midnight ledger. Instructors open cryptographically sealed sessions; students prove presence without disclosing identities, real names, or student IDs on-chain.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (sessionState === 'OPEN') {
                      setShowCheckInModal(true);
                    } else {
                      setShowOpenModal(true);
                    }
                  }}
                >
                  {sessionState === 'OPEN' ? 'Submit ZK Check-In' : 'Open Attendance Session'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setActiveTab('dashboard')}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </section>

          {/* Stats Bar */}
          <section className="stats">
            <div className="stat-card">
              <div className="stat-label">Session Status</div>
              <div className="stat-val" style={{ color: sessionState === 'OPEN' ? '#10b981' : '#64748b', fontSize: '1.5rem' }}>
                {sessionState === 'OPEN' ? '● OPEN NOW' : 'CLOSED'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Private Check-Ins</div>
              <div className="stat-val">{privateCheckInsCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">ZK Proof Accuracy</div>
              <div className="stat-val">{successRate ? `${successRate}%` : '—'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ledger Sequence</div>
              <div className="stat-val">#{sequenceNumber}</div>
            </div>
          </section>

          {/* Architecture / Guarantee Cards */}
          <section className="grid-2">
            <article className="panel">
              <h3 style={{ marginTop: 0, fontSize: '1.25rem' }}>🛡️ Zero-Knowledge Guarantee</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                The Compact smart contract uses Midnight's private witness architecture to guarantee complete student privacy:
              </p>
              <ul style={{ paddingLeft: '20px', color: '#334155', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li><strong>Public Ledger:</strong> Salted course commitments, rotating pseudonyms, and timestamp sequence counters.</li>
                <li><strong>Private Wallet Witness:</strong> Private keys, student identity numbers, course rosters, and salted evidence.</li>
                <li><strong>Unlinkable Pseudonyms:</strong> Every check-in uses a sequence-derived hash function preventing cross-session tracking.</li>
              </ul>
            </article>

            <article className="panel">
              <h3 style={{ marginTop: 0, fontSize: '1.25rem' }}>⚡ Active Session Overview</h3>
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '14px', border: '1px solid #a7f3d0', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600 }}>CURRENT COURSE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', marginTop: '4px' }}>
                  {courseCode || 'No active session'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#059669', marginTop: '8px' }}>
                  {wallet ? <>Connected wallet: <code>{walletName ?? 'Midnight wallet'}</code></> : 'No wallet connected'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {sessionState === 'CLOSED' ? (
                  <button className="btn-primary" onClick={() => setShowOpenModal(true)} style={{ width: '100%' }}>
                    Start New Session
                  </button>
                ) : (
                  <>
                    <button className="btn-primary" onClick={() => setShowCheckInModal(true)} style={{ flex: 1 }}>
                      Check-In
                    </button>
                    <button className="btn-secondary" onClick={() => closeSession()} style={{ flex: 1 }}>
                      Close Window
                    </button>
                  </>
                )}
              </div>
            </article>
          </section>
        </div>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="tab-content">
          <section className="grid-2">
            {/* Instructor Panel */}
            <article className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Instructor Session Manager</h3>
                <span className={`badge-status ${sessionState === 'OPEN' ? 'badge-confirmed' : 'badge-pending'}`}>
                  {sessionState}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Open an attendance window for a course module. A salted 32-byte course commitment will be published to the ledger.
              </p>
              <div className="form-group">
                <label>Target Course Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={inputCourseCode}
                  onChange={(e) => setInputCourseCode(e.target.value)}
                  placeholder="e.g. CS401-ZK-ATTENDANCE"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                {sessionState === 'CLOSED' ? (
                  <button className="btn-primary" onClick={() => openSession(inputCourseCode)}>
                    Open Attendance Session
                  </button>
                ) : (
                  <button className="btn-secondary" onClick={() => closeSession()}>
                    Close Active Session
                  </button>
                )}
              </div>
            </article>

            {/* Student Panel */}
            <article className="panel">
              <h3 style={{ margin: '0 0 16px 0' }}>Student Private Check-In</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Submit a zero-knowledge proof verifying course registration and attendance evidence.
              </p>

              <div className="form-group">
                <label>Student Identity Code (Kept Private in Wallet)</label>
                <input
                  type="text"
                  className="form-control"
                  value={inputStudentId}
                  onChange={(e) => setInputStudentId(e.target.value)}
                  placeholder="e.g. STU-94021"
                />
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>Generated Pseudonym: </span>
                <code style={{ color: '#10b981', fontWeight: 600 }}>{studentPseudonym || 'Unavailable until a real check-in is submitted'}</code>
              </div>

              <button
                className="btn-primary"
                disabled={sessionState === 'CLOSED'}
                onClick={() => submitCheckIn(inputStudentId, inputCourseCode)}
                style={{ opacity: sessionState === 'CLOSED' ? 0.6 : 1, cursor: sessionState === 'CLOSED' ? 'not-allowed' : 'pointer' }}
              >
                {sessionState === 'CLOSED' ? 'Session Closed' : 'Generate ZK Proof & Check In'}
              </button>
            </article>
          </section>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="tab-content">
          <section className="grid-3">
            <div className="stat-card">
              <div className="stat-label">Privacy Leakage Rate</div>
              <div className="stat-val" style={{ color: '#64748b' }}>—</div>
              <small style={{ color: '#64748b' }}>No proof data loaded</small>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Verified Commitments</div>
              <div className="stat-val">{privateCheckInsCount + sequenceNumber || '—'}</div>
              <small style={{ color: '#64748b' }}>No ledger data loaded</small>
            </div>
            <div className="stat-card">
              <div className="stat-label">Wallet Connection</div>
              <div className="stat-val" style={{ fontSize: '1.1rem' }}>{wallet ? 'Connected' : 'Not connected'}</div>
              <small style={{ color: '#64748b' }}>{wallet ? wallet : 'Connect a Midnight wallet to continue'}</small>
            </div>
          </section>

          <article className="panel">
            <h3 style={{ marginTop: 0 }}>Attendance Proof Verification Meter</h3>
            <p style={{ color: '#64748b' }}>Connect the deployed contract to load real proof verification data.</p>

            <div className="meter-container">
              <div className="meter-fill" style={{ width: '0%' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
              <span>No check-ins loaded</span>
              <span>No contract data loaded</span>
            </div>
          </article>
        </div>
      )}

      {/* ACTIVITY AUDIT TAB */}
      {activeTab === 'activity' && (
        <div className="tab-content">
          <article className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>On-Chain Transaction Audit Feed</h3>
              <span className="eyebrow">
                <span className="status-dot"></span> LIVE AUDIT LOG
              </span>
            </div>

            {activities.length === 0 ? (
              <p style={{ color: '#64748b' }}>No on-chain transactions have been loaded.</p>
            ) : activities.map((act) => (
              <div className="activity-item" key={act.id}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                    {act.action}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    Hash: <code>{act.hash}</code> • {new Date(act.at).toLocaleTimeString()}
                  </div>
                </div>
                <span className={`badge-status badge-${act.status}`}>
                  {act.status}
                </span>
              </div>
            ))}
          </article>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="tab-content">
          <article className="panel">
            <h3 style={{ marginTop: 0 }}>Network & Contract Settings</h3>
            <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>CONTRACT ADDRESS</label>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}>
                  <code>{config.contractAddress}</code>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>MIDNIGHT NETWORK ENVIRONMENT</label>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', color: '#10b981', fontWeight: 600 }}>
                  {config.network.toUpperCase()}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>NODE CONNECTION STATUS</label>
                <div style={{ color: '#059669', fontSize: '0.95rem', marginTop: '4px', fontWeight: 600 }}>
                  {wallet ? `Connected: ${wallet}` : 'No wallet connected'}
                </div>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* OPEN SESSION MODAL */}
      {showOpenModal && (
        <div className="modal-overlay" onClick={() => setShowOpenModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Open Attendance Session</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Specify the course code. A 32-byte course commitment will be generated off-chain and submitted to the Midnight contract.
            </p>
            <form onSubmit={handleOpenSessionSubmit}>
              <div className="form-group">
                <label>Course Identifier</label>
                <input
                  type="text"
                  className="form-control"
                  value={inputCourseCode}
                  onChange={(e) => setInputCourseCode(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowOpenModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm & Open Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHECK-IN MODAL */}
      {showCheckInModal && (
        <div className="modal-overlay" onClick={() => setShowCheckInModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Submit Private ZK Check-In</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Your private key generates a salted evidence proof. The public ledger receives only your rotating pseudonym.
            </p>
            <form onSubmit={handleCheckInSubmit}>
              <div className="form-group">
                <label>Student ID (Private Witness)</label>
                <input
                  type="text"
                  className="form-control"
                  value={inputStudentId}
                  onChange={(e) => setInputStudentId(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Target Course</label>
                <input
                  type="text"
                  className="form-control"
                  value={inputCourseCode}
                  onChange={(e) => setInputCourseCode(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCheckInModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Generate ZK Proof & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
