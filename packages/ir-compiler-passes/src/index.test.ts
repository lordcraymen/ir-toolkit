import { describe, it, expect } from 'vitest';
import { runPasses, cloneIR, traverseIR, addMetadata, type Pass } from './index';
import type { IRProgram, IRNode } from '@lordcraymen/ir-core';

describe('ir-compiler-passes', () => {
  const sampleIR: IRProgram = {
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

  describe('runPasses', () => {
    it('should return original IR when no passes provided', () => {
      const result = runPasses(sampleIR, []);
      expect(result).toEqual(sampleIR);
    });

    it('should run a single pass', () => {
      const addVersionPass: Pass = {
        name: 'add-version',
        transform: (ir) => ({
          ...ir,
          version: '2.0.0',
        }),
      };

      const result = runPasses(sampleIR, [addVersionPass]);
      expect(result.version).toBe('2.0.0');
    });

    it('should run multiple passes in sequence', () => {
      const pass1: Pass = {
        name: 'pass1',
        transform: (ir) => ({
          ...ir,
          version: 'pass1',
        }),
      };

      const pass2: Pass = {
        name: 'pass2',
        transform: (ir) => ({
          ...ir,
          version: ir.version + '-pass2',
        }),
      };

      const result = runPasses(sampleIR, [pass1, pass2]);
      expect(result.version).toBe('pass1-pass2');
    });

    it('should pass options to each pass', () => {
      const optionsPass: Pass = {
        name: 'options-pass',
        transform: (ir, options) => ({
          ...ir,
          version: (options?.testOption as string) || 'default',
        }),
      };

      const result = runPasses(sampleIR, [optionsPass], { testOption: 'custom' });
      expect(result.version).toBe('custom');
    });
  });

  describe('cloneIR', () => {
    it('should create a deep clone of IR', () => {
      const clone = cloneIR(sampleIR);
      expect(clone).toEqual(sampleIR);
      expect(clone).not.toBe(sampleIR);
      expect(clone.root).not.toBe(sampleIR.root);
      expect(JSON.stringify(clone)).toBe(JSON.stringify(sampleIR));
    });

    it('should not affect original when clone is modified', () => {
      const clone = cloneIR(sampleIR);
      clone.version = 'modified';
      expect(sampleIR.version).toBe('1.0.0');
    });
  });

  describe('traverseIR', () => {
    it('should visit all nodes', () => {
      const visited: string[] = [];
      traverseIR(sampleIR.root, (node) => {
        visited.push(node.type);
      });

      expect(visited).toContain('program');
      expect(visited).toContain('function');
      expect(visited).toContain('parameter');
      expect(visited).toContain('return');
      expect(visited).toContain('expression');
      expect(visited).toContain('literal');
    });

    it('should provide parent node to visitor', () => {
      let functionParent: IRNode | undefined;
      traverseIR(sampleIR.root, (node, parent) => {
        if (node.type === 'function') {
          functionParent = parent;
        }
      });

      expect(functionParent?.type).toBe('program');
    });
  });

  describe('addMetadata', () => {
    it('should add metadata to node', () => {
      const node: IRNode = { type: 'function', name: 'test' };
      const result = addMetadata(node, { public: true, exportStyle: 'end' });

      expect(result).toMatchObject({
        type: 'function',
        name: 'test',
        public: true,
        exportStyle: 'end',
      });
    });

    it('should not mutate original node', () => {
      const node: IRNode = { type: 'function', name: 'test' };
      addMetadata(node, { public: true });

      expect(node).toEqual({ type: 'function', name: 'test' });
    });
  });

  describe('Pass composition example', () => {
    it('should compose multiple passes for a real transformation', () => {
      // Pass 1: Add visibility metadata
      const visibilityPass: Pass = {
        name: 'visibility',
        transform: (ir) => {
          const newIR = cloneIR(ir);
          traverseIR(newIR.root, (node) => {
            if (node.type === 'function') {
              Object.assign(node, { public: true });
            }
          });
          return newIR;
        },
      };

      // Pass 2: Add export style metadata
      const stylePass: Pass = {
        name: 'export-style',
        transform: (ir) => {
          const newIR = cloneIR(ir);
          traverseIR(newIR.root, (node) => {
            if (node.type === 'function') {
              Object.assign(node, { exportStyle: 'end' });
            }
          });
          return newIR;
        },
      };

      const result = runPasses(sampleIR, [visibilityPass, stylePass]);

      // Check that function has both metadata
      const func = result.root.children?.[0] as IRNode & { public?: boolean; exportStyle?: string };
      expect(func.public).toBe(true);
      expect(func.exportStyle).toBe('end');
    });
  });
});
