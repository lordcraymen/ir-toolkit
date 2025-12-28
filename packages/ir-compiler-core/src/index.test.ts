import { describe, it, expect } from 'vitest';
import { runCompile } from '../src/index.js';
import type { IRProgram } from '@lordcraymen/ir-core';
import type { Target } from '../src/index.js';

describe('ir-compiler-core', () => {
  const mockIR: IRProgram = {
    version: '1.0.0',
    root: {
      type: 'program',
      children: [],
    },
  };

  const mockTarget1: Target = {
    name: 'target1',
    emit: () => ({
      files: [
        { path: 'output1.txt', content: 'content from target 1' },
      ],
    }),
  };

  const mockTarget2: Target = {
    name: 'target2',
    emit: () => ({
      files: [
        { path: 'output2.txt', content: 'content from target 2' },
      ],
    }),
  };

  it('compiles with single target', () => {
    const result = runCompile(mockIR, [mockTarget1]);
    
    expect(result.files).toHaveLength(1);
    expect(result.files[0].path).toBe('output1.txt');
    expect(result.files[0].content).toBe('content from target 1');
  });

  it('compiles with multiple targets', () => {
    const result = runCompile(mockIR, [mockTarget1, mockTarget2]);
    
    expect(result.files).toHaveLength(2);
    expect(result.files.find(f => f.path === 'output1.txt')).toBeDefined();
    expect(result.files.find(f => f.path === 'output2.txt')).toBeDefined();
  });

  it('merges files with same path (overwrite by default)', () => {
    const target1: Target = {
      name: 'target1',
      emit: () => ({ files: [{ path: 'same.txt', content: 'first' }] }),
    };
    const target2: Target = {
      name: 'target2',
      emit: () => ({ files: [{ path: 'same.txt', content: 'second' }] }),
    };

    const result = runCompile(mockIR, [target1, target2]);
    
    expect(result.files).toHaveLength(1);
    expect(result.files[0].path).toBe('same.txt');
    expect(result.files[0].content).toBe('second');
  });

  it('merges files with append strategy', () => {
    const target1: Target = {
      name: 'target1',
      emit: () => ({ files: [{ path: 'same.txt', content: 'first' }] }),
    };
    const target2: Target = {
      name: 'target2',
      emit: () => ({ files: [{ path: 'same.txt', content: 'second' }] }),
    };

    const result = runCompile(mockIR, [target1, target2], { mergeStrategy: 'append' });
    
    expect(result.files).toHaveLength(1);
    expect(result.files[0].path).toBe('same.txt');
    expect(result.files[0].content).toBe('first\nsecond');
  });
});
