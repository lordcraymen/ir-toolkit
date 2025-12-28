import { describe, it, expect } from 'vitest';
import { targetTypescript } from '../src/index.js';
import type { IRProgram } from '@lordcraymen/ir-core';

describe('ir-target-typescript', () => {
  it('generates TypeScript output from IR', () => {
    const ir: IRProgram = {
      version: '1.0.0',
      root: {
        type: 'program',
        children: [],
      },
    };

    const result = targetTypescript.emit(ir);

    expect(result.files).toHaveLength(1);
    expect(result.files[0].path).toBe('index.ts');
    expect(result.files[0].content).toContain('Generated from IR v1.0.0');
  });

  it('counts nodes correctly', () => {
    const ir: IRProgram = {
      version: '1.0.0',
      root: {
        type: 'program',
        children: [
          {
            type: 'statement',
            children: [
              { type: 'expression' },
              { type: 'literal', value: 42 },
            ],
          },
        ],
      },
    };

    const result = targetTypescript.emit(ir);

    expect(result.files[0].content).toContain('Total nodes: 4');
    expect(result.files[0].content).toContain('nodeCount: 4');
  });

  it('produces deterministic output', () => {
    const ir: IRProgram = {
      version: '2.0.0',
      root: {
        type: 'program',
        children: [],
      },
    };

    const result1 = targetTypescript.emit(ir);
    const result2 = targetTypescript.emit(ir);

    expect(result1.files[0].content).toBe(result2.files[0].content);
  });

  it('exports GeneratedProgram interface', () => {
    const ir: IRProgram = {
      version: '1.0.0',
      root: { type: 'program' },
    };

    const result = targetTypescript.emit(ir);

    expect(result.files[0].content).toContain('export interface GeneratedProgram');
    expect(result.files[0].content).toContain('export const program: GeneratedProgram');
  });
});
