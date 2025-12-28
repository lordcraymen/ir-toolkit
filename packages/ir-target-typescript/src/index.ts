import type { IRProgram, IRNode } from '@lordcraymen/ir-core';
import type { Target, EmitResult } from '@lordcraymen/ir-compiler-core';

// Generate TypeScript code from IR node
function generateNode(node: IRNode, indent: string = ''): string {
  switch (node.type) {
    case 'program':
      return (node.children || []).map(child => generateNode(child, indent)).join('\n\n');
    
    case 'function': {
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
      const bodyStr = body.map(b => generateNode(b, indent + '  ')).join('\n');
      
      return `${indent}export function ${name}(${paramStr}): ${returnType} {\n${bodyStr}\n${indent}}`;
    }
    
    case 'return': {
      const expr = node.children?.[0];
      const exprStr = expr ? generateNode(expr, indent) : '';
      return `${indent}  return ${exprStr};`;
    }
    
    case 'expression': {
      const parts = (node.children || []).map(c => generateNode(c, indent));
      // Concatenate string literals with +
      if (parts.length > 1 && node.children?.every(c => c.type === 'literal' && typeof c.value === 'string')) {
        return parts.join(' + ');
      }
      return parts.join(' ');
    }
    
    case 'literal':
      return typeof node.value === 'string' ? `"${node.value}"` : String(node.value);
    
    default:
      return '';
  }
}

// TypeScript Target implementation
export const targetTypescript: Target = {
  name: 'typescript',
  emit(ir: IRProgram, _options?: Record<string, unknown>): EmitResult {
    const content = `// Generated from IR v${ir.version}\n\n${generateNode(ir.root)}\n`;

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
