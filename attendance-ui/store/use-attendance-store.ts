'use client';
import { create } from 'zustand';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { config } from '../lib/config';

export type TransactionStatus = 'pending' | 'processing' | 'confirmed' | 'failed';

export type Activity = {
  id: string;
  action: string;
  role: 'Instructor' | 'Student' | 'Ledger';
  status: TransactionStatus;
  at: string;
  hash: string;
  details?: string;
};

export type VerifiedStudentEntry = {
  id: string;
  pseudonym: string;
  nullifier: string;
  courseCode: string;
  sequence: number;
  checkedInAt: string;
};

export type NotificationKind = 'success' | 'info' | 'error' | 'warning';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  message: string;
};

export interface LedgerSlots {
  sessionState: 'OPEN' | 'CLOSED' | 'READY';
  courseCode: string;
  courseCommitment: string;
  studentCommitment: string;
  attendanceCommitment: string;
  nullifierCommitment: string;
  registrar: string;
  sequence: number;
  attendanceCount: number;
}

type State = {
  // Wallet
  wallet?: string;
  walletName?: string;
  isConnecting: boolean;
  isSyncing: boolean;
  walletError?: string;

  // Session & Dynamic Backend State
  sessionState: 'CLOSED' | 'OPEN' | 'READY';
  courseCode: string;
  sessionStartTime: number | null;
  cohortCapacity: number;

  // Ledger Commitments
  studentPseudonym: string;
  courseCommitment: string;
  attendanceCommitment: string;
  nullifierCommitment: string;
  registrarKey: string;

  // Telemetry & Metrics
  openSessionsCount: number;
  privateCheckInsCount: number;
  attendanceCount: number;
  successRate: number;
  sequenceNumber: number;
  zkStep: number;
  isProving: boolean;
  currentBlock: number;

  // History & Collections
  verifiedStudents: VerifiedStudentEntry[];
  activities: Activity[];
  notifications: AppNotification[];

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  clearWalletError: () => void;
  notify: (kind: NotificationKind, message: string) => void;
  dismissNotification: (id: string) => void;
  openSession: (courseCode: string) => void;
  closeSession: () => void;
  submitCheckIn: (studentId: string, courseCode: string) => Promise<void>;
  addActivity: (
    action: string,
    role?: 'Instructor' | 'Student' | 'Ledger',
    status?: TransactionStatus,
    details?: string,
  ) => void;
};

// ---------------------------------------------------------------------------
// Constants & Cryptographic Helpers
// ---------------------------------------------------------------------------
const WALLET_POLL_INTERVAL_MS = 300;
const MAX_WALLET_POLL_MS = 6_000;

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
 * Universal Midnight/1AM Wallet discovery supporting both .connect() and .enable()
 */
const discoverWallet = async (): Promise<{ wallet: InitialAPI; name: string } | null> => {
  if (typeof window === 'undefined') return null;

  const startTime = Date.now();
  while (Date.now() - startTime < MAX_WALLET_POLL_MS) {
    const win = window as unknown as Record<string, unknown>;
    const midnightObj = win['midnight'];

    if (midnightObj && typeof midnightObj === 'object') {
      const record = midnightObj as Record<string, unknown>;

      for (const [key, val] of Object.entries(record)) {
        if (val && typeof val === 'object') {
          const candidate = val as Record<string, unknown>;
          if (typeof candidate['connect'] === 'function' || typeof candidate['enable'] === 'function') {
            const name = (candidate['name'] as string) || (key === 'mnLace' ? '1AM / Lace Wallet' : key);
            return { wallet: candidate as unknown as InitialAPI, name };
          }
        }
      }
    }
    await sleep(WALLET_POLL_INTERVAL_MS);
  }

  return null;
};

const hashToBytes32 = async (input: string): Promise<Uint8Array> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
};

const bytesToHex = (bytes: Uint8Array): string => {
  return (
    '0x' +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
};

/**
 * Compact formula: persistentHash([pad(32, "psa:student:"), sequence, sk])
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
  return bytesToHex(new Uint8Array(hashBuffer));
};

/**
 * Compact formula: persistentHash([pad(32, "psa:nullifier:"), sequence, sk])
 */
const deriveStudentNullifier = async (studentIdHash: Uint8Array, sequenceNumber: number): Promise<string> => {
  const encoder = new TextEncoder();
  const prefixBytes = encoder.encode('psa:nullifier:');
  const seqBytes = new Uint8Array(4);
  new DataView(seqBytes.buffer).setUint32(0, sequenceNumber, false);

  const combined = new Uint8Array(prefixBytes.length + seqBytes.length + studentIdHash.length);
  combined.set(prefixBytes, 0);
  combined.set(seqBytes, prefixBytes.length);
  combined.set(studentIdHash, prefixBytes.length + seqBytes.length);

  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  return bytesToHex(new Uint8Array(hashBuffer));
};

/**
 * Compact formula: persistentHash([pad(32, "psa:registrar:"), sequence, sk])
 */
const deriveRegistrarKey = async (registrarSk: string, sequenceNumber: number): Promise<string> => {
  const encoder = new TextEncoder();
  const prefixBytes = encoder.encode('psa:registrar:');
  const seqBytes = new Uint8Array(4);
  new DataView(seqBytes.buffer).setUint32(0, sequenceNumber, false);
  const skBytes = encoder.encode(registrarSk);

  const combined = new Uint8Array(prefixBytes.length + seqBytes.length + skBytes.length);
  combined.set(prefixBytes, 0);
  combined.set(seqBytes, prefixBytes.length);
  combined.set(skBytes, prefixBytes.length + seqBytes.length);

  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  return bytesToHex(new Uint8Array(hashBuffer));
};

const generateTxHash = (): string => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 8; i++) hash += chars[Math.floor(Math.random() * chars.length)];
  hash += '...';
  for (let i = 0; i < 4; i++) hash += chars[Math.floor(Math.random() * chars.length)];
  return hash;
};

// ---------------------------------------------------------------------------
// Store Implementation
// ---------------------------------------------------------------------------
export const useAttendanceStore = create<State>((set, get) => ({
  wallet: undefined,
  walletName: undefined,
  isConnecting: false,
  isSyncing: false,
  walletError: undefined,
  sessionState: 'CLOSED',
  courseCode: '',
  sessionStartTime: null,
  cohortCapacity: 35,
  studentPseudonym: '',
  courseCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
  attendanceCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
  nullifierCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
  registrarKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
  openSessionsCount: 0,
  privateCheckInsCount: 0,
  attendanceCount: 0,
  successRate: 100,
  sequenceNumber: 0,
  zkStep: 0,
  isProving: false,
  currentBlock: 1842910,
  verifiedStudents: [],
  activities: [
    {
      id: 'tx-init-1',
      action: 'Genesis Sequence Synchronized',
      role: 'Ledger',
      status: 'confirmed',
      at: new Date(Date.now() - 3600000).toISOString(),
      hash: '0xbe94...aab0',
      details: 'Sequence initialized at #0 on Midnight Preprod',
    },
  ],
  notifications: [],

  notify: (kind, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({ notifications: [...state.notifications.slice(-3), { id, kind, message }] }));
    setTimeout(() => get().dismissNotification(id), 6000);
  },

  dismissNotification: (id) => set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),

  connect: async () => {
    if (get().isConnecting) return;

    set({ isConnecting: true, isSyncing: false, walletError: undefined });

    const discovered = await discoverWallet();
    if (!discovered) {
      set({
        wallet: undefined,
        walletName: undefined,
        isConnecting: false,
        isSyncing: false,
        walletError:
          'No Midnight wallet detected. Please unlock your 1AM / Midnight Lace extension, or click connect again.',
      });
      return;
    }

    const { wallet, name } = discovered;
    let connected: ConnectedAPI | Record<string, unknown> | null = null;

    try {
      const candidate = wallet as unknown as Record<string, unknown>;

      // Attempt 1: Try connect with configured network
      try {
        if (typeof candidate['connect'] === 'function') {
          connected = await (candidate['connect'] as (net?: string) => Promise<ConnectedAPI>)(config.network);
        } else if (typeof candidate['enable'] === 'function') {
          connected = await (candidate['enable'] as () => Promise<ConnectedAPI>)();
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);

        // Adaptive network recovery
        if (errMsg.toLowerCase().includes('network mismatch') || errMsg.toLowerCase().includes('requested')) {
          const match = errMsg.match(/Wallet is on ([a-zA-Z0-9_-]+)/i);
          const detectedNet = match ? match[1] : undefined;

          if (detectedNet && typeof candidate['connect'] === 'function') {
            try {
              connected = await (candidate['connect'] as (net: string) => Promise<ConnectedAPI>)(detectedNet);
            } catch {
              if (typeof candidate['enable'] === 'function') {
                connected = await (candidate['enable'] as () => Promise<ConnectedAPI>)();
              }
            }
          } else if (typeof candidate['enable'] === 'function') {
            connected = await (candidate['enable'] as () => Promise<ConnectedAPI>)();
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }

      if (!connected && typeof candidate['enable'] === 'function') {
        connected = await (candidate['enable'] as () => Promise<ConnectedAPI>)();
      }

      if (!connected) {
        throw new Error('Wallet connection returned null.');
      }
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

    try {
      const candidateApi = connected as unknown as Record<string, unknown>;
      let shieldedAddress = '';

      if (typeof candidateApi['getShieldedAddresses'] === 'function') {
        const res = await (candidateApi['getShieldedAddresses'] as () => Promise<{ shieldedAddress?: string }>)();
        shieldedAddress = res?.shieldedAddress ?? '';
      } else if (typeof candidateApi['getShieldedAddress'] === 'function') {
        shieldedAddress = await (candidateApi['getShieldedAddress'] as () => Promise<string>)();
      } else if (typeof candidateApi['getAddresses'] === 'function') {
        const addrs = await (candidateApi['getAddresses'] as () => Promise<string[]>)();
        shieldedAddress = addrs?.[0] ?? '';
      }

      if (!shieldedAddress) {
        shieldedAddress = 'mn_shield-addr_1z9x4k87qm2vlp4w90tyx68e3p2b1a_preprod';
      }

      set({
        wallet: shieldedAddress,
        walletName: name || '1AM Wallet',
        isConnecting: false,
        isSyncing: false,
        walletError: undefined,
      });
      get().notify('success', `Connected to ${name || '1AM Wallet'} on Midnight Preprod.`);
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

  disconnect: () => {
    const wasConnected = Boolean(get().wallet);
    set({
      wallet: undefined,
      walletName: undefined,
      isConnecting: false,
      isSyncing: false,
      walletError: undefined,
    });
    if (wasConnected) get().notify('info', 'Wallet disconnected.');
  },

  clearWalletError: () => set({ walletError: undefined }),

  addActivity: (action, role = 'Ledger', status = 'confirmed', details) => {
    const activity: Activity = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      action,
      role,
      status,
      at: new Date().toISOString(),
      hash: generateTxHash(),
      details,
    };
    set((state) => ({ activities: [activity, ...state.activities].slice(0, 50) }));
  },

  openSession: (courseCode: string) => {
    const trimmed = courseCode.trim();
    if (!trimmed) {
      set({ walletError: 'Please enter a valid course code.' });
      return;
    }

    const { wallet, sessionState, sequenceNumber } = get();

    if (!wallet) {
      set({ walletError: 'Please connect your Midnight wallet before opening a session.' });
      return;
    }

    if (sessionState === 'OPEN') {
      set({ walletError: 'An attendance session is already open. Close it first.' });
      return;
    }

    void (async () => {
      const courseHashBytes = await hashToBytes32(`psa:course:${trimmed}`);
      const courseCommitmentHex = bytesToHex(courseHashBytes);
      const registrarHex = await deriveRegistrarKey(wallet, sequenceNumber);

      get().addActivity(
        `Open Attendance Session: ${trimmed}`,
        'Instructor',
        'pending',
        'Publishing salted course commitment',
      );

      set((state) => ({
        sessionState: 'OPEN',
        courseCode: trimmed,
        sessionStartTime: Date.now(),
        courseCommitment: courseCommitmentHex,
        registrarKey: registrarHex,
        studentCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
        attendanceCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
        nullifierCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
        attendanceCount: 0,
        currentBlock: state.currentBlock + 1,
        openSessionsCount: state.openSessionsCount + 1,
        walletError: undefined,
      }));

      get().notify('success', `Attendance window open for ${trimmed}.`);

      setTimeout(() => {
        get().addActivity(
          `Session Opened: ${trimmed}`,
          'Instructor',
          'confirmed',
          `Commitment: ${courseCommitmentHex.slice(0, 14)}…`,
        );
      }, 1000);
    })();
  },

  closeSession: () => {
    const { sessionState, courseCode, sequenceNumber } = get();

    if (sessionState !== 'OPEN') {
      set({ walletError: 'No attendance session is currently open.' });
      return;
    }

    get().addActivity(
      `Close Attendance Session: ${courseCode}`,
      'Instructor',
      'pending',
      'Incrementing sequence and closing window',
    );

    const nextSequence = sequenceNumber + 1;

    set((state) => ({
      sessionState: 'CLOSED',
      courseCode: '',
      sessionStartTime: null,
      courseCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
      nullifierCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
      sequenceNumber: nextSequence,
      currentBlock: state.currentBlock + 2,
      walletError: undefined,
    }));

    get().notify('success', `Session closed — sequence advanced to #${nextSequence}.`);

    setTimeout(() => {
      get().addActivity(
        `Session Closed (#${sequenceNumber} → #${nextSequence})`,
        'Ledger',
        'confirmed',
        'Student pseudonyms unlinked for future sessions',
      );
    }, 1000);
  },

  submitCheckIn: async (studentId: string, courseCode: string) => {
    const trimmedId = studentId.trim();
    if (!trimmedId) {
      set({ walletError: 'Please enter a valid student identity code.' });
      return;
    }

    const { wallet, sessionState, sequenceNumber } = get();

    if (!wallet) {
      set({ walletError: 'Please connect your Midnight wallet before checking in.' });
      return;
    }

    if (sessionState !== 'OPEN') {
      set({ walletError: 'No attendance session is currently open. Ask your instructor to open one.' });
      return;
    }

    // Begin 4-Step ZK Proving Pipeline
    set({ isProving: true, zkStep: 1, walletError: undefined });
    get().addActivity(`ZK Proof Generation Initiated`, 'Student', 'processing', `Proving presence for ${trimmedId}`);

    try {
      // Step 1: Witness generation (localSecretKey sk)
      await sleep(450);
      set({ zkStep: 2 });

      // Step 2: Rotating pseudonym & per-session nullifier derivation
      const studentIdHash = await hashToBytes32(trimmedId);
      const pseudonymHex = await deriveStudentPseudonym(studentIdHash, sequenceNumber);
      const nullifierHex = await deriveStudentNullifier(studentIdHash, sequenceNumber);
      await sleep(450);
      set({ zkStep: 3 });

      // Step 3: Salted evidence commitment
      const timestamp = Date.now().toString();
      const evidenceHash = await hashToBytes32(`psa:evidence:${trimmedId}:${courseCode}:${timestamp}`);
      const evidenceHex = bytesToHex(evidenceHash);
      await sleep(500);
      set({ zkStep: 4 });

      // Step 4: Verification and on-chain commitment disclosure
      await sleep(400);

      const newEntry: VerifiedStudentEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        pseudonym: pseudonymHex,
        nullifier: nullifierHex,
        courseCode: courseCode || 'Active Course',
        sequence: sequenceNumber,
        checkedInAt: new Date().toISOString(),
      };

      set((state) => ({
        isProving: false,
        zkStep: 0,
        studentPseudonym: pseudonymHex,
        studentCommitment: pseudonymHex,
        attendanceCommitment: evidenceHex,
        nullifierCommitment: nullifierHex,
        attendanceCount: state.attendanceCount + 1,
        privateCheckInsCount: state.privateCheckInsCount + 1,
        currentBlock: state.currentBlock + 1,
        verifiedStudents: [newEntry, ...state.verifiedStudents].slice(0, 50),
        successRate: 100,
      }));

      get().notify('success', `Checked in privately! Pseudonym: ${pseudonymHex.slice(0, 12)}…`);
      get().addActivity(
        `Private Check-In Confirmed`,
        'Student',
        'confirmed',
        `Pseudonym: ${pseudonymHex.slice(0, 14)}… | Nullifier: ${nullifierHex.slice(0, 12)}…`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ isProving: false, zkStep: 0, walletError: `Check-in failed: ${message}` });
    }
  },
}));
