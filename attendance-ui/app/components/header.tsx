'use client';

import { config } from '../../lib/config';
import { shortenAddress } from '../../lib/format';
import { useAttendanceStore } from '../../store/use-attendance-store';
import type { TabId } from '../types';
import { Button } from './button';
import { AuroraMark } from './logo';
import { NAV_ITEMS } from './nav-items';

type HeaderProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const wallet = useAttendanceStore((state) => state.wallet);
  const walletName = useAttendanceStore((state) => state.walletName);
  const isConnecting = useAttendanceStore((state) => state.isConnecting);
  const isSyncing = useAttendanceStore((state) => state.isSyncing);
  const walletError = useAttendanceStore((state) => state.walletError);
  const connect = useAttendanceStore((state) => state.connect);
  const disconnect = useAttendanceStore((state) => state.disconnect);
  const clearWalletError = useAttendanceStore((state) => state.clearWalletError);

  const connectLabel = isSyncing
    ? 'Syncing ledger'
    : isConnecting
      ? 'Connecting'
      : walletError
        ? 'Retry connection'
        : 'Connect wallet';

  return (
    <header className="glass site-header">
      <div className="brand">
        <span className="brand-mark">
          <AuroraMark />
        </span>
        <div>
          <div className="brand-name">Aurora</div>
          <div className="brand-tag">Zero-knowledge attendance · Midnight {config.network}</div>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Primary">
        {NAV_ITEMS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="nav-tab"
            aria-current={activeTab === id ? 'page' : undefined}
            onClick={() => onTabChange(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div>
        {wallet ? (
          <button
            type="button"
            className="wallet-chip"
            onClick={disconnect}
            title={`Disconnect ${walletName ?? 'wallet'}`}
            aria-label={`Disconnect wallet ${shortenAddress(wallet)}`}
          >
            <span className="wallet-chip-dot" aria-hidden="true" />
            <span className="wallet-chip-name">{walletName ?? 'Midnight Wallet'}</span>
            <span className="wallet-chip-address">{shortenAddress(wallet)}</span>
          </button>
        ) : (
          <Button
            onClick={() => {
              clearWalletError();
              void connect();
            }}
            loading={isConnecting || isSyncing}
          >
            {connectLabel}
          </Button>
        )}
      </div>
    </header>
  );
}
