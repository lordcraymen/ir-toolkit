import type { IRProgram, IRNode } from '@lordcraymen/ir-core';
import type { Target, EmitResult } from '@lordcraymen/ir-compiler-core';

// Type mapping from IR types to Rust types
function mapType(irType: string): string {
  const typeMap: Record<string, string> = {
    'string': 'String',
    'number': 'i32',
    'boolean': 'bool',
    'void': '()',
  };
  return typeMap[irType] || irType;
}

// Generate Rust code from IR node
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
        const typeName = typeNode?.value ? mapType(String(typeNode.value)) : 'i32';
        // Use borrowed string references for String parameters
        const rustType = typeName === 'String' ? '&str' : typeName;
        return `${paramName}: ${rustType}`;
      }).join(', ');
      
      const returnType = node.value ? mapType(String(node.value)) : '()';
      const bodyStr = body.map(b => generateNode(b, indent + '    ')).join('\n');
      
      return `${indent}pub fn ${name}(${paramStr}) -> ${returnType} {\n${bodyStr}\n${indent}}`;
    }
    
    case 'return': {
      const expr = node.children?.[0];
      const exprStr = expr ? generateNode(expr, indent) : '';
      return `${indent}    ${exprStr}`;
    }
    
    case 'expression': {
      const parts = (node.children || []).map(c => generateNode(c, indent));
      // Concatenate string literals with format! or to_string()
      if (parts.length > 1 && node.children?.every(c => c.type === 'literal' && typeof c.value === 'string')) {
        return `format!("{}{}", ${parts.join(', ')})`;
      }
      return parts.join(' ');
    }
    
    case 'literal':
      if (typeof node.value === 'string') {
        return `"${node.value}"`;
      }
      return String(node.value);
    
    default:
      return '';
  }
}

// Rust Target implementation
export const targetRust: Target = {
  name: 'rust',
  emit(ir: IRProgram, _options?: Record<string, unknown>): EmitResult {
    const content = `// Generated from IR v${ir.version}\n\n${generateNode(ir.root)}\n`;

    return {
      files: [
        {
          path: 'lib.rs',
          content,
        },
      ],
    };
  },
};
