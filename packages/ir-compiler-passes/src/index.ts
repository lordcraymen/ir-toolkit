import type { IRProgram, IRNode } from '@lordcraymen/ir-core';


// Pass options that can be passed to runPasses
export interface PassOptions extends Record<string, unknown> {
  // Reserved for future use
}

// Pass interface for IR transformations
export interface Pass {
  name: string;
  transform(_ir: IRProgram, _options?: PassOptions): IRProgram;
}

// Helper to run a pipeline of passes
export function runPasses(
  ir: IRProgram,
  passes: Pass[],
  options?: PassOptions
): IRProgram {
  return passes.reduce((currentIR, pass) => {
    return pass.transform(currentIR, options);
  }, ir);
}

// Helper to deep clone IR (useful for pass implementations)
export function cloneIR(ir: IRProgram): IRProgram {
  return JSON.parse(JSON.stringify(ir));
}

// Helper to traverse IR nodes with a visitor function
export function traverseIR(
  node: IRNode,
  visitor: (_node: IRNode, _parent?: IRNode) => void,
  parent?: IRNode
): void {
  visitor(node, parent);
  if (node.children) {
    for (const child of node.children) {
      traverseIR(child, visitor, node);
    }
  }
}

// Helper to add metadata to IR nodes
export function addMetadata(
  node: IRNode,
  metadata: Record<string, unknown>
): IRNode {
  return {
    ...node,
    ...metadata,
  };
}
