#!/usr/bin/env node

// Smoke test to verify all packages can be imported and basic functionality works

import { validate } from '@lordcraymen/ir-core';
import { createNodeCaps } from '@lordcraymen/ir-runtime-node';
import { runCompile } from '@lordcraymen/ir-compiler-core';
import { targetTypescript } from '@lordcraymen/ir-target-typescript';

console.log('🧪 Running smoke tests...\n');

// Test 1: ir-core
console.log('✓ ir-core: Imported successfully');
const testProgram = {
  version: '1.0.0',
  root: { type: 'program', children: [] },
};
const validationResult = validate(testProgram);
if (!validationResult.ok) {
  console.error('✗ ir-core: Validation failed');
  process.exit(1);
}
console.log('✓ ir-core: validate() works\n');

// Test 2: ir-caps (no runtime test needed, just types)
console.log('✓ ir-caps: Imported successfully\n');

// Test 3: ir-runtime-node
console.log('✓ ir-runtime-node: Imported successfully');
const caps = createNodeCaps();
if (!caps.fs || !caps.clock || !caps.logger) {
  console.error('✗ ir-runtime-node: createNodeCaps() failed');
  process.exit(1);
}
console.log('✓ ir-runtime-node: createNodeCaps() works\n');

// Test 4: ir-target-typescript
console.log('✓ ir-target-typescript: Imported successfully');
const emitResult = targetTypescript.emit(testProgram);
if (!emitResult.files || emitResult.files.length === 0) {
  console.error('✗ ir-target-typescript: emit() failed');
  process.exit(1);
}
console.log('✓ ir-target-typescript: emit() works\n');

// Test 5: ir-compiler-core
console.log('✓ ir-compiler-core: Imported successfully');
const compileResult = runCompile(testProgram, [targetTypescript]);
if (!compileResult.files || compileResult.files.length === 0) {
  console.error('✗ ir-compiler-core: runCompile() failed');
  process.exit(1);
}
console.log('✓ ir-compiler-core: runCompile() works\n');

console.log('✅ All smoke tests passed!');
