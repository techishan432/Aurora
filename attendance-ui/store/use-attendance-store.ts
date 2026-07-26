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
  walletError?: string;
  sessionState: 'CLOSED' | 'OPEN';
  courseCode: string;
  studentPseudonym: string;
  openSessionsCount: number;
  privateCheckInsCount: number;
  successRate: number;
  sequenceNumber: number;
  activities: Activity[];
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  clearWalletError: () => void;
  openSession: (courseCode: string) => void;
  closeSession: () => void;
  submitCheckIn: (studentId: string, courseCode: string) => void;
  addActivity: (action: string, status?: TransactionStatus) => void;
};

export const useAttendanceStore = create<State>((set, get) => ({
  wallet: undefined,
  walletName: undefined,
  isConnecting: false,
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
        walletError: 'No Midnight wallet was found. Install and unlock a compatible wallet extension, then try again.',
      });
      return;
    }

    set({ isConnecting: true, walletError: undefined });

    try {
      const connected = await wallet.connect(config.network);
      const status = await connected.getConnectionStatus();
      if (status.status !== 'connected') {
        throw new Error('The wallet did not establish a connection.');
      }

      const { shieldedAddress } = await connected.getShieldedAddresses();
      set({
        wallet: shieldedAddress,
        walletName: wallet.name,
        isConnecting: false,
        walletError: undefined,
      });
    } catch (error) {
      set({
        wallet: undefined,
        walletName: undefined,
        isConnecting: false,
        walletError: error instanceof Error ? error.message : 'Wallet connection was cancelled or failed.',
      });
    }
  },

  disconnect: () =>
    set({
      wallet: undefined,
      walletName: undefined,
      isConnecting: false,
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
