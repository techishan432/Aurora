export * from './common-types.js';
import type { AttendanceAction, AttendanceTransaction } from './common-types.js';

/**
 * Adapter boundary for the Midnight wallet integration. Implementations must
 * create proofs in the wallet; this API never receives a private key or PII.
 */
export interface AttendanceContractClient {
  submit(action: AttendanceAction, commitment?: Uint8Array): Promise<AttendanceTransaction>;
  subscribe(listener: (transaction: AttendanceTransaction) => void): () => void;
}

// Resolved at build time from NEXT_PUBLIC_CONTRACT_ADDRESS env var.
// After deploying the contract, set this in attendance-ui/.env.local
export const CONTRACT_ADDRESS =
  process.env['NEXT_PUBLIC_CONTRACT_ADDRESS'] ?? '<YOUR_DEPLOYED_CONTRACT_ADDRESS>';

