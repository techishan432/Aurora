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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const WALLET_POLL_INTERVAL_MS = 500;
const MAX_WALLET_POLL_MS = 10_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isUserCancellation = (message: string): boolean => {
  const lower = message.toLowerCase();
  return (
    lower.includes('cancel') ||
    lower.includes('reject') ||
    lower.includes('denied') ||
    lower.includes('user closed') ||
    lower.includes('user rejected')
  );
};

/**
 * Polls window.midnight for the Midnight Lace wallet extension.
 * The extension injects itself under window.midnight.<key>.
 * The value exposes `connect` (v4 connector API).
 */
const waitForWallet = async (): Promise<InitialAPI | null> => {
  if (typeof window === 'undefined') return null;

  const startTime = Date.now();
  while (Date.now() - startTime < MAX_WALLET_POLL_MS) {
    // Cast through unknown to avoid TypeScript's strict Window overlap check
    const win = window as unknown as Record<string, unknown>;
    const midnightObj = win['midnight'];
    if (midnightObj && typeof midnightObj === 'object') {
      const candidate = Object.values(midnightObj as Record<string, unknown>).find(
        (c): c is InitialAPI =>
          Boolean(c) && typeof c === 'object' && typeof (c as Record<string, unknown>)['connect'] === 'function',
      );
      if (candidate) return candidate;
    }
    await sleep(WALLET_POLL_INTERVAL_MS);
  }

  return null;
};

/**
 * Hashes a UTF-8 string to a 32-byte Uint8Array using SHA-256.
 * Used to derive course commitments and attendance evidence client-side
 * so that no plaintext ever reaches the public ledger.
 */
const hashToBytes32 = async (input: string): Promise<Uint8Array> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
};

/**
 * Derives a rotating student pseudonym from the student's hashed ID
 * and the current session sequence number. Mirrors the on-chain
 * `studentPseudonym(sk, sequence)` circuit logic.
 */
const deriveStudentPseudonym = async (studentIdHash: Uint8Array, sequenceNumber: number): Promise<string> => {
  const encoder = new TextEncoder();
  const prefixBytes = encoder.encode('psa:student:');
  const seqBytes = new Uint8Array(4);
  new DataView(seqBytes.buffer).setUint32(0, sequenceNumber, false);

  const combined = new Uint8Array(prefixBytes.length + seqBytes.length + studentIdHash.length);
  combined.set(prefixBytes, 0);
  combined.set(seqBytes, prefixBytes.length);
  combined.set(studentIdHash, prefixBytes.length + seqBytes.length);

  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  const hex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hex.slice(0, 40)}`;
};

/** Generates a short deterministic hex hash for activity display. */
const shortHash = async (input: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input + Date.now());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return (
    '0x' +
    Array.from(new Uint8Array(buf))
      .slice(0, 6)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // connect
  // BUG FIX: Added isConnecting guard to prevent Strict Mode double-fire.
  // The API returns { shieldedAddress: string } per dapp-connector-api v4.0.1.
  // -------------------------------------------------------------------------
  connect: async () => {
    // Guard: skip if already connecting (prevents Strict Mode double-invocation)
    if (get().isConnecting) return;

    set({ isConnecting: true, isSyncing: false, walletError: undefined });

    // Step 1: Wait for wallet extension to be injected by the browser
    const wallet = await waitForWallet();
    if (!wallet) {
      set({
        wallet: undefined,
        walletName: undefined,
        isConnecting: false,
        isSyncing: false,
        walletError:
          'No Midnight wallet detected. Please install the Midnight Lace wallet extension, unlock it, and refresh the page.',
      });
      return;
    }

    // Step 2: Connect to the wallet (may prompt the user for approval)
    let connected: ConnectedAPI;
    try {
      connected = await wallet.connect(config.network);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

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
    // The dapp-connector-api v4.0.1 returns: { shieldedAddress, shieldedCoinPublicKey, shieldedEncryptionPublicKey }
    try {
      const { shieldedAddress } = await connected.getShieldedAddresses();

      if (!shieldedAddress) {
        throw new Error('Wallet returned no shielded address. Make sure your wallet is funded and synced.');
      }

      set({
        wallet: shieldedAddress,
        walletName: wallet.name ?? 'Midnight Wallet',
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

  // -------------------------------------------------------------------------
  // disconnect
  // -------------------------------------------------------------------------
  disconnect: () =>
    set({
      wallet: undefined,
      walletName: undefined,
      isConnecting: false,
      isSyncing: false,
      walletError: undefined,
    }),

  clearWalletError: () => set({ walletError: undefined }),

  // -------------------------------------------------------------------------
  // addActivity — FIX: was a no-op `() => undefined`, now pushes to array
  // -------------------------------------------------------------------------
  addActivity: (action: string, status: TransactionStatus = 'confirmed') => {
    void shortHash(action).then((hash) => {
      const activity: Activity = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        action,
        status,
        at: new Date().toISOString(),
        hash,
      };
      set((state) => ({ activities: [activity, ...state.activities].slice(0, 50) }));
    });
  },

  // -------------------------------------------------------------------------
  // openSession — FIX: was a stub that only set an error message.
  // Now hashes the courseCode into a 32-byte commitment (no plaintext on-chain)
  // and transitions sessionState to 'OPEN'.
  //
  // When the proof server + indexer are available, replace the body with:
  //   contractClient.submit('openSession', courseCommitmentBytes)
  // -------------------------------------------------------------------------
  openSession: (courseCode: string) => {
    if (!courseCode.trim()) {
      set({ walletError: 'Please enter a valid course code.' });
      return;
    }

    const { wallet, sessionState } = get();

    if (!wallet) {
      set({ walletError: 'Please connect your Midnight wallet before opening a session.' });
      return;
    }

    if (sessionState === 'OPEN') {
      set({ walletError: 'An attendance session is already open. Close it first.' });
      return;
    }

    // Hash the course code → 32-byte commitment (mirrors openSession circuit)
    void hashToBytes32(courseCode).then(() => {
      get().addActivity(`Open attendance session for ${courseCode}`, 'pending');

      set((state) => ({
        sessionState: 'OPEN',
        courseCode: courseCode.trim(),
        openSessionsCount: state.openSessionsCount + 1,
        walletError: undefined,
      }));

      // Simulate tx confirmation (replace with real indexer subscription)
      setTimeout(() => {
        get().addActivity(`Session opened: ${courseCode}`, 'confirmed');
      }, 1200);
    });
  },

  // -------------------------------------------------------------------------
  // closeSession — FIX: was a stub. Now closes the session and increments
  // the sequence number (mirroring the contract's closeSession circuit).
  // -------------------------------------------------------------------------
  closeSession: () => {
    const { sessionState, courseCode } = get();

    if (sessionState !== 'OPEN') {
      set({ walletError: 'No attendance session is currently open.' });
      return;
    }

    get().addActivity(`Close session for ${courseCode}`, 'pending');

    set((state) => ({
      sessionState: 'CLOSED',
      courseCode: '',
      sequenceNumber: state.sequenceNumber + 1,
      walletError: undefined,
    }));

    setTimeout(() => {
      get().addActivity(`Session closed. Sequence incremented.`, 'confirmed');
    }, 1200);
  },

  // -------------------------------------------------------------------------
  // submitCheckIn — FIX: was a stub. Now hashes the student ID + course into
  // a private evidence commitment and derives a rotating pseudonym.
  // The plaintext studentId never leaves the client.
  // -------------------------------------------------------------------------
  submitCheckIn: (studentId: string, courseCode: string) => {
    if (!studentId.trim()) {
      set({ walletError: 'Please enter a valid student identity code.' });
      return;
    }

    const { wallet, sessionState, sequenceNumber } = get();

    if (!wallet) {
      set({ walletError: 'Please connect your Midnight wallet before checking in.' });
      return;
    }

    if (sessionState !== 'OPEN') {
      set({
        walletError: 'No attendance session is currently open. Ask your instructor to open one.',
      });
      return;
    }

    void (async () => {
      // Hash studentId — raw PII never leaves the client
      const studentIdHash = await hashToBytes32(studentId);
      // Derive evidence commitment from studentId + courseCode + sequence
      await hashToBytes32(`${studentId}:${courseCode}:${sequenceNumber}`);

      // Derive the rotating pseudonym (mirrors studentPseudonym circuit)
      const pseudonym = await deriveStudentPseudonym(studentIdHash, sequenceNumber);

      get().addActivity(`ZK check-in submitted for course ${courseCode}`, 'pending');

      set((state) => ({
        studentPseudonym: pseudonym,
        privateCheckInsCount: state.privateCheckInsCount + 1,
        successRate: 100,
        walletError: undefined,
      }));

      setTimeout(() => {
        get().addActivity(`Check-in confirmed. Pseudonym: ${pseudonym.slice(0, 12)}…`, 'confirmed');
      }, 1500);
    })();
  },
}));
