# Private Student Attendance (PSA)

> A privacy-preserving zero-knowledge student attendance platform built on the Midnight Network using Compact smart contracts.

[![CI/CD Pipeline](https://github.com/techishan432/psa/actions/workflows/ci.yaml/badge.svg)](https://github.com/techishan432/psa/actions)
[![Demo Video](https://img.shields.io/badge/Demo-YouTube-ff0000?logo=youtube)](https://youtu.be/aPLioWkmiYI)
[![Midnight Preprod](https://img.shields.io/badge/Midnight-Preprod-7c3aed?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz48L3N2Zz4=)](https://midnight.network)
[![Compact Language](https://img.shields.io/badge/Compact-v0.23-6366f1)](https://docs.midnight.network)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D24.11.1-339933?logo=node.js)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org)

This project is built on the Midnight Network.

A privacy-preserving dApp on Midnight Network that proves student attendance credentials without revealing private data on-chain.

---

## Level 1 — Compact Contract on Preprod

Level 1 delivered a working Compact contract, local tests, and a Preprod deployment with documented privacy behavior.

### Contract Address
| Network | Address |
|---------|---------|
| **Undeployed** | Ephemeral (regenerated each local standalone run) |
| **Preview** | Pending deployment |
| **Preprod** | `0x3a4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b` |

**Verify Preprod on-chain:**
- [explorer.preprod.midnight.network](https://explorer.preprod.midnight.network)

### Deployer Wallet (Preprod)
`mn_addr_preprod18hl0hkw2sjdwuwztatxzp2mhwpre2w4hc9tlyx0l457k8dxd0fsqrda6jm`
*Fund this address from the Preprod faucet when deploying or calling from the CLI.*

### What This Does (Level 1)
This contract empowers educational institutions with privacy-first attendance tracking on the Midnight ledger. Instructors open cryptographically sealed sessions, and students check-in by generating a ZK proof asserting their presence without disclosing identities on-chain.

### Privacy Model
- **What is PUBLIC (on-chain, visible to anyone):** The session state (READY/OPEN/CLOSED), 32-byte course commitment, rotating student pseudonym, attendance commitment, registrar public key, and sequence counter.
- **What is PRIVATE (private witness, never shown as a public DApp input):** Student Identity Number, Student Name / PII, Raw Course Identifier, and the Student's Local Secret Key.
- **What the user PROVES without revealing:** That they know the correct course information, their own secret identity, and that they checked into a valid `OPEN` session.

### Privacy Claim
An on-chain observer can see that an attendance session was opened and closed, and they can see a mathematical evidence hash for each check-in (via `disclose()`). However, the private witness input — the student's personal identity or raw course name — is never displayed in the UI result surface or exposed on the public ledger. Pseudonyms rotate per sequence to break cross-session linkability. The UI shows proof status and on-chain result only.

### Initial Idea
The Private Student Attendance (PSA) platform is a privacy-first smart contract built on the Midnight network. It allows educational institutions to securely track academic attendance while empowering students to prove their presence to instructors without exposing sensitive, underlying private data on a public ledger. By using Midnight's zero-knowledge proofs, the platform ensures that the verification is cryptographically secure and tamper-proof.

### Level 1 Screenshots

![Private Student Attendance System](image.png)

### Level 1 Tech Stack
- Midnight network
- Compact language v0.23
- Node.js v24.11+
- Docker

### Level 1 Prerequisites
- Node.js v24.11.1+
- Docker Desktop or Docker Engine with Compose v2
- Midnight Compact compiler support via the VS Code extension or local toolchain

### Level 1 Setup
```bash
git clone https://github.com/techishan432/psa.git
cd psa
npm install
docker run -d -p 6300:6300 midnightntwrk/proof-server:latest
cd contract && npm run compact
```

### Run Tests
```bash
cd contract && npm test
```

---

## Level 2 — Frontend + Lace on Preprod

Level 2 builds on Level 1: the same Preprod contract is wired to a React/Next.js frontend, Midnight Lace wallet connect/disconnect works on Preprod, and the zero-knowledge circuits are called from the browser.

### Level 2 Submission Checklist
| Requirement | Status |
|-------------|--------|
| Public GitHub repository with README | ✅ This repo |
| Live demo (Vercel) | ✅ [psa-two.vercel.app](https://psa-two.vercel.app/) |
| Preprod contract address (verifiable on-chain) | ✅ Same Preprod address as Level 1 |
| Demo video: Lace connect + successful circuit call | ✅ [YouTube](https://youtu.be/aPLioWkmiYI) |
| README documents the privacy claim | ✅ See Privacy Claim above |
| Minimum 8 meaningful commits | ✅ |
| Lace connect / disconnect | ✅ |
| Circuit called from frontend | ✅ |
| Observable privacy behavior | ✅ Private witness + ZK proof; UI does not display private input |

### Live Demo
[https://psa-two.vercel.app/](https://psa-two.vercel.app/)

### Demo Video
Wallet connect / disconnect and a successful zero-knowledge check-in on Preprod:

Watch on YouTube: [https://youtu.be/aPLioWkmiYI](https://youtu.be/aPLioWkmiYI)

### Try the Live Demo
1. Install the Midnight Lace browser extension.
2. Set Lace network to **Preprod**.
3. Set Lace proof server to `http://localhost:6300`.
4. Start the proof server locally: `docker run -d -p 6300:6300 midnightntwrk/proof-server:latest`.
5. Fund Lace with tNIGHT from the Preprod faucet, then generate tDUST in Lace.
6. Open the live demo → Connect Wallet → Open Session (Instructor) / Check In (Student).

### What Level 2 Adds
- Lace wallet connect / disconnect via `@midnight-ntwrk/dapp-connector-api`
- Circuit calls from the React UI (`openSession`, `checkIn`, `closeSession`) with result handling
- Local private state management in the browser
- Frontend deployed to Vercel, still targeting the Level 1 Preprod contract

### Level 2 Tech Stack (additions)
- Midnight.js SDK (`@midnight-ntwrk/midnight-js-protocol`)
- `@midnight-ntwrk/dapp-connector-api` (Lace)
- React 19 + Next.js 16 + Zustand v5
- Vercel (frontend hosting)

### Run the Frontend Locally
```bash
git clone https://github.com/techishan432/psa.git
cd psa
npm install
docker run -d -p 6300:6300 midnightntwrk/proof-server:latest
cd attendance-ui && npm run dev
```
Open `http://localhost:3000`. Lace must be on Preprod with proof server `http://localhost:6300`.

### Scripts
| Script | Purpose |
|--------|---------|
| `cd contract && npm test` | Level 1 contract tests |
| `cd attendance-cli && npm run preprod-remote` | Deploy / interact via CLI to Preprod |
| `cd attendance-ui && npm run dev` | Local UI (Level 2) |
| `cd attendance-ui && npm run build` | Production UI build (Vercel) |

---

## Level 3 — Tests, CI/CD & Polish

Level 3 adds a full test suite (circuit logic, state transitions, privacy), a GitHub Actions CI/CD pipeline, UI polish, and a product proposal template.

### Level 3 Submission Checklist
| Requirement | Status |
|-------------|--------|
| 3+ tests passing (circuit / state / privacy) | ✅ 4 tests in `contract/src/test/attendance.test.ts` |
| CI/CD pipeline on push to main | ✅ `.github/workflows/ci.yaml` |
| CI badge in README | ✅ Green badge at top of this file |
| Contract address in README | ✅ See Level 1 Contract Address table |
| Privacy Model section in README | ✅ See Level 1 Privacy Model |
| `PROPOSAL.md` created | ✅ `PROPOSAL.md` |
| dApp builds with zero errors | ✅ `npm run build` |
| File structure matches spec | ✅ `contract/`, `api/`, `attendance-ui/`, `attendance-cli/`, `.github/workflows/` |

### Live Demo
Vercel: [https://psa-two.vercel.app/](https://psa-two.vercel.app/)

### Demo Video
Full dApp flow, passing tests, and green CI/CD checks:

Watch on YouTube: [https://youtu.be/aPLioWkmiYI](https://youtu.be/aPLioWkmiYI)

### What Level 3 Adds
- **Tests:** 4 Vitest tests covering circuit logic, ledger state transitions, and privacy (private witness never in public output)
- **CI:** compile → test → production build on every push and PR via `.github/workflows/ci.yaml`
- **UI polish:** error states, loading states during ZK proof generation, responsive layout via Next.js
- **PROPOSAL.md:** product proposal template for Level 3+

### Run Tests
```bash
cd contract && npm test
```

### CI/CD
Workflow: `.github/workflows/ci.yaml`

**CI (Continuous Integration)**
Runs on every push to main and every pull request:
1. Checkout code
2. Install Node.js v24
3. Install Compact compiler v0.23.0
4. `npm ci`
5. Compile and test `contract`, `api`, `attendance-cli`, and `attendance-ui`

### Setup & Run Locally (Level 3)
```bash
git clone https://github.com/techishan432/psa.git
cd psa
npm install
docker run -d -p 6300:6300 midnightntwrk/proof-server:latest
cd contract && npm run compact
cd ../attendance-ui && npm run dev
```

### Level 3 Scripts
| Script | Purpose |
|--------|---------|
| `cd contract && npm test` | Contract unit tests (circuit / state / privacy) |
| `cd contract && npm run ci` | Compact compile + build + test pipeline |
| `cd attendance-ui && npm run build` | Production UI build |

### Product Proposal
See [PROPOSAL.md](./PROPOSAL.md)

### Repository
- **GitHub:** [https://github.com/techishan432/psa](https://github.com/techishan432/psa)
- **License:** Apache License 2.0
