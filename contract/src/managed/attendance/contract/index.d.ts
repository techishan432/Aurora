import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum SessionState { READY = 0, OPEN = 1, CLOSED = 2 }

export type Witnesses<PS> = {
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  openSession(context: __compactRuntime.CircuitContext<PS>, course_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  checkIn(context: __compactRuntime.CircuitContext<PS>, evidence_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeSession(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  openSession(context: __compactRuntime.CircuitContext<PS>, course_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  checkIn(context: __compactRuntime.CircuitContext<PS>, evidence_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeSession(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  publicKey(sk_0: Uint8Array, sequence_0: Uint8Array): Uint8Array;
  studentPseudonym(sk_0: Uint8Array, sequence_0: Uint8Array): Uint8Array;
  studentNullifier(sk_0: Uint8Array, sequence_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  openSession(context: __compactRuntime.CircuitContext<PS>, course_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  checkIn(context: __compactRuntime.CircuitContext<PS>, evidence_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeSession(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  publicKey(context: __compactRuntime.CircuitContext<PS>,
            sk_0: Uint8Array,
            sequence_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  studentPseudonym(context: __compactRuntime.CircuitContext<PS>,
                   sk_0: Uint8Array,
                   sequence_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  studentNullifier(context: __compactRuntime.CircuitContext<PS>,
                   sk_0: Uint8Array,
                   sequence_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  readonly state: SessionState;
  readonly courseCommitment: { is_some: boolean, value: Uint8Array };
  readonly studentCommitment: { is_some: boolean, value: Uint8Array };
  readonly attendanceCommitment: { is_some: boolean, value: Uint8Array };
  readonly nullifierCommitment: { is_some: boolean, value: Uint8Array };
  readonly registrar: Uint8Array;
  readonly sequence: bigint;
  readonly attendanceCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
