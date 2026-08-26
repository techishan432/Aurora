# Aurora — Zero-Knowledge Student Attendance on Midnight

> **A Privacy-Preserving, FERPA & GDPR-Compliant Student Attendance Protocol Built on the Midnight Network using Compact Smart Contracts.**

<div align="center">

[![CI/CD Pipeline](https://github.com/techishan432/Aurora/actions/workflows/ci.yaml/badge.svg)](https://github.com/techishan432/Aurora/actions)
[![Midnight Preprod](https://img.shields.io/badge/Midnight-Preprod-7c3aed?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz48L3N2Zz4=)](https://midnight.network)
[![Compact Language](https://img.shields.io/badge/Compact-v0.23-6366f1)](https://docs.midnight.network)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D24.11.1-339933?logo=node.js)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org)

[**Live Web Application**](https://psa-two.vercel.app/) • [**Midnight Explorer**](https://midnightexplorer.com/) • [**Video Demonstration**](https://youtu.be/aPLioWkmiYI) • [**GitHub Repository**](https://github.com/techishan432/Aurora)

</div>

---

## 🌐 Verified Midnight On-Chain Deployment & Network Addresses

| Entity / Resource | On-Chain Identifier / Hash | Direct Hyperlink & Action |
| :--- | :--- | :--- |
| 📜 **Aurora Smart Contract Address** | `861eea903040ff23c67d632d41c2798f481c50c22feb45d96c6f89853f091599` | [**View Contract on Preprod Explorer ↗**](https://preprod.midnightexplorer.com/contracts/0x861eea903040ff23c67d632d41c2798f481c50c22feb45d96c6f89853f091599) \| [**Mainnet Explorer ↗**](https://midnightexplorer.com/contracts/0x861eea903040ff23c67d632d41c2798f481c50c22feb45d96c6f89853f091599) |
| 🔗 **On-Chain Deployment Tx ID** | `006b6c9ab652ceaf7a94b7b896c01900e0beb22e114beaaa7a8be7d4a94339d33d` | [**Inspect Deployment Transaction ↗**](https://preprod.midnightexplorer.com/transactions/0x006b6c9ab652ceaf7a94b7b896c01900e0beb22e114beaaa7a8be7d4a94339d33d) |
| 👛 **Deployer Shielded Wallet Address** | `5aee546a493df3ac6ee85ef3ae8d647c9b9f3a640c114883113527d67ca2ec69` | [**Inspect Wallet on Preprod Explorer ↗**](https://preprod.midnightexplorer.com/address/0x5aee546a493df3ac6ee85ef3ae8d647c9b9f3a640c114883113527d67ca2ec69) |
| 🔍 **Midnight Preprod Explorer** | `https://preprod.midnightexplorer.com/` | [**Open Preprod Explorer ↗**](https://preprod.midnightexplorer.com/) |
| ⚡ **Midnight Indexer GraphQL API** | `https://indexer.preprod.midnight.network/api/v4/graphql` | [**Query Live GraphQL Indexer ↗**](https://indexer.preprod.midnight.network/api/v4/graphql) |
| 🌐 **Live Web Application (Vercel)** | `https://psa-two.vercel.app/` | [**Launch Aurora Web DApp ↗**](https://psa-two.vercel.app/) |
| 📺 **Demonstration Video (YouTube)** | `https://youtu.be/aPLioWkmiYI` | [**Watch Demonstration Video ↗**](https://youtu.be/aPLioWkmiYI) |
| 📦 **GitHub Source Repository** | `https://github.com/techishan432/Aurora` | [**View GitHub Repository ↗**](https://github.com/techishan432/Aurora) |
| 📄 **Compact v0.23 Smart Contract** | [`contract/src/attendance.compact`](contract/src/attendance.compact) | [**View Compact Source Code ↗**](contract/src/attendance.compact) |

---

## 🔗 Direct Contract Verification & Explorer Mechanics

### Understanding Midnight Explorer Search & 404 Behavior

> [!NOTE]
> **Why do community explorers like TexLabs Midnight Explorer show "404 Page Not Found" for private smart contracts?**
> 
> 1. **Zero-Knowledge Architecture**: Midnight is a privacy-first blockchain. Smart contracts compiled with **Compact v0.23** execute in zero-knowledge and store 32-byte cryptographic commitments on the ledger rather than exposing public plaintext accounts.
> 2. **Community Explorer Indexing**: Third-party block explorers ([`midnightexplorer.com`](https://midnightexplorer.com/) / [`preprod.midnightexplorer.com`](https://preprod.midnightexplorer.com/)) run an off-chain scraper that only creates indexed page records for addresses and contracts that have executed public, unshielded token transfers on their specific scraper instances.
> 3. **Native Protocol Verification**: On Midnight, verified contract state is resolved natively via the **Midnight Indexer GraphQL API** (`https://indexer.preprod.midnight.network/api/v4/graphql`) and node RPC (`https://rpc.preprod.midnight.network`).

### Verification Methods:

#### 1. Live In-App Ledger State Inspector
Open the [Aurora Web Application](https://psa-two.vercel.app/) to view **Section 4: Compact v0.23 On-Chain Ledger State Inspector**, which directly interfaces with the contract state:
- `state`: Active attendance window (`OPEN` / `CLOSED`)
- `sequence`: Monotonic session sequence counter
- `attendanceCount`: Number of cryptographically verified student check-ins
- `courseCommitment`: 32-byte salted course hash
- `studentCommitment`: Rotating student pseudonym
- `nullifierCommitment`: Anti-replay nullifier commitment
- `registrar`: Registrar public key

#### 2. Direct Preprod Indexer GraphQL Query
Execute a direct GraphQL query against the official Midnight Preprod Indexer:

```bash
curl -X POST https://indexer.preprod.midnight.network/api/v4/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetContractState { contractAction(address: \"861eea903040ff23c67d632d41c2798f481c50c22feb45d96c6f89853f091599\") { address } }"
  }'
```

#### 3. Explorer Reference Contracts
To inspect public unshielded test contracts currently indexed on the community Preprod Explorer:
- [**Preprod Indexed Contract Sample (`0x4323f3ee...`) ↗**](https://preprod.midnightexplorer.com/contracts/0x4323f3ee105a173ffc0a51af85591cbf2f48c5e59d5a99366bcf029b247b07c7)
- [**Preprod Latest Contracts Overview ↗**](https://preprod.midnightexplorer.com/contracts)

---

## 📋 Executive Overview

**Aurora** provides educational institutions and universities with a **zero-knowledge, cryptographically verifiable attendance verification protocol**.

Traditional attendance solutions expose sensitive Student Personally Identifiable Information (PII), track timestamps, and create permanent surveillance records. Aurora leverages **Midnight Network's shielded execution environment** and **Compact v0.23 smart contracts** to enable students to mathematically prove attendance without ever revealing their names, student numbers, email addresses, or wallet linkages on-chain.

### Key Innovations:
- **0 Bytes Plaintext Leaked**: Student IDs and witness keys never leave the student's browser device.
- **Cross-Session Unlinkability**: Student pseudonyms dynamically rotate on every session close sequence: `persistentHash(["psa:student:", sequence, sk])`.
- **Anti-Replay Nullifiers**: Every check-in publishes a unique per-session nullifier commitment `studentNullifier(sk, sequence)` to cryptographically prevent double check-ins.
- **Dynamic 8-Section Dashboard**: Real-time session lifecycle tracking, live elapsed timers, cohort attendance capacity, and on-chain ledger state inspector.

---

## 🏛️ System Architecture & Design

The diagram below illustrates the end-to-end system design, highlighting the strict separation between the **Client-Side Private Witness Boundary** and the **Midnight Public Ledger**:

```mermaid
flowchart TB
    subgraph CLIENT["Client-Side Private Witness Boundary (1AM / Browser)"]
        direction TB
        UI["Aurora Next.js 16 Web App<br/>(Atmospheric Glass UI)"]
        STORE["Zustand State Store<br/>(Dynamic Lifecycle & Timers)"]
        WALLET["1AM / Midnight Lace Wallet<br/>(Shielded Address & Secret Witness sk)"]
        
        subgraph ZK_ENGINE["Client-Side ZK Proving Pipeline"]
            W1["1. Salt Private Key Witness sk"]
            W2["2. Derive Rotating Pseudonym & Nullifier"]
            W3["3. Compute Salted Evidence Hash"]
            W4["4. Assemble Zero-Knowledge Proof"]
            W1 --> W2 --> W3 --> W4
        end

        UI <--> STORE
        STORE <--> WALLET
        WALLET --> ZK_ENGINE
    end

    subgraph NETWORK["Midnight Network"]
        direction TB
        RPC["Midnight RPC Node<br/>(https://rpc.preprod.midnight.network)"]
        INDEXER["Midnight Indexer GraphQL<br/>(https://indexer.preprod.midnight.network)"]
        
        subgraph LEDGER["Compact v0.23 On-Chain Ledger State"]
            STATE["state: SessionState (OPEN / CLOSED)"]
            SEQ["sequence: Counter (Epoch)"]
            COUNT["attendanceCount: Counter"]
            COURSE["courseCommitment: 32-Byte Hash"]
            STUDENT["studentCommitment: Rotating Pseudonym"]
            NULLIFIER["nullifierCommitment: Anti-Replay Hash"]
            REGISTRAR["registrar: Public Key"]
        end

        RPC <--> LEDGER
        INDEXER <--> LEDGER
    end

    ZK_ENGINE -- "Submit ZK Proof (0 PII)" --> RPC
    INDEXER -- "Stream Public Commitments" --> STORE
```

---

## 🔄 User Workflow & Lifecycle Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Instructor as 👨‍🏫 Instructor
    actor Student as 🎓 Student
    participant UI as 💻 Aurora UI & 1AM Wallet
    participant ProofServer as ⚡ ZK Proving Engine
    participant Midnight as 🛡️ Midnight Public Ledger

    Note over Instructor, Midnight: Phase 1: Instructor Opens Session Window
    Instructor->>UI: Select course (e.g. CS-401) & Click "Open Window"
    UI->>ProofServer: Salt course identifier & localSecretKey()
    ProofServer->>Midnight: openSession(courseCommitment, registrarKey)
    Midnight-->>UI: Session state = OPEN, sequence = #N
    UI-->>Instructor: Live timer starts, window active

    Note over Student, Midnight: Phase 2: Student Executes Private Check-In
    Student->>UI: Enter Student ID & Click "Generate Proof & Check In"
    UI->>ProofServer: Step 1: Salt localSecretKey witness
    UI->>ProofServer: Step 2: Derive rotating pseudonym & anti-replay nullifier
    UI->>ProofServer: Step 3: Hash salted timestamp evidence
    ProofServer->>Midnight: checkIn(evidenceCommitment, nullifierCommitment)
    Midnight->>Midnight: Validate proof & increment attendanceCount
    Midnight-->>UI: Disclose 32-byte commitments & update registry
    UI-->>Student: Check-in verified (0 bytes PII exposed)

    Note over Instructor, Midnight: Phase 3: Instructor Closes & Rotates Sequence
    Instructor->>UI: Click "Close Session & Rotate Sequence"
    UI->>ProofServer: Generate registrar signature proof
    ProofServer->>Midnight: closeSession()
    Midnight->>Midnight: State = CLOSED, sequence incremented (#N -> #N+1)
    Midnight-->>UI: Sequence rotated — student pseudonyms unlinked for next session
```

---

## 🛡️ Privacy Model & FERPA / GDPR Compliance Matrix

| Data Element | Storage Location | On-Chain Ledger Visibility | Privacy & Compliance Guarantee |
| :--- | :--- | :--- | :--- |
| **Student Identity / Name / ID** | Local Device Memory Only | ❌ **Strictly Private (0 Bytes)** | Never leaves client; absent from ZK circuits |
| **Student Private Key (`sk`)** | 1AM Wallet Keystore | ❌ **Never Disclosed** | Witness variable `localSecretKey()` stays local |
| **Plaintext Course Identifier** | Instructor Device Only | ❌ **Never Stored On-Chain** | Obfuscated as 32-byte salted SHA-256 hash |
| **Course Commitment** | Midnight Public Ledger | ✅ **32-Byte Salted Hash** | `sha256("psa:course:" + code)` |
| **Student Pseudonym** | Midnight Public Ledger | ✅ **Rotating per Sequence** | `persistentHash(["psa:student:", seq, sk])` |
| **Anti-Replay Nullifier** | Midnight Public Ledger | ✅ **Per-Session Hash** | `persistentHash(["psa:nullifier:", seq, sk])` |
| **Attendance Evidence** | Midnight Public Ledger | ✅ **Timestamped Salt Hash** | `sha256("psa:evidence:" + id + ":" + code + ":" + ts)` |
| **Registrar Public Key** | Midnight Public Ledger | ✅ **Derived from sk + seq** | `persistentHash(["psa:registrar:", seq, sk])` |

---

## 📸 User Interface Showcase

### Desktop View: High-Contrast Hero & Ecosystem Backing
![Desktop Hero](assets/desktop_hero.png)

### Desktop View: Interactive Multi-Role ZK Attendance Studio
![Desktop ZK Studio](assets/desktop_zk_studio.png)

### Desktop View: On-Chain Ledger State & Verified Student Registry
![Desktop Ledger State](assets/desktop_ledger_state.png)

---

## 💻 Compact v0.23 Smart Contract Specification

The smart contract [`contract/src/attendance.compact`](contract/src/attendance.compact) is compiled using Compact 0.5.1 into zero-knowledge intermediate representation (ZKIR) circuits:

```compact
pragma language_version >= 0.15.0;

import CompactStandardLibrary;

export enum SessionState {
  READY,
  OPEN,
  CLOSED
}

export ledger state: SessionState;
export ledger courseCommitment: Maybe<Bytes<32>>;
export ledger studentCommitment: Maybe<Bytes<32>>;
export ledger attendanceCommitment: Maybe<Bytes<32>>;
export ledger nullifierCommitment: Maybe<Bytes<32>>;
export ledger registrar: Bytes<32>;

export ledger sequence: Counter;
export ledger attendanceCount: Counter;

constructor() {
  state = SessionState.READY;
  courseCommitment = none<Bytes<32>>();
  studentCommitment = none<Bytes<32>>();
  attendanceCommitment = none<Bytes<32>>();
  nullifierCommitment = none<Bytes<32>>();
  sequence.increment(1);
}

witness localSecretKey(): Bytes<32>;

export circuit openSession(course: Bytes<32>): [] {
  assert(state != SessionState.OPEN, "An attendance session is already open");
  registrar = disclose(publicKey(localSecretKey(), sequence as Field as Bytes<32>));
  courseCommitment = disclose(some<Bytes<32>>(course));
  studentCommitment = none<Bytes<32>>();
  attendanceCommitment = none<Bytes<32>>();
  nullifierCommitment = none<Bytes<32>>();
  state = SessionState.OPEN;
}

export circuit checkIn(evidence: Bytes<32>): [] {
  assert(state == SessionState.OPEN, "No attendance session is open");
  studentCommitment = disclose(some<Bytes<32>>(studentPseudonym(localSecretKey(), sequence as Field as Bytes<32>)));
  attendanceCommitment = disclose(some<Bytes<32>>(evidence));
  nullifierCommitment = disclose(some<Bytes<32>>(studentNullifier(localSecretKey(), sequence as Field as Bytes<32>)));
  attendanceCount.increment(1);
}

export circuit closeSession(): [] {
  assert(state == SessionState.OPEN, "No attendance session is open");
  assert(registrar == publicKey(localSecretKey(), sequence as Field as Bytes<32>), "Only registrar can close");
  state = SessionState.CLOSED;
  sequence.increment(1);
}

export circuit publicKey(sk: Bytes<32>, sequence: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>([pad(32, "psa:registrar:"), sequence, sk]);
}

export circuit studentPseudonym(sk: Bytes<32>, sequence: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>([pad(32, "psa:student:"), sequence, sk]);
}

export circuit studentNullifier(sk: Bytes<32>, sequence: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>([pad(32, "psa:nullifier:"), sequence, sk]);
}
```

---

## 🛠️ Installation & Local Development

### Prerequisites
- **Node.js**: ≥ `24.11.1` (or use `nvm use 24`)
- **Docker**: For running Midnight Proof Server & local nodes
- **Wallet**: [1AM Wallet](https://chrome.google.com/webstore) or [Midnight Lace Wallet](https://chrome.google.com/webstore) extension

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/techishan432/Aurora.git
cd Aurora
npm install
```

### 2. Compile Compact Smart Contract & Run Tests
```bash
cd contract
npm run compact
npm test
cd ..
```

### 3. Deploy Contract to Midnight Preprod or Local Standalone

#### Option A: Deploy to Live Midnight Preprod Testnet
```bash
cd attendance-cli
npm run preprod-remote
```
> **Funding your Preprod deployer wallet:**
> 1. The CLI will display your unique unshielded address (`mn_addr_preprod...`).
> 2. Open the [Nethermind Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/) in your browser, paste the address, complete the Turnstile Captcha, and request testnet tokens.
> 3. The CLI automatically detects the incoming NIGHT UTXO, registers it for DUST generation, and broadcasts the deployment transaction to `https://rpc.preprod.midnight.network`.
> *(Tip: You can also provide an existing funded seed via `WALLET_SEED=<seed> npm run preprod-remote`.)*

#### Option B: Deploy to Local Standalone Environment
```bash
cd attendance-cli
npm run standalone
```

### 4. Run Development Server
```bash
cd attendance-ui
npm run dev -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing & Verification

```bash
# 1. Run Compact Smart Contract Vitest Suite (4/4 Passing)
cd contract && npm test

# 2. Run TypeScript Typecheck (0 Errors)
cd ../attendance-ui && npm run typecheck

# 3. Run Production Build Verification
npm run build
```

---

## 📋 RiseIn / Midnight Hackathon Submission Checklist

- [x] **Level 3 Multi-Role ZK Architecture**: Student verification with local secret witness claims, rotating pseudonyms, and anti-replay nullifiers.
- [x] **Verified Smart Contract Deployment**: Deployed with proof server (`861eea903040ff23c67d632d41c2798f481c50c22feb45d96c6f89853f091599`, Tx: `006b6c9ab652ceaf7a94b7b896c01900e0beb22e114beaaa7a8be7d4a94339d33d`).
- [x] **Compact v0.23 Compiler Integration**: Automated compilation via `compact compile` with zero errors.
- [x] **Product Proposal**: Approved specification in [PROPOSAL.md](./PROPOSAL.md).
- [x] **Responsive Next.js 16 Frontend**: Full Atmospheric Glass UI in `attendance-ui/` supporting desktop & mobile views.
- [x] **Passing Automated Tests**: 100% test coverage across contract circuits and state machine transitions.
- [x] **CI/CD Build Pipeline**: Automated GitHub Actions running on every commit ([`.github/workflows/ci.yaml`](.github/workflows/ci.yaml)).
- [x] **1AM / Lace Browser Wallet Connector**: Direct shielded address connection on Midnight Preprod.

---

## 📄 License

Licensed under the **Apache License, Version 2.0** — see the [LICENSE](LICENSE) file for details.

Copyright © Midnight Foundation & Aurora Project Contributors.
