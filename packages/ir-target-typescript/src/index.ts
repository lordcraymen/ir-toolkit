import type { IRProgram, IRNode } from '@lordcraymen/ir-core';
import type { Target, EmitResult } from '@lordcraymen/ir-compiler-core';

// Count nodes in IR tree
function countNodes(node: IRNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

// TypeScript Target implementation
export const targetTypescript: Target = {
  name: 'typescript',
  emit(ir: IRProgram, _options?: Record<string, unknown>): EmitResult {
    const nodeCount = countNodes(ir.root);
    
    const content = `// Generated from IR v${ir.version}
// Total nodes: ${nodeCount}

export interface GeneratedProgram {
  version: string;
  nodeCount: number;
}

export const program: GeneratedProgram = {
  version: '${ir.version}',
  nodeCount: ${nodeCount},
};
`;

    return {
      files: [
        {
          path: 'index.ts',
          content,
        },
      ],
    };
  },
};
