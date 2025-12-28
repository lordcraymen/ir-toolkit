import type { IRProgram, IRNode } from '@lordcraymen/ir-core';

// Emit types
export interface EmitFile {
  path: string;
  content: string;
}

export interface EmitResult {
  files: EmitFile[];
}

// Codegen pass - target-specific code generation
// These are injected into targets to customize code generation
export type CodegenPass = (_node: IRNode, _context: CodegenContext) => string | null;

export interface CodegenContext {
  indent: string;
  defaultGenerator: (_node: IRNode, _indent: string) => string;
}

// Codegen passes organized by node type
export interface CodegenPasses {
  function?: CodegenPass;
  expression?: CodegenPass;
  literal?: CodegenPass;
  return?: CodegenPass;
  [key: string]: CodegenPass | undefined;
}

// Target interface
export interface Target {
  name: string;
  emit(_ir: IRProgram, _options?: Record<string, unknown>): EmitResult;
}

// Compiler options
export interface CompileOptions extends Record<string, unknown> {
  mergeStrategy?: 'append' | 'overwrite';
}

// Main compile function
export function runCompile(
  ir: IRProgram,
  targets: Target[],
  options?: CompileOptions
): EmitResult {
  const allFiles: EmitFile[] = [];
  const fileMap = new Map<string, string>();

  for (const target of targets) {
    const result = target.emit(ir, options);
    
    for (const file of result.files) {
      if (options?.mergeStrategy === 'append' && fileMap.has(file.path)) {
        // Append to existing content
        const existing = fileMap.get(file.path)!;
        fileMap.set(file.path, existing + '\n' + file.content);
      } else {
        // Overwrite (default)
        fileMap.set(file.path, file.content);
      }
    }
  }

  // Convert map back to array
  for (const [path, content] of fileMap.entries()) {
    allFiles.push({ path, content });
  }

  return { files: allFiles };
}
