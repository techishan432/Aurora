import { describe, expect, it } from 'vitest';
import { Contract } from '../managed/attendance/contract/index.js';
import { witnesses } from '../witnesses.js';

describe('PrivateAttendance contract interface', () => {
  it('exports the complete attendance lifecycle', () => {
    const contract = new Contract(witnesses) as unknown as { impureCircuits: Record<string, unknown> };
    expect(contract.impureCircuits).toHaveProperty('openSession');
    expect(contract.impureCircuits).toHaveProperty('checkIn');
    expect(contract.impureCircuits).toHaveProperty('closeSession');
  });

  it('does not export legacy bulletin-board circuits', () => {
    const contract = new Contract(witnesses) as unknown as { impureCircuits: Record<string, unknown> };
    expect(contract.impureCircuits).not.toHaveProperty('post');
    expect(contract.impureCircuits).not.toHaveProperty('takeDown');
  });
});
