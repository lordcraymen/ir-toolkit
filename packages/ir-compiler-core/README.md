# @lordcraymen/ir-compiler-core

Core compiler orchestration for the IR Toolkit.

## Overview

This package provides the core compilation infrastructure, including:
- Target interface for code generation
- Codegen pass system for customizing code generation
- Compilation orchestration

## Features

- **Target System**: Plugin architecture for multiple output languages
- **Codegen Passes**: Injectable code generation customization (Layer 2)
- **Multi-Target Compilation**: Generate code for multiple targets in one pass

## Usage

### Basic Compilation

\`\`\`typescript
import { runCompile } from '@lordcraymen/ir-compiler-core';
import { targetTypescript } from '@lordcraymen/ir-target-typescript';

const result = runCompile(ir, [targetTypescript]);
\`\`\`

### With Codegen Passes (Layer 2)

Codegen passes allow you to customize code generation at the target level:

\`\`\`typescript
import type { CodegenPass } from '@lordcraymen/ir-compiler-core';

// Define a target-specific codegen pass
const arrowFunctionPass: CodegenPass = (node, context) => {
  if (node.type === 'function') {
    // Generate arrow function syntax
    return \`const \${node.name} = () => { ... }\`;
  }
  return null; // Use default generation
};

// Inject pass into target
const result = runCompile(ir, [targetTypescript], {
  codegenPasses: {
    function: arrowFunctionPass
  }
});
\`\`\`

## Architecture

### Two-Layer Pass System

\`\`\`
IR (semantic)
  ↓
[Layer 1: IR Passes] - Target-agnostic transformations
  ↓
Transformed IR
  ↓
[Layer 2: Codegen Passes] - Target-specific generation ← YOU ARE HERE
  ↓
Code
\`\`\`

**Layer 2 (Codegen Passes)** customize how specific IR nodes are converted to code:
- TypeScript-specific: arrow functions, template literals, export styles
- Rust-specific: pub visibility, format! macros, impl blocks
- Language idioms and syntactic sugar

## Injectable Extension Points

### CodegenPass Interface

\`\`\`typescript
type CodegenPass = (node: IRNode, context: CodegenContext) => string | null;

interface CodegenContext {
  indent: string;
  defaultGenerator: (node: IRNode, indent: string) => string;
}
\`\`\`

**Return values:**
- \`string\`: Use this code (replaces default generation)
- \`null\`: Fall back to default generation

### CodegenPasses Configuration

\`\`\`typescript
interface CodegenPasses {
  function?: CodegenPass;    // Customize function generation
  expression?: CodegenPass;  // Customize expression generation
  literal?: CodegenPass;     // Customize literal generation
  return?: CodegenPass;      // Customize return statement generation
  [key: string]: CodegenPass | undefined;
}
\`\`\`

Passes are indexed by IR node type and receive nodes of that type.

## Example: Arrow Functions

\`\`\`typescript
const arrowFunctionPass: CodegenPass = (node, context) => {
  if (node.type === 'function') {
    const { defaultGenerator, indent } = context;
    // ... generate arrow function syntax
    return \`export const \${node.name} = () => { ... }\`;
  }
  return null;
};
\`\`\`

## License

UNLICENSED
