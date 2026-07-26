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

import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

export * from './managed/attendance/contract/index.js';
export * from './witnesses';

import * as CompiledAttendanceContract from './managed/attendance/contract/index.js';
import * as Witnesses from './witnesses';

export const CompiledAttendanceContractContract = CompiledContract.make<
  CompiledAttendanceContract.Contract<Witnesses.AttendancePrivateState>
>('Attendance', CompiledAttendanceContract.Contract<Witnesses.AttendancePrivateState>).pipe(
  CompiledContract.withWitnesses(Witnesses.witnesses),
  CompiledContract.withCompiledFileAssets('./managed/attendance'),
);
