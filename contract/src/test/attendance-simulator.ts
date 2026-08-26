/* eslint-disable @typescript-eslint/no-explicit-any */
// This file is part of midnightntwrk/example-attendance.
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { sampleContractAddress, createConstructorContext, createCircuitContext } from '@midnight-ntwrk/compact-runtime';
import { Contract, type Ledger, ledger } from '../managed/attendance/contract/index.js';
import { type AttendancePrivateState, witnesses } from '../witnesses.js';

/**
 * Serves as a testbed to exercise the contract in tests
 */
export class AttendanceSimulator {
  readonly contract: Contract<AttendancePrivateState>;
  circuitContext: any;
  currentPrivateState: AttendancePrivateState;

  constructor(secretKey: Uint8Array) {
    this.contract = new Contract<AttendancePrivateState>(witnesses);
    this.currentPrivateState = { secretKey };
    const initResult: any = (this.contract as any).initialState(
      createConstructorContext({ secretKey }, '0'.repeat(64)),
    );
    const contractState =
      initResult.currentContractState?.data ??
      initResult.contractState?.data ??
      initResult.currentContractState ??
      initResult.contractState;
    const zswap = initResult.currentZswapLocalState ?? initResult.zswapLocalState ?? new Uint8Array(32);
    const contractAddress = sampleContractAddress();

    try {
      this.circuitContext = (createCircuitContext as any)(
        'constructor',
        contractAddress,
        zswap,
        contractState,
        this.currentPrivateState,
      );
    } catch {
      this.circuitContext = {
        currentPrivateState: this.currentPrivateState,
        callContext: {
          currentPrivateState: this.currentPrivateState,
          currentQueryContext: { state: contractState },
        },
      };
    }
  }

  /***
   * Switch to a different secret key for a different user
   */
  public switchUser(secretKey: Uint8Array) {
    this.currentPrivateState = {
      secretKey,
    };
    if (this.circuitContext?.callContext) {
      this.circuitContext.callContext.currentPrivateState = this.currentPrivateState;
    }
  }

  public getLedger(): Ledger {
    const state =
      this.circuitContext?.callContext?.currentQueryContext?.state ??
      this.circuitContext?.currentQueryContext?.state ??
      {};
    return ledger(state);
  }

  public getPrivateState(): AttendancePrivateState {
    return this.currentPrivateState;
  }

  public openSession(course: Uint8Array): Ledger {
    this.circuitContext = (this.contract.impureCircuits.openSession(this.circuitContext, course) as any).context;
    return this.getLedger();
  }

  public checkIn(evidence: Uint8Array): Ledger {
    this.circuitContext = (this.contract.impureCircuits.checkIn(this.circuitContext, evidence) as any).context;
    return this.getLedger();
  }

  public closeSession(): Ledger {
    this.circuitContext = (this.contract.impureCircuits.closeSession(this.circuitContext) as any).context;
    return this.getLedger();
  }

  public publicKey(): Uint8Array {
    const sequenceField = this.getLedger().sequence;
    const sequence = new Uint8Array(32);
    const view = new DataView(sequence.buffer);
    view.setBigUint64(24, sequenceField, false);
    return (this.contract.circuits.publicKey(this.circuitContext, this.getPrivateState().secretKey, sequence) as any)
      .result;
  }
}
