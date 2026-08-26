'use client';

import { config } from '../../../lib/config';
import { shortenAddress } from '../../../lib/format';
import { useAttendanceStore } from '../../../store/use-attendance-store';
import { Badge } from '../badge';
import { Button } from '../button';
import { GlassCard } from '../glass-card';
import { IconCopy, IconLogOut, IconWallet } from '../icons';
import { AuroraMark } from '../logo';

export function SettingsTab() {
  const wallet = useAttendanceStore((state) => state.wallet);
  const walletName = useAttendanceStore((state) => state.walletName);
  const isConnecting = useAttendanceStore((state) => state.isConnecting);
  const isSyncing = useAttendanceStore((state) => state.isSyncing);
  const connect = useAttendanceStore((state) => state.connect);
  const disconnect = useAttendanceStore((state) => state.disconnect);
  const clearWalletError = useAttendanceStore((state) => state.clearWalletError);
  const notify = useAttendanceStore((state) => state.notify);

  const copyValue = (value: string, label: string) => {
    void navigator.clipboard
      .writeText(value)
      .then(() => notify('success', `${label} copied to clipboard.`))
      .catch(() => notify('error', 'Clipboard unavailable in this browser.'));
  };

  return (
    <div className="tab-panel">
      <section className="grid-2">
        <GlassCard>
          <h2 className="t-headline-md card-title-row">Network &amp; contract</h2>
          <div className="row-stack">
            <div className="list-row">
              <div className="list-row-main">
                <span className="t-label-sm text-muted">Contract address</span>
                <span className="list-row-sub mono">{config.contractAddress}</span>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => copyValue(config.contractAddress, 'Contract address')}
                aria-label="Copy contract address"
              >
                <IconCopy size={15} />
              </button>
            </div>

            <div className="list-row">
              <div className="list-row-main">
                <span className="t-label-sm text-muted">Midnight network</span>
                <span className="list-row-title">{config.network.toUpperCase()}</span>
              </div>
              <Badge tone="info">{config.isConfigured ? 'Configured' : 'Placeholder'}</Badge>
            </div>

            <div className="list-row">
              <div className="list-row-main">
                <span className="t-label-sm text-muted">Contract runtime</span>
                <span className="list-row-title">Compact v0.23</span>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <a
                href={
                  config.contractAddress && config.contractAddress !== '<YOUR_DEPLOYED_CONTRACT_ADDRESS>'
                    ? `https://${config.network === 'mainnet' ? '' : 'preprod.'}midnightexplorer.com/contracts/0x${config.contractAddress.replace(/^0x/, '')}`
                    : 'https://preprod.midnightexplorer.com/'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Inspect on Midnight Explorer ↗
              </a>
            </div>
          </div>
          {!config.isConfigured && (
            <p className="field-hint meter-hint">
              Set NEXT_PUBLIC_CONTRACT_ADDRESS in the environment to point at a deployed contract.
            </p>
          )}
        </GlassCard>

        <GlassCard>
          <h2 className="t-headline-md card-title-row">Wallet</h2>
          {wallet ? (
            <div className="row-stack">
              <div className="list-row">
                <div className="list-row-main">
                  <span className="t-label-sm text-muted">{walletName ?? 'Midnight Wallet'}</span>
                  <span className="list-row-sub mono">{shortenAddress(wallet)}</span>
                </div>
                <Badge tone="positive">Connected</Badge>
              </div>
              <p className="field-hint">
                Aurora uses your shielded address only. Disconnect any time — no session data leaves this browser.
              </p>
              <div>
                <Button variant="danger" onClick={disconnect}>
                  <IconLogOut size={15} />
                  Disconnect wallet
                </Button>
              </div>
            </div>
          ) : (
            <div className="row-stack">
              <p className="card-copy">No wallet connected. Aurora works with the Midnight Lace browser extension.</p>
              <div>
                <Button
                  onClick={() => {
                    clearWalletError();
                    void connect();
                  }}
                  loading={isConnecting || isSyncing}
                >
                  <IconWallet size={15} />
                  Connect wallet
                </Button>
              </div>
            </div>
          )}
        </GlassCard>
      </section>

      <GlassCard>
        <div className="feature-row">
          <span className="feature-icon">
            <AuroraMark size={40} />
          </span>
          <div>
            <p className="feature-title">Aurora</p>
            <p className="feature-copy">
              Zero-knowledge attendance on the Midnight Network. Presence proofs, rotating pseudonyms, and zero
              plaintext on-chain — designed around the Atmospheric Glass design system. Version 0.1.0.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
