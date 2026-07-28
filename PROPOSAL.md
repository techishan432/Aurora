# Product Proposal: Private Student Attendance (PSA)

**Hackathon:** RiseIn × Midnight Network — Midnight Level 3 Challenge  
**Repository:** https://github.com/techishan432/psa  
**Live Demo:** https://psa-two.vercel.app/  
**Demo Video:** https://youtu.be/aPLioWkmiYI

---

## 1. Problem Statement

Traditional attendance systems expose sensitive student data — names, student IDs, timestamps, and location signals — to third-party databases and public ledgers. Deploying on a standard transparent blockchain would make this behavioral data permanently and irrevocably public, violating student privacy and FERPA/GDPR obligations.

**The core problem:** How can an institution *prove* a student attended a session without learning *who* the student is or creating a cross-session tracking record?

---

## 2. Solution Overview

**Private Student Attendance (PSA)** is a privacy-preserving zero-knowledge dApp built on the Midnight Network. It uses Compact smart contracts and client-side ZK proofs so that:

- Instructors open cryptographically sealed attendance windows
- Students check in by generating a ZK proof *locally on their device*
- The public ledger receives only commitments — never plaintext identity or course data

---

## 3. Privacy Model — What Stays Private vs. What Goes On-Chain

| Data Point | Location | Visibility |
|---|---|---|
| Student Identity Number | Client only | ✅ Strictly private |
| Student Name / PII | Client only | ✅ Strictly private |
| Raw Course Identifier | Client only | ✅ Strictly private |
| Student's local secret key | Client only | ✅ Strictly private |
| Wallet Address Mapping | Client only | ✅ Strictly private |
| `courseCommitment` | On-chain ledger | Public (salted hash) |
| `studentCommitment` (pseudonym) | On-chain ledger | Public (rotating per session) |
| `attendanceCommitment` | On-chain ledger | Public (salted evidence hash) |
| `registrar` public key | On-chain ledger | Public (derived from secret + sequence) |
| `sequence` counter | On-chain ledger | Public |
| `state` (READY/OPEN/CLOSED) | On-chain ledger | Public |

**Cross-session unlinkability:** The student pseudonym rotates every session via the `sequence` counter, so an observer cannot link check-ins across different sessions even if they watch every transaction.

---

## 4. Multi-Role Zero-Knowledge Architecture (Level 3)

PSA implements a **two-role ZK system** with cryptographically distinct authorities:

### Role 1 — Registrar (Instructor)

The registrar opens and closes attendance sessions.

```compact
export circuit openSession(course: Bytes<32>): [] {
  // Asserts no session is already open
  assert(state != SessionState.OPEN, "An attendance session is already open");
  // Derives registrar public key from private secret — never revealed
  registrar = disclose(publicKey(localSecretKey(), sequence as Field as Bytes<32>));
  courseCommitment = disclose(some<Bytes<32>>(course));
  state = SessionState.OPEN;
}

export circuit closeSession(): [] {
  assert(state == SessionState.OPEN, "No attendance session is open");
  // On-chain assertion: only the original opener can close
  assert(registrar == publicKey(localSecretKey(), sequence as Field as Bytes<32>),
         "Only the session registrar can close attendance");
  state = SessionState.CLOSED;
  sequence.increment(1);   // Rotates student pseudonyms for next session
}
```

### Role 2 — Student (Attendee)

The student checks in by providing a ZK proof. Only a rotating pseudonym and a salted evidence commitment are ever disclosed.

```compact
export circuit checkIn(evidence: Bytes<32>): [] {
  assert(state == SessionState.OPEN, "No attendance session is open");
  // Rotating pseudonym — derived from private key + sequence; changes each session
  studentCommitment = disclose(
    some<Bytes<32>>(studentPseudonym(localSecretKey(), sequence as Field as Bytes<32>))
  );
  attendanceCommitment = disclose(some<Bytes<32>>(evidence));
}
```

### Private Witness

The `localSecretKey()` witness is **the core privacy primitive** — it is a client-side secret that is used inside ZK proof computation but never leaves the client device or reaches the ledger.

```compact
witness localSecretKey(): Bytes<32>;
```

### Commitment Derivation

Both roles derive commitments from the same private key formula, ensuring the registrar and student roles cannot be forged:

```compact
export circuit publicKey(sk: Bytes<32>, sequence: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>([pad(32, "psa:registrar:"), sequence, sk]);
}

export circuit studentPseudonym(sk: Bytes<32>, sequence: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>([pad(32, "psa:student:"), sequence, sk]);
}
```

---

## 5. Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT DEVICE                        │
│  ┌─────────────┐     ┌──────────────────────────────┐  │
│  │ Lace Wallet │────▶│    ZK Proof Generation       │  │
│  │ (secret key)│     │  localSecretKey() witness    │  │
│  └─────────────┘     │  → never leaves this box     │  │
│                      └──────────────┬───────────────┘  │
└─────────────────────────────────────┼───────────────────┘
                                      │ ZK Proof + commitment
                                      ▼
┌─────────────────────────────────────────────────────────┐
│              MIDNIGHT LEDGER (Public)                   │
│  state: READY | OPEN | CLOSED                          │
│  courseCommitment:    hash("course_salt" ‖ course_id)  │
│  studentCommitment:   hash("psa:student:" ‖ seq ‖ sk)  │
│  attendanceCommitment: hash(evidence_salt ‖ timestamp) │
│  registrar:           hash("psa:registrar:" ‖ seq ‖ sk)│
│  sequence:            monotonic counter                 │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Full Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Compact v0.23 on Midnight Network |
| Contract Runtime | `@midnight-ntwrk/midnight-js-protocol` v4.1.1 |
| Wallet Integration | `@midnight-ntwrk/dapp-connector-api` v4.0.1 |
| Frontend | Next.js 16 + React 19 + TypeScript 5.9 |
| State Management | Zustand v5 |
| ZK Proving | Midnight Proof Server (Docker) |
| CI/CD | GitHub Actions (`compact compile` + `vitest`) |

---

## 7. Deployment Evidence

### Preprod (Midnight Network)

| Field | Value |
|---|---|
| **Contract Address** | `a746a03e40e6e4b36ec451548e355f2611657c2334e0e7594c3d14d4ef8da1de` |
| **Deployer Wallet** | `mn_addr_preprod18hl0hkw2sjdwuwztatxzp2mhwpre2w4hc9tlyx0l457k8dxd0fsqrda6jm` |
| **Explorer** | [preprod.midnightexplorer.com](https://preprod.midnightexplorer.com) |

### Local Standalone (Docker-based test environment)

| Field | Value |
|---|---|
| **Contract Address** | `ccd52b280bd783ad5559d0d58c1c366da2a21c73c6e6d46f3b14f2f503c3d46b` |
| **Transaction ID** | `001f54bbbb4ad7ff184999857767eb224cd1d8e2cf2d46d141827d0169b736794d` |
| **Network** | `undeployed` (local Midnight node via `docker-compose`) |

Deployed using genesis-funded wallet seed with Midnight testkit `LocalTestEnvironment`.

---

## 8. Test Results

```
RUN  v4.1.9  /contract

✓ src/test/attendance.test.ts (4 tests) 2ms
  ✓ should start in READY state
  ✓ should allow instructor to open a session
  ✓ should allow student to check in to open session
  ✓ should allow instructor to close session

Test Files  1 passed (1)
     Tests  4 passed (4)
```

Run tests: `cd contract && npm test`

---

## 9. CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yaml`) runs on every push to `main`:

1. **Setup** — Checkout, install Compact compiler v0.23.0 via `midnightntwrk/setup-compact-action`, Node.js 24
2. **Contract** — `compact compile` → `tsc --noEmit` → `eslint` → `tsc build` → `vitest run`
3. **API** — `typecheck` → `lint` → `build`
4. **CLI** — `typecheck` → `lint` → `build`
5. **UI** — `typecheck` → `lint` → `next build`

[![CI](https://github.com/techishan432/psa/actions/workflows/ci.yaml/badge.svg)](https://github.com/techishan432/psa/actions)

---

## 10. Level 3 Requirement Checklist

| Requirement | Status | Evidence |
|---|---|---|
| Compact contract on Preprod | ✅ | `a746a03e...ef8da1de` on preprod |
| Local deployment | ✅ | `ccd52b28...3c3d46b` via `npm run standalone` |
| Multi-role ZK architecture | ✅ | `openSession` (registrar) + `checkIn` (student) |
| Private witness usage | ✅ | `localSecretKey()` witness — never disclosed |
| TypeScript frontend | ✅ | `attendance-ui/` — Next.js + React 19 |
| Browser wallet integration | ✅ | `window.midnight` Lace Wallet connector |
| Passing test suite | ✅ | 4/4 Vitest tests |
| CI/CD pipeline | ✅ | GitHub Actions with compile + test |
| Public repository | ✅ | github.com/techishan432/psa |
| Product proposal | ✅ | This document |
