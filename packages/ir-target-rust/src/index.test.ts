import { describe, it, expect } from 'vitest';
import { targetRust } from '../src/index.js';
import type { IRProgram } from '@lordcraymen/ir-core';

describe('ir-target-rust', () => {
  it('generates Rust output from IR', () => {
    const ir: IRProgram = {
      version: '1.0.0',
      root: {
        type: 'program',
        children: [],
      },
    };

    const result = targetRust.emit(ir);

    expect(result.files).toHaveLength(1);
    expect(result.files[0].path).toBe('lib.rs');
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

    const result = targetRust.emit(ir);

    expect(result.files[0].content).toContain('pub fn add(a: i32, b: i32) -> i32');
    expect(result.files[0].content).toContain('0');
  });

  it('produces deterministic output', () => {
    const ir: IRProgram = {
      version: '2.0.0',
      root: {
        type: 'program',
        children: [],
      },
    };

    const result1 = targetRust.emit(ir);
    const result2 = targetRust.emit(ir);

    expect(result1.files[0].content).toBe(result2.files[0].content);
  });

  it('maps types correctly', () => {
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

    const result = targetRust.emit(ir);

    expect(result.files[0].content).toContain('pub fn greet');
    expect(result.files[0].content).toContain('name: &str');
    expect(result.files[0].content).toContain('-> String');
  });
});
