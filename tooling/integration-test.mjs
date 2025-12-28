#!/usr/bin/env node

/**
 * Integration test for IR pipeline
 * 
 * This test validates that the IR pipeline works end-to-end:
 * 1. Create a sample IR program
 * 2. Compile it to TypeScript
 * 3. Verify the generated TypeScript is valid
 */

import { validate } from '../packages/ir-core/dist/index.js';
import { runCompile } from '../packages/ir-compiler-core/dist/index.js';
import { targetTypescript } from '../packages/ir-target-typescript/dist/index.js';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const TEST_OUTPUT_DIR = '.test-output';

console.log('🧪 Running IR Pipeline Integration Test\n');

// Step 1: Create a sample IR program
console.log('1️⃣  Creating sample IR program...');
const sampleProgram = {
  version: '1.0.0',
  root: {
    type: 'program',
    children: [
      {
        type: 'function',
        name: 'greet',
        value: 'string',  // return type
        children: [
          {
            type: 'parameter',
            name: 'name',
            children: [
              {
                type: 'type',
                value: 'string'
              }
            ]
          },
          {
            type: 'parameter',
            name: 'age',
            children: [
              {
                type: 'type',
                value: 'number'
              }
            ]
          },
          {
            type: 'return',
            children: [
              {
                type: 'expression',
                children: [
                  {
                    type: 'literal',
                    value: 'Hello, '
                  },
                  {
                    type: 'literal',
                    value: 'World!'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

// Step 2: Validate the IR program
console.log('2️⃣  Validating IR program...');
const validationResult = validate(sampleProgram);
if (!validationResult.ok) {
  console.error('❌ IR validation failed:', validationResult.errors);
  process.exit(1);
}
console.log('✅ IR program is valid\n');

// Step 3: Compile IR to TypeScript
console.log('3️⃣  Compiling IR to TypeScript...');
const compileResult = runCompile(sampleProgram, [targetTypescript]);

if (!compileResult.files || compileResult.files.length === 0) {
  console.error('❌ Compilation produced no output files');
  process.exit(1);
}

console.log(`✅ Generated ${compileResult.files.length} file(s)\n`);

// Step 4: Write output and verify it's valid TypeScript
console.log('4️⃣  Verifying generated TypeScript...');

try {
  // Create output directory (clean if exists)
  rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(TEST_OUTPUT_DIR, { recursive: true });

  // Write generated files
  for (const file of compileResult.files) {
    const filePath = join(TEST_OUTPUT_DIR, file.path);
    writeFileSync(filePath, file.content, 'utf8');
    console.log(`   📄 ${file.path}`);
  }

  // Verify TypeScript syntax using tsc
  console.log('\n   Running TypeScript compiler...');
  execSync(`npx tsc --noEmit --skipLibCheck ${TEST_OUTPUT_DIR}/*.ts`, {
    stdio: 'pipe',
    encoding: 'utf8'
  });
  
  console.log('✅ TypeScript is syntactically valid\n');

  // Show generated content
  console.log('📋 Generated content:');
  console.log('─'.repeat(60));
  console.log(compileResult.files[0].content);
  console.log('─'.repeat(60));

} catch (error) {
  console.error('❌ TypeScript validation failed:');
  console.error(error.message);
  
  // Show the generated content for debugging
  console.log('\n📋 Generated content (for debugging):');
  console.log('─'.repeat(60));
  console.log(compileResult.files[0].content);
  console.log('─'.repeat(60));
  
  // Clean up on error
  rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  process.exit(1);
}

console.log('\n🎉 Integration test passed! IR pipeline works correctly.');
console.log(`📁 Generated files available in: ${TEST_OUTPUT_DIR}/\n`);
