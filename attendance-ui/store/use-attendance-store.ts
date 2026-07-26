'use client';
import { create } from 'zustand';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
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

const WALLET_POLL_INTERVAL_MS = 500;
const MAX_WALLET_POLL_MS = 10000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isUserCancellation = (message: string): boolean => {
  const lower = message.toLowerCase();
  return (
    lower.includes('cancel') ||
    lower.includes('reject') ||
    lower.includes('denied') ||
    lower.includes('user closed')
  );
};

const waitForWallet = async (): Promise<InitialAPI | null> => {
  if (typeof window === 'undefined') return null;

  const startTime = Date.now();
  while (Date.now() - startTime < MAX_WALLET_POLL_MS) {
    const wallet = Object.values(window.midnight ?? {}).find(
      (candidate): candidate is InitialAPI =>
        Boolean(candidate) && typeof candidate === 'object' && typeof candidate.connect === 'function',
    );

    if (wallet) return wallet;
    await sleep(WALLET_POLL_INTERVAL_MS);
  }

  return null;
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
    set({ isConnecting: true, isSyncing: false, walletError: undefined });

    // Step 1: Wait for wallet extension to be available
    const wallet = await waitForWallet();
    if (!wallet) {
      set({
        wallet: undefined,
        walletName: undefined,
        isConnecting: false,
        isSyncing: false,
        walletError:
          'No Midnight wallet detected. Please install the Midnight wallet browser extension, unlock it, and refresh the page.',
      });
      return;
    }

    // Step 2: Connect to the wallet (this may prompt user for approval)
    let connected: ConnectedAPI;
    try {
      connected = await wallet.connect(config.network);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      
      // Don't retry on user cancellation
      if (isUserCancellation(message)) {
        set({
          wallet: undefined,
          walletName: undefined,
          isConnecting: false,
          isSyncing: false,
          walletError: 'Connection was cancelled. Click "Connect Wallet" to try again.',
        });
        return;
      }

      set({
        wallet: undefined,
        walletName: undefined,
        isConnecting: false,
        isSyncing: false,
        walletError: `Failed to connect to wallet: ${message}`,
      });
      return;
    }

    // Step 3: Get the shielded address
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
        walletError: `Failed to get wallet address: ${message}`,
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
