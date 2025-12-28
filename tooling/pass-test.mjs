#!/usr/bin/env node

/**
 * Integration test demonstrating two-layer pass architecture
 * 
 * Layer 1: IR Passes (target-agnostic semantic transformations)
 * Layer 2: Codegen Passes (target-specific code generation)
 * 
 * This demonstrates:
 * 1. Constant folding (IR pass - structural transformation)
 * 2. Arrow function generation (Codegen pass - TypeScript-specific)
 */

import { runCompile } from '../packages/ir-compiler-core/dist/index.js';
import { runPasses, cloneIR, traverseIR } from '../packages/ir-compiler-passes/dist/index.js';
import { targetTypescript } from '../packages/ir-target-typescript/dist/index.js';

console.log('🧪 Two-Layer Pass Architecture Demo\n');
console.log('═'.repeat(60));

// Step 1: Create a sample IR program with string concatenation
console.log('\n1️⃣  Creating sample IR program...');
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
                  { type: 'literal', value: 'World' },
                  { type: 'literal', value: '!' }
                ]
              }
            ]
          }
        ]
      },
      {
        type: 'function',
        name: 'getNumber',
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

console.log('✅ Created IR with string concatenation: "Hello, " + "World" + "!"');

// Compile WITHOUT any passes first
console.log('\n2️⃣  Compiling WITHOUT passes (baseline)...');
const baselineResult = runCompile(sampleProgram, [targetTypescript]);
console.log('─'.repeat(60));
console.log(baselineResult.files[0].content);
console.log('─'.repeat(60));

// Step 2: Define Layer 1 - IR Passes (target-agnostic)
console.log('\n3️⃣  LAYER 1: Defining IR passes (target-agnostic)...');

// Constant folding pass - combines consecutive string literals
const constantFoldingPass = {
  name: 'constant-folding',
  transform(ir) {
    console.log('   🔧 Running constant-folding pass...');
    const newIR = cloneIR(ir);
    let foldCount = 0;
    
    traverseIR(newIR.root, (node) => {
      if (node.type === 'expression' && node.children) {
        // Check if all children are string literals
        const allStrings = node.children.every(
          c => c.type === 'literal' && typeof c.value === 'string'
        );
        
        if (allStrings && node.children.length > 1) {
          // Fold into single literal
          const combined = node.children
            .map(c => c.value)
            .join('');
          node.children = [{ type: 'literal', value: combined }];
          foldCount++;
          console.log(`   ✅ Folded string literals: "${combined}"`);
        }
      }
    });
    
    console.log(`   📊 Total expressions folded: ${foldCount}`);
    return newIR;
  }
};

console.log('✅ Defined constant-folding pass (transforms IR structure)');

// Step 3: Run IR passes
console.log('\n4️⃣  Running Layer 1 passes...');
const enrichedIR = runPasses(sampleProgram, [constantFoldingPass]);
console.log('✅ IR transformation complete\n');

// Compile with IR passes but NO codegen passes
console.log('5️⃣  Compiling with IR passes only...');
const irPassResult = runCompile(enrichedIR, [targetTypescript]);
console.log('─'.repeat(60));
console.log(irPassResult.files[0].content);
console.log('─'.repeat(60));
console.log('📝 Note: String concatenation eliminated by IR pass!\n');

// Step 4: Define Layer 2 - Codegen Passes (TypeScript-specific)
console.log('6️⃣  LAYER 2: Defining codegen passes (TypeScript-specific)...');

// Arrow function codegen pass - generates arrow function syntax
const arrowFunctionPass = (node, context) => {
  if (node.type === 'function') {
    const name = node.name || 'anonymous';
    const params = node.children?.filter(n => n.type === 'parameter') || [];
    const body = node.children?.filter(n => n.type !== 'parameter') || [];
    
    const paramStr = params.map(p => {
      const paramName = p.name || 'arg';
      const typeNode = p.children?.find(n => n.type === 'type');
      const typeName = typeNode?.value || 'any';
      return `${paramName}: ${typeName}`;
    }).join(', ');
    
    const returnType = node.value || 'void';
    const bodyStr = body.map(b => context.defaultGenerator(b, context.indent + '  ')).join('\n');
    
    // Generate arrow function instead of regular function
    return `${context.indent}export const ${name} = (${paramStr}): ${returnType} => {\n${bodyStr}\n${context.indent}};`;
  }
  return null; // Let default generator handle it
};

// Template literal codegen pass - uses template literals for strings
const templateLiteralPass = (node) => {
  if (node.type === 'literal' && typeof node.value === 'string') {
    // Use template literal instead of double quotes
    return `\`${node.value}\``;
  }
  return null;
};

console.log('✅ Defined arrow function pass (changes function syntax)');
console.log('✅ Defined template literal pass (changes string syntax)');

// Step 5: Compile with BOTH layers
console.log('\n7️⃣  Compiling with BOTH IR passes + Codegen passes...');
const fullResult = runCompile(enrichedIR, [targetTypescript], {
  codegenPasses: {
    function: arrowFunctionPass,
    literal: templateLiteralPass
  }
});
console.log('─'.repeat(60));
console.log(fullResult.files[0].content);
console.log('─'.repeat(60));

// Summary
console.log('\n🎉 Two-Layer Pass Architecture Demo Complete!\n');
console.log('📋 Summary:');
console.log('   Layer 1 (IR Passes): Constant folding - semantic transformation');
console.log('   Layer 2 (Codegen Passes): Arrow functions + template literals');
console.log('\n💡 Key Insights:');
console.log('   ✅ IR passes are target-agnostic (work for any language)');
console.log('   ✅ Codegen passes are target-specific (TypeScript syntax)');
console.log('   ✅ Both layers are orthogonal and composable');
console.log('   ✅ Users define passes in their projects, not in toolkit\n');

