import { describe, it, expect } from 'vitest';
import { validate } from '../src/index.js';

describe('ir-core', () => {
  it('validates a correct IR program', () => {
    const program = {
      version: '1.0.0',
      root: {
        type: 'program',
        children: [],
      },
    };

    const result = validate(program);
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects invalid IR program (no version)', () => {
    const program = {
      root: {
        type: 'program',
      },
    };

    const result = validate(program);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects invalid IR program (no root)', () => {
    const program = {
      version: '1.0.0',
    };

    const result = validate(program);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects invalid IR program (root has no type)', () => {
    const program = {
      version: '1.0.0',
      root: {
        value: 'test',
      },
    };

    const result = validate(program);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
