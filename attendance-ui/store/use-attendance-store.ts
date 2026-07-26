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

const RETRY_DELAY_MS = 3000;
const MAX_ATTEMPTS = 20;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (message: string): boolean => {
  const lower = message.toLowerCase();
  return (
    lower.includes('sync') ||
    lower.includes('indexing') ||
    lower.includes('not ready') ||
    lower.includes('disconnected') ||
    lower.includes('connection') ||
    lower.includes('timeout') ||
    lower.includes('aborted') ||
    lower.includes('failed to fetch') ||
    lower.includes('network')
  );
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
    if (typeof window === 'undefined') return;

    // Re-check for wallet on each attempt (extension may inject late)
    const findWallet = (): InitialAPI | undefined =>
      Object.values(window.midnight ?? {}).find(
        (candidate): candidate is InitialAPI =>
          Boolean(candidate) && typeof candidate === 'object' && typeof candidate.connect === 'function',
      );

    let wallet = findWallet();
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

    let connected: Awaited<ReturnType<InitialAPI['connect']>> | null = null;

    // Phase 1: establish connection to the wallet extension
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        connected = await wallet.connect(config.network);
        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (isRetryable(message) && attempt < MAX_ATTEMPTS - 1) {
          set({ isSyncing: true, isConnecting: false });
          await sleep(RETRY_DELAY_MS);
          set({ isConnecting: true, isSyncing: false });
          wallet = findWallet() ?? wallet;
          continue;
        }
        set({
          wallet: undefined,
          walletName: undefined,
          isConnecting: false,
          isSyncing: false,
          walletError: message || 'Failed to connect to the Midnight wallet.',
        });
        return;
      }
    }

    if (!connected) {
      set({
        isConnecting: false,
        walletError: 'Could not establish a connection to the Midnight wallet after multiple attempts.',
      });
      return;
    }

    // Phase 2: wait for the wallet to finish syncing its chain state.
    // getConnectionStatus() may return 'disconnected' while the wallet is still
    // indexing — that's normal and retryable, not a hard failure.
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const status = await connected.getConnectionStatus();
        if (status.status === 'connected') break;

        // disconnected while still syncing — wait and retry
        if (attempt >= MAX_ATTEMPTS - 1) {
          throw new Error(
            'Wallet is connected to the extension but has not finished syncing with the network. ' +
              'Open the Midnight wallet extension and wait for sync to complete, then try again.',
          );
        }

        set({ isSyncing: true, isConnecting: false });
        await sleep(RETRY_DELAY_MS);
        set({ isConnecting: true, isSyncing: false });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (isRetryable(message) && attempt < MAX_ATTEMPTS - 1) {
          set({ isSyncing: true, isConnecting: false });
          await sleep(RETRY_DELAY_MS);
          set({ isConnecting: true, isSyncing: false });
          continue;
        }
        set({
          wallet: undefined,
          walletName: undefined,
          isConnecting: false,
          isSyncing: false,
          walletError: message,
        });
        return;
      }
    }

    // Phase 3: get the shielded address
    try {
      const { shieldedAddress } = await connected.getShieldedAddresses();
      set({
        wallet: shieldedAddress,
        walletName: wallet.name,
        isConnecting: false,
        isSyncing: false,
        walletError: undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({
        wallet: undefined,
        walletName: undefined,
        isConnecting: false,
        isSyncing: false,
        walletError: message || 'Failed to retrieve wallet address.',
      });
    }
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
