# Product Proposal: Private Student Attendance (PSA)

## 1. Overview
Private Student Attendance (PSA) is a privacy-preserving zero-knowledge student attendance platform built on the Midnight Network using Compact smart contracts. It empowers educational institutions with privacy-first attendance tracking where instructors open cryptographically sealed sessions and students prove presence without disclosing identities on-chain.

## 2. Problem Statement
Traditional attendance tracking systems often expose student identities, personal information, and location data to central databases. If implemented on a standard public blockchain, this sensitive behavioral data would be permanently exposed to the public. Students and institutions need a way to verify class attendance without compromising privacy, revealing identities, or creating a permanently trackable history of student movements.

## 3. Solution & Architecture
PSA solves this by leveraging zero-knowledge proofs. 
- **Instructors** open attendance sessions by publishing a cryptographically salted commitment to the course.
- **Students** check in by generating a ZK proof locally on their device, which proves they know the correct course information and their own secret identity.
- The public ledger only ever sees a salted course commitment, a rotating pseudonym derived from the student's private key, and a salted attendance evidence hash. 

## 4. Midnight Privacy Model Integration
Our dApp meaningfully uses Midnight's privacy model by separating public state from private local witness data:
- **Strictly Private (Off-Chain):** Student Identity Number, Student Name (PII), Raw Course Identifier, Wallet Address Mapping, and the Student's Local Secret Key.
- **Public State (On-Chain):** Session State (`READY`, `OPEN`, `CLOSED`), 32-byte Course Commitment, Rotating Student Pseudonym, Attendance Commitment, Registrar Public Key, and Sequence Counter.
This design ensures that an observer cannot link a student's check-ins across different sessions, as the pseudonym rotates per session sequence.

## 5. Multi-Role ZK Architecture (Level 3 Requirement)
The system implements a multi-role zero-knowledge architecture:
- **Registrar (Instructor):** Has the authority to open and close sessions. Their identity is verified on-chain when closing the session (`closeSession` asserts registrar == `publicKey(sk, seq)`).
- **Student:** Can check-in to an open session. They execute a local ZK witness (`localSecretKey()`) and generate a proof that asserts they are checking into an `OPEN` session, without revealing who they are.
