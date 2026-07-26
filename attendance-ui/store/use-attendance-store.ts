'use client';
import { create } from 'zustand';
import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { config } from '../lib/config';

export type TransactionStatus = 'pending' | 'processing' | 'confirmed' | 'failed';

export type Activity = {
  id: string;
  action: string;
  status: TransactionStatus;
  at: string;
  hash?: string;
};

type State = {
  wallet?: string;
  walletName?: string;
  isConnecting: boolean;
  isSyncing: boolean;
  walletError?: string;
  sessionState: 'CLOSED' | 'OPEN';
  courseCode: string;
  studentPseudonym: string;
  openSessionsCount: number;
  privateCheckInsCount: number;
  successRate: number;
  sequenceNumber: number;
  activities: Activity[];

  connect: () => Promise<void>;
  disconnect: () => void;
  clearWalletError: () => void;
  openSession: (courseCode: string) => void;
  closeSession: () => void;
  submitCheckIn: (studentId: string, courseCode: string) => void;
  addActivity: (action: string, status?: TransactionStatus) => void;
};

const SYNC_POLL_INTERVAL_MS = 2000;
const MAX_SYNC_ATTEMPTS = 15;
const AUTO_RETRY_DELAY_MS = 5000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isSyncingError = (message: string): boolean => {
  const lower = message.toLowerCase();
  return lower.includes('sync') || lower.includes('indexing') || lower.includes('not ready');
};

export const useAttendanceStore = create<State>((set, get) => ({
  wallet: undefined,
  walletName: undefined,
  isConnecting: false,
  isSyncing: false,
  walletError: undefined,
  sessionState: 'CLOSED',
  courseCode: '',
  studentPseudonym: '',
  openSessionsCount: 0,
  privateCheckInsCount: 0,
  successRate: 0,
  sequenceNumber: 0,
  activities: [],

  connect: async () => {
    const wallets = typeof window === 'undefined' ? [] : Object.values(window.midnight ?? {});
    const wallet = wallets.find(
      (candidate): candidate is InitialAPI =>
        Boolean(candidate) && typeof candidate === 'object' && typeof candidate.connect === 'function',
    );

    if (!wallet) {
      set({
        wallet: undefined,
        walletName: undefined,
        isConnecting: false,
        isSyncing: false,
        walletError:
          'No Midnight wallet detected. Install the Midnight wallet browser extension and unlock it, then try again.',
      });
      return;
    }

    set({ isConnecting: true, isSyncing: false, walletError: undefined });

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_SYNC_ATTEMPTS; attempt++) {
      try {
        const connected = await wallet.connect(config.network);
        const status = await connected.getConnectionStatus();

        if (status.status !== 'connected') {
          throw new Error('Wallet connection was lost. Please reconnect your Midnight wallet and try again.');
        }

        const { shieldedAddress } = await connected.getShieldedAddresses();

        set({
          wallet: shieldedAddress,
          walletName: wallet.name,
          isConnecting: false,
          isSyncing: false,
          walletError: undefined,
        });
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (isSyncingError(lastError.message) && attempt < MAX_SYNC_ATTEMPTS - 1) {
          set({ isSyncing: true, isConnecting: false });
          await sleep(SYNC_POLL_INTERVAL_MS);
          set({ isConnecting: true, isSyncing: false });
          continue;
        }

        break;
      }
    }

    const message = lastError?.message ?? 'Wallet connection was cancelled or failed.';
    set({
      wallet: undefined,
      walletName: undefined,
      isConnecting: false,
      isSyncing: false,
      walletError: isSyncingError(message)
        ? `Wallet is still syncing with the Midnight network. Ensure the Midnight wallet extension is unlocked and the proof server is running (docker compose up -d proof-server). Auto-retrying…`
        : message,
    });
  },

  disconnect: () =>
    set({
      wallet: undefined,
      walletName: undefined,
      isConnecting: false,
      isSyncing: false,
      walletError: undefined,
    }),

  clearWalletError: () => set({ walletError: undefined }),

  openSession: () =>
    set({ walletError: 'Contract transaction support is not connected yet. No attendance session was created.' }),

  closeSession: () =>
    set({ walletError: 'Contract transaction support is not connected yet. No attendance session was closed.' }),

  submitCheckIn: () =>
    set({ walletError: 'Contract transaction support is not connected yet. No check-in was submitted.' }),

  addActivity: () => undefined,
}));
