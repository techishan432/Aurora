# @midnight-ntwrk/attendance-contract

Compact smart contract for Private Student Attendance (PSA) on the Midnight Network.

## Contract Design

The contract implements a zero-knowledge attendance verification system with three circuits:

| Circuit         | Actor      | Description                                              |
|-----------------|------------|----------------------------------------------------------|
| `openSession`   | Instructor | Opens an attendance window with a salted course commitment |
| `checkIn`       | Student    | Submits a ZK proof of attendance (rotating pseudonym)    |
| `closeSession`  | Instructor | Closes the session and increments the sequence counter   |

### Privacy Model

All sensitive data (student identity, roster, evidence) stays in client-side private state. Only salted commitments and rotating pseudonyms are written to the public ledger.

## Scripts

| Script              | Description                                        |
|---------------------|----------------------------------------------------|
| `npm run compact`   | Compile `.compact` circuits                        |
| `npm run build`     | Build TypeScript wrappers from compiled circuits    |
| `npm run test`      | Run contract tests with Vitest                     |
| `npm run typecheck` | Type-check without emitting                        |
| `npm run lint`      | Run ESLint                                         |
| `npm run ci`        | Run compact + typecheck + lint + build + test      |

## Prerequisites

- [Compact compiler](https://docs.midnight.network/) v0.31.0+
- Node.js >= 24.11.1
