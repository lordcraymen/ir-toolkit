Du bist ein Senior DevOps/TypeScript Tooling Agent. Lege in einem neuen GitHub Repository ein Monorepo für eine modulare npm Library an. Publisher Scope ist @lordcraymen. Dieses Repo ist ausschließlich für die IR/Compiler/Targets Suite. Andere unrelated Packages existieren im Scope, deshalb verwenden wir einen Prefix: alle Packages heißen @lordcraymen/ir-*

Repo Name
- GitHub repository name: ir-toolkit

Ziele
- Monorepo mit npm workspaces (NICHT pnpm/yarn).
- Multi-package publish auf npm unter @lordcraymen/ir-*.
- Changesets für Versioning/Changelogs/Releases.
- GitHub Actions CI: lint/test/build auf PRs + main.
- GitHub Actions Release: bei Push auf main, wenn Changesets vorhanden sind -> Version bump, Changelog, Git Tag, npm publish.
- ESM-first, TypeScript build + .d.ts output.
- Saubere package exports (exports map), files whitelist, repository metadata.

Pakete (unter packages/*)
1) @lordcraymen/ir-core
   - IR Types + Validatoren.
   - Pure, keine Node APIs.
2) @lordcraymen/ir-caps
   - Nur Interfaces/Types für Capabilities: FileSystem, Clock, Logger.
   - Pure, keine Node APIs.
3) @lordcraymen/ir-compiler-core
   - Pure Orchestrierung: nimmt IR + Targets, gibt EmitResult (Dateiliste) zurück.
   - Abhängig von ir-core und ir-caps.
4) @lordcraymen/ir-runtime-node
   - Node Implementierungen für caps (fs/clock/logger) + helper, optional eine kleine CLI.
   - Abhängig von ir-caps und ir-compiler-core.
5) @lordcraymen/ir-target-typescript
   - Pure Target: emit(ir)-> files[] (Strings), keine FS.
   - Abhängig von ir-core.

Technische Entscheidungen
- Package Manager: npm (workspaces).
- Node Version: 20 LTS für CI.
- Build: tsup (ESM output) + d.ts generation.
- Lint: eslint (minimal).
- Test: vitest (smoke tests, snapshots optional).
- Each package has: src/index.ts, dist output, build/test scripts, README.md (kurz), LICENSE am root (und packaged via files whitelist).

Repo Struktur (Soll)
- package.json (private true, workspaces, scripts)
- package-lock.json (committen, für deterministische installs)
- tsconfig.base.json
- eslint config (eslint.config.js)
- .changeset/config.json
- .github/workflows/ci.yml
- .github/workflows/release.yml
- packages/<pkg>/package.json + src/*
- Optional: .npmrc (registry defaults), aber keep simple.

Root package.json Anforderungen
- private: true
- workspaces: ["packages/*"]
- scripts:
  - "ci:install": "npm ci"
  - "lint": "eslint ."
  - "test": "npm run -ws test"
  - "build": "npm run -ws build"
  - "typecheck": "tsc -p tsconfig.base.json --noEmit" ODER per workspace (wenn du lieber pro package tsconfig checkst)
  - "verify": "npm run ci:install && npm run lint && npm run test && npm run build"
  - "changeset:add": "changeset add"
  - "changeset:version": "changeset version"
  - "changeset:publish": "changeset publish"
- devDependencies: typescript, tsup, eslint, vitest, @changesets/cli, ggf. @types/node (nur wenn nötig, aber runtime-node braucht es).

Per-package package.json Anforderungen
- name exakt wie oben
- version "0.1.0"
- type "module"
- exports map korrekt:
  - "." -> dist/index.js + dist/index.d.ts
- main/types passend
- files whitelist: ["dist", "README.md", "LICENSE"]
- scripts:
  - "build": "tsup src/index.ts --format esm --dts --clean"
  - "test": "vitest run"
- publishConfig: { "access": "public" }
- repository/bugs/homepage Felder gesetzt (auf dieses GitHub repo)
- dependencies:
  - ir-compiler-core: depends on @lordcraymen/ir-core + @lordcraymen/ir-caps
  - ir-runtime-node: depends on @lordcraymen/ir-caps + @lordcraymen/ir-compiler-core
  - ir-target-typescript: depends on @lordcraymen/ir-core
  - ir-caps: keine runtime deps
  - ir-core: möglichst wenig deps

TypeScript Setup
- Root tsconfig.base.json (composite optional)
- Pro package ein tsconfig.json, extends root, includes src.
- Ziel: tsup baut; typecheck soll deterministisch grün sein.

Minimal Code (damit build/test grün sind)
- @lordcraymen/ir-core:
  - export type/union z.B. IRProgram, IRNode
  - export function validate(program): { ok: boolean, errors: string[] }
- @lordcraymen/ir-caps:
  - export interfaces FileSystem (readFile/writeFile/mkdirp), Clock (now), Logger (info/warn/error)
- @lordcraymen/ir-compiler-core:
  - export types: EmitFile { path, content }, EmitResult { files }
  - export interface Target { name; emit(ir, opts?): EmitResult }
  - export function runCompile(ir, targets, options?) -> merged EmitResult
- @lordcraymen/ir-runtime-node:
  - export function createNodeCaps(): Caps implementations using node:fs/promises, Date.now, console.*
  - optional: export async function writeEmitResult(fsCaps, result, outDir)
  - keep it small; tests must cover createNodeCaps shape.
- @lordcraymen/ir-target-typescript:
  - export const targetTypescript: Target
  - emits one file "index.ts" with deterministic content from IR (e.g. a comment with node count).

Tests (deterministisch, ohne Netzwerk, ohne Uhrzeit)
- Vitest in jedem package:
  - ir-core: validate() returns ok for minimal IR and errors for invalid IR.
  - ir-target-typescript: emit returns expected file list + exact content snapshot.
  - compiler-core: runCompile merges results deterministically.
  - runtime-node: createNodeCaps returns functions; mock fs usage where needed; avoid touching real filesystem OR use vitest tmp dir with deterministic paths.
- IMPORTANT: Do not include timestamps in outputs; no Date.now() in generated file content.

Changesets
- .changeset/config.json so, dass packages independently versioned sind (not fixed).
- Add one initial changeset file that bumps all packages as "patch" OR none; choose "none" if you want an initially clean state. (Prefer: create an initial changeset so release workflow can be tested.)

CI Workflow (.github/workflows/ci.yml)
- Trigger: pull_request, push (main)
- Steps:
  - checkout
  - setup-node (node-version: 20, cache: npm)
  - npm ci
  - npm run lint
  - npm run test
  - npm run build
- Must be deterministic: rely on package-lock.json.

Release Workflow (.github/workflows/release.yml)
- Trigger: push (main)
- Use changesets/action OR custom:
  - install via npm ci
  - run changeset version (only if changesets exist)
  - commit version bumps + changelogs
  - publish via changeset publish
- Auth:
  - NPM_TOKEN secret
  - permissions: contents write, pull-requests write (if using changesets/action PR)
- Make sure workflow does NOT publish on PRs.

Deterministische Verifikations-Schritte (Agent muss diese ausführen und reporten)
1) `node -v` should be >= 20.x in CI config.
2) `npm ci` succeeds from a clean checkout.
3) `npm run lint` exits 0.
4) `npm run test` exits 0.
5) `npm run build` exits 0 and creates dist/ in each package.
6) `npm pack -w @lordcraymen/ir-core` (und für jedes Package) succeeds and tarball contains ONLY dist + README + LICENSE.
7) `node -e "import('@lordcraymen/ir-core')"` style smoke check locally is not possible without publish; instead do workspace import checks:
   - create a tiny script in /tooling/smoke.mjs that imports each package from workspace and runs a tiny function; run it in `npm run smoke`.
   - Add root script: "smoke": "node tooling/smoke.mjs"
   - Ensure `npm run smoke` exits 0.

Dokumentation
- Root README:
  - list packages + purpose
  - local dev: npm ci, npm run verify
  - release: add changeset, merge to main triggers release workflow
- Keep short.

Abschluss
- Stelle sicher, dass alle Dateien committed sind (inkl. package-lock.json).
- Gib am Ende eine Liste der angelegten Dateien, die Scripts und die Verify-Kommandos aus, die erfolgreich liefen.
# TODO.md