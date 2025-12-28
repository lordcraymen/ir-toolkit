# @lordcraymen/ir-compiler-passes

Pass infrastructure for IR transformations.

## Overview

This package provides the foundation for creating IR transformation passes. Passes are pure functions that transform IR programs, allowing you to enrich, validate, or optimize your IR before code generation.

## Features

- **Pass Interface**: Simple `IRProgram → IRProgram` transformation contract
- **Pass Pipeline**: Chain multiple passes together
- **Target-Agnostic**: Passes work with IR structure, not specific targets

## Usage

```typescript
import { runPasses, type Pass } from '@lordcraymen/ir-compiler-passes';
import type { IRProgram } from '@lordcraymen/ir-core';

// Define a pass
const myPass: Pass = {
  name: 'my-transformation',
  transform(ir, options) {
    // Transform IR and return new IR
    return transformedIR;
  }
};

// Run passes
const enrichedIR = runPasses(originalIR, [
  myPass,
  anotherPass
]);
```

## Architecture

Passes use metadata on IR nodes to communicate with targets:

```typescript
const visibilityPass: Pass = {
  name: 'visibility',
  transform(ir) {
    // Add metadata that targets can respect
    return addMetadata(ir, { public: true });
  }
};
```

## License

UNLICENSED
