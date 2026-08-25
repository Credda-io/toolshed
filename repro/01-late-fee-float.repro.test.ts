/**
 * Reproduction for issues/01-late-fee-shows-too-many-decimals.md
 *
 * The desk quotes fees in dollars and cents. Twelve days late, two forgiven,
 * ten chargeable days at 35c is $3.50.
 */
import { describe, expect, it } from 'vitest';
import { lateFee } from '../src/fees.js';

describe('issue 01: late fee is quoted to the cent', () => {
  it('charges exactly $3.50 for ten chargeable days', () => {
    expect(lateFee(12)).toBe(3.5);
  });

  it('charges exactly $1.05 for three chargeable days', () => {
    expect(lateFee(5)).toBe(1.05);
  });
});
