# IR Toolkit

A modular monorepo for building intermediate representation (IR) compilers and code generation targets.

## 📦 Packages

This monorepo contains the following packages under the `@lordcraymen/ir-*` scope:

- **[@lordcraymen/ir-core](packages/ir-core)** - IR types and validators
- **[@lordcraymen/ir-caps](packages/ir-caps)** - Capability interfaces (FileSystem, Clock, Logger)
- **[@lordcraymen/ir-compiler-core](packages/ir-compiler-core)** - Core compiler orchestration
- **[@lordcraymen/ir-runtime-node](packages/ir-runtime-node)** - Node.js runtime implementations
- **[@lordcraymen/ir-target-typescript](packages/ir-target-typescript)** - TypeScript code generation target

## 🚀 Getting Started

### Local Development

```bash
# Install dependencies
npm ci

# Build all packages
npm run build

# Run tests
npm run test

# Run linting
npm run lint

# Type check
npm run typecheck

# Run smoke tests
npm run smoke

# Verify everything
npm run verify
```

## 📝 Release Workflow

This project uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

### Creating a Release

1. Make your changes
2. Add a changeset:
   ```bash
   npm run changeset:add
   ```
3. Commit the changeset file along with your changes
4. Create a PR and merge to `main`
5. The GitHub Actions release workflow will automatically:
   - Create a "Version Packages" PR with version bumps and changelogs
   - When that PR is merged, publish the packages to npm

## 🏗️ Architecture

- **Pure packages**: `ir-core`, `ir-caps`, `ir-compiler-core`, `ir-target-typescript` have no Node.js dependencies
- **Runtime package**: `ir-runtime-node` provides Node.js implementations of capabilities
- **ESM-first**: All packages are ESM modules with proper TypeScript declarations

## 📄 License

MIT © lordcraymen
