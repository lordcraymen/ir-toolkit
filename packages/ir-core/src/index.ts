// IR Node Types
export type IRNodeType = 'program' | 'statement' | 'expression' | 'literal';

export interface IRNode {
  type: IRNodeType;
  value?: unknown;
  children?: IRNode[];
}

export interface IRProgram {
  version: string;
  root: IRNode;
}

// Validation types
export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

// Validate function
export function validate(program: unknown): ValidationResult {
  if (!program || typeof program !== 'object') {
    return { ok: false, errors: ['Program must be an object'] };
  }

  const p = program as Record<string, unknown>;

  if (!p.version || typeof p.version !== 'string') {
    return { ok: false, errors: ['Program must have a version string'] };
  }

  if (!p.root || typeof p.root !== 'object') {
    return { ok: false, errors: ['Program must have a root node'] };
  }

  const root = p.root as Record<string, unknown>;
  if (!root.type || typeof root.type !== 'string') {
    return { ok: false, errors: ['Root node must have a type string'] };
  }

  return { ok: true, errors: [] };
}
