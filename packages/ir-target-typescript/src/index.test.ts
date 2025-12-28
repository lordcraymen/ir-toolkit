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

  it('generates function with typed parameters', () => {
    const ir: IRProgram = {
      version: '1.0.0',
      root: {
        type: 'program',
        children: [
          {
            type: 'function',
            name: 'add',
            value: 'number',
            children: [
              {
                type: 'parameter',
                name: 'a',
                children: [{ type: 'type', value: 'number' }],
              },
              {
                type: 'parameter',
                name: 'b',
                children: [{ type: 'type', value: 'number' }],
              },
              {
                type: 'return',
                children: [{ type: 'literal', value: 0 }],
              },
            ],
          },
        ],
      },
    };

    const result = targetTypescript.emit(ir);

    expect(result.files[0].content).toContain('export function add(a: number, b: number): number');
    expect(result.files[0].content).toContain('return 0;');
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

  it('generates valid TypeScript syntax', () => {
    const ir: IRProgram = {
      version: '1.0.0',
      root: {
        type: 'program',
        children: [
          {
            type: 'function',
            name: 'greet',
            value: 'string',
            children: [
              {
                type: 'parameter',
                name: 'name',
                children: [{ type: 'type', value: 'string' }],
              },
              {
                type: 'return',
                children: [
                  {
                    type: 'expression',
                    children: [
                      { type: 'literal', value: 'Hello, ' },
                      { type: 'literal', value: 'World' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    const result = targetTypescript.emit(ir);

    expect(result.files[0].content).toContain('export function greet');
    expect(result.files[0].content).toContain('name: string');
    expect(result.files[0].content).toContain('return');
  });
});
