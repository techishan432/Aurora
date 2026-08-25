# @midnight-ntwrk/attendance-api

Midnight network connector interface for the **Aurora** attendance smart contract (formerly Private Student
Attendance / PSA).

## Overview

This package provides:

- **`AttendanceContractClient`** — client interface for interacting with deployed attendance contracts
- **Session & transaction types** — `AttendanceSession`, `AttendanceAction`, `TransactionLifecycle`
- **`CONTRACT_ADDRESS`** — configurable contract address constant
- **`randomBytes`** — utility for generating cryptographically random byte arrays

## Usage

```ts
import { AttendanceContractClient, CONTRACT_ADDRESS } from '@midnight-ntwrk/attendance-api';
```

Set `CONTRACT_ADDRESS` in your environment or `.env` file after deploying the Compact contract to Midnight Preprod/Mainnet.

## Scripts

| Script        | Description                          |
|---------------|--------------------------------------|
| `npm run build`     | Compile TypeScript to `dist/`  |
| `npm run typecheck` | Type-check without emitting    |
| `npm run lint`      | Run ESLint                     |
| `npm run ci`        | Run typecheck + lint + build   |
