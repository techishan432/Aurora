/** Public contract data is commitment-only; never place student PII here. */
export type AttendanceSession = {
  state: 'READY' | 'OPEN' | 'CLOSED';
  sequence: bigint;
  courseCommitment?: Uint8Array;
  studentCommitment?: Uint8Array;
  attendanceCommitment?: Uint8Array;
};
export type AttendanceAction = 'openSession' | 'checkIn' | 'closeSession';
export type TransactionLifecycle = 'pending' | 'processing' | 'confirmed' | 'failed';
export type AttendanceTransaction = {
  id: string;
  action: AttendanceAction;
  status: TransactionLifecycle;
  error?: string;
};
