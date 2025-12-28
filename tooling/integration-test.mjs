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

// Try to import Rust target, but continue if not available
let targetRust = null;
try {
  const rustModule = await import('../packages/ir-target-rust/dist/index.js');
  targetRust = rustModule.targetRust;
} catch (e) {
  console.log('⚠️  Rust target not available, skipping Rust code generation');
}

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

// Step 3: Compile IR to multiple targets
console.log('3️⃣  Compiling IR to TypeScript' + (targetRust ? ' and Rust' : '') + '...');
const tsResult = runCompile(sampleProgram, [targetTypescript]);
const rustResult = targetRust ? runCompile(sampleProgram, [targetRust]) : null;

if (!tsResult.files || tsResult.files.length === 0) {
  console.error('❌ TypeScript compilation produced no output files');
  process.exit(1);
}

if (targetRust && (!rustResult.files || rustResult.files.length === 0)) {
  console.error('❌ Rust compilation produced no output files');
  process.exit(1);
}

const totalFiles = tsResult.files.length + (rustResult ? rustResult.files.length : 0);
console.log(`✅ Generated ${totalFiles} file(s)\n`);

// Step 4: Write output and verify syntax
console.log('4️⃣  Verifying generated code...');

try {
  // Create output directory (clean if exists)
  rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(TEST_OUTPUT_DIR, { recursive: true });

  // Write TypeScript files
  const tsDir = join(TEST_OUTPUT_DIR, 'typescript');
  mkdirSync(tsDir, { recursive: true });
  for (const file of tsResult.files) {
    const filePath = join(tsDir, file.path);
    writeFileSync(filePath, file.content, 'utf8');
    console.log(`   📄 typescript/${file.path}`);
  }

  // Write Rust files
  if (targetRust && rustResult) {
    const rustDir = join(TEST_OUTPUT_DIR, 'rust');
    mkdirSync(rustDir, { recursive: true });
    for (const file of rustResult.files) {
      const filePath = join(rustDir, file.path);
      writeFileSync(filePath, file.content, 'utf8');
      console.log(`   📄 rust/${file.path}`);
    }
  }

  // Verify TypeScript syntax using tsc
  console.log('\n   Validating TypeScript...');
  execSync(`npx tsc --noEmit --skipLibCheck ${tsDir}/*.ts`, {
    stdio: 'pipe',
    encoding: 'utf8'
  });
  console.log('   ✅ TypeScript is syntactically valid');
  
  // Verify Rust syntax if rustc is available
  if (targetRust && rustResult) {
    console.log('\n   Validating Rust...');
    try {
      // Check if rustc is available
      execSync('rustc --version', { stdio: 'pipe' });
      // Use rustc to check syntax without linking
      const rustDir = join(TEST_OUTPUT_DIR, 'rust');
      execSync(`rustc --crate-type lib --emit=metadata -o /dev/null ${rustDir}/lib.rs 2>&1`, {
        stdio: 'pipe',
        encoding: 'utf8'
      });
      console.log('   ✅ Rust is syntactically valid');
    } catch (rustError) {
      if (rustError.message.includes('rustc --version')) {
        console.log('   ⚠️  Rust compiler not found, skipping Rust validation');
      } else {
        throw rustError;
      }
    }
  }

  // Show generated content
  console.log('\n📋 Generated TypeScript:');
  console.log('─'.repeat(60));
  console.log(tsResult.files[0].content);
  console.log('─'.repeat(60));
  
  if (targetRust && rustResult) {
    console.log('\n📋 Generated Rust:');
    console.log('─'.repeat(60));
    console.log(rustResult.files[0].content);
    console.log('─'.repeat(60));
  }

} catch (error) {
  console.error('❌ Validation failed:');
  console.error(error.message);
  
  // Show the generated content for debugging
  console.log('\n📋 Generated TypeScript (for debugging):');
  console.log('─'.repeat(60));
  console.log(tsResult.files[0].content);
  console.log('─'.repeat(60));
  
  if (targetRust && rustResult) {
    console.log('\n📋 Generated Rust (for debugging):');
    console.log('─'.repeat(60));
    console.log(rustResult.files[0].content);
    console.log('─'.repeat(60));
  }
  
  // Clean up on error
  rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  process.exit(1);
}

console.log('\n🎉 Integration test passed! IR pipeline works correctly.');
console.log(`📁 Generated files available in: ${TEST_OUTPUT_DIR}/\n`);
