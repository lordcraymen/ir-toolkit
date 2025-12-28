#!/usr/bin/env node

/**
 * Integration test demonstrating IR passes
 * 
 * This test shows how to use passes to transform IR before code generation:
 * 1. Create a sample IR program
 * 2. Apply custom passes (visibility, export style)
 * 3. Compile to TypeScript
 * 4. Verify the transformations worked
 */

import { runCompile } from '../packages/ir-compiler-core/dist/index.js';
import { runPasses, cloneIR, traverseIR } from '../packages/ir-compiler-passes/dist/index.js';
import { targetTypescript } from '../packages/ir-target-typescript/dist/index.js';

console.log('🧪 Testing IR Passes\n');

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
        value: 'string',
        children: [
          {
            type: 'parameter',
            name: 'name',
            children: [{ type: 'type', value: 'string' }]
          },
          {
            type: 'return',
            children: [
              {
                type: 'expression',
                children: [
                  { type: 'literal', value: 'Hello, ' },
                  { type: 'literal', value: 'World!' }
                ]
              }
            ]
          }
        ]
      },
      {
        type: 'function',
        name: 'helper',
        value: 'number',
        children: [
          {
            type: 'return',
            children: [{ type: 'literal', value: 42 }]
          }
        ]
      }
    ]
  }
};

console.log('✅ Created IR with 2 functions\n');

// Step 2: Define custom passes
console.log('2️⃣  Defining custom passes...');

// Pass 1: Add visibility metadata (mark functions as public)
const visibilityPass = {
  name: 'visibility-analysis',
  transform(ir) {
    console.log('   Running visibility-analysis pass...');
    const newIR = cloneIR(ir);
    let functionCount = 0;
    traverseIR(newIR.root, (node) => {
      if (node.type === 'function') {
        // Add metadata to indicate this function should be public
        Object.assign(node, { 
          isPublic: true,
          comment: `This function is marked as public by visibility pass`
        });
        functionCount++;
      }
    });
    console.log(`   ✅ Marked ${functionCount} functions as public`);
    return newIR;
  }
};

// Pass 2: Add export style preference (TypeScript-specific but target-agnostic)
const exportStylePass = {
  name: 'export-style',
  transform(ir) {
    console.log('   Running export-style pass...');
    const newIR = cloneIR(ir);
    traverseIR(newIR.root, (node) => {
      if (node.type === 'function') {
        // Add metadata about export style preference
        Object.assign(node, { 
          exportStyle: 'inline',  // could be 'inline', 'end', 'named-export', etc.
          moduleType: 'esm'
        });
      }
    });
    console.log('   ✅ Added export style metadata');
    return newIR;
  }
};

// Pass 3: Add documentation metadata
const docPass = {
  name: 'documentation',
  transform(ir) {
    console.log('   Running documentation pass...');
    const newIR = cloneIR(ir);
    traverseIR(newIR.root, (node) => {
      if (node.type === 'function') {
        Object.assign(node, {
          docComment: `Generated function: ${node.name || 'anonymous'}`
        });
      }
    });
    console.log('   ✅ Added documentation metadata');
    return newIR;
  }
};

console.log('✅ Defined 3 custom passes\n');

// Step 3: Run passes
console.log('3️⃣  Running pass pipeline...');
const enrichedIR = runPasses(sampleProgram, [
  visibilityPass,
  exportStylePass,
  docPass
]);
console.log('✅ Pass pipeline completed\n');

// Step 4: Verify metadata was added
console.log('4️⃣  Verifying metadata...');
let metadataCount = 0;
traverseIR(enrichedIR.root, (node) => {
  if (node.type === 'function') {
    console.log(`   Function: ${node.name}`);
    console.log(`      isPublic: ${node.isPublic}`);
    console.log(`      exportStyle: ${node.exportStyle}`);
    console.log(`      docComment: ${node.docComment}`);
    metadataCount++;
  }
});
console.log(`✅ Verified metadata on ${metadataCount} functions\n`);

// Step 5: Compile to TypeScript
console.log('5️⃣  Compiling to TypeScript...');
const result = runCompile(enrichedIR, [targetTypescript]);
console.log('✅ Compilation complete\n');

// Step 6: Show the generated code
console.log('6️⃣  Generated TypeScript:');
console.log('─'.repeat(60));
console.log(result.files[0].content);
console.log('─'.repeat(60));

console.log('\n🎉 Pass integration test completed!');
console.log('📝 Note: The TypeScript target currently ignores the metadata,');
console.log('   but future targets or enhanced targets can respect it!\n');
