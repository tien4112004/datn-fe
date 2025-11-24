<!--
Sync Impact Report:
- Version change: Initial → 1.0.0
- Added principles:
  * I. Component Modularity (NEW)
  * II. Type Safety & Quality Enforcement (NEW)
  * III. Code Maintainability Standards (NEW)
  * IV. Workspace Isolation & Dependencies (NEW)
  * V. Code Review & Quality Gates (NEW)
- Added sections:
  * Technology Stack Standards (NEW)
  * Development Workflow (NEW)
- Templates requiring updates:
  ✅ plan-template.md - Constitution Check gates updated with concrete validation checklist
  ✅ spec-template.md - Requirements section updated with constitution alignment guidance
  ✅ tasks-template.md - Setup and implementation phases updated with constitution compliance checks
- Dependent files reviewed:
  ✅ README.md - No changes needed (already contains setup and workflow guidance)
  ✅ presentation/doc/*.md - No changes needed (PPTist-specific documentation)
  ✅ .github/prompts/ - No agent-specific references found
- Follow-up TODOs: None - all placeholders filled, all templates synchronized
-->

# Micro-Frontend Lesson Builder Constitution

## Core Principles

### I. Component Modularity

Components MUST be:

- **Self-contained**: Each component owns its dependencies, types, and logic without reaching across workspace boundaries
- **Single Responsibility**: Components serve ONE clear purpose; split when responsibilities diverge
- **Independently Testable**: Every component MUST include test coverage verifying behavior in isolation
- **Reusable**: Design for reuse across features; extract shared logic to shared utilities rather than duplicating

**Workspace Rule**: Features belong in workspace-specific directories (`container/src/features/`, `presentation/src/components/`). Shared utilities belong in explicit shared directories (`container/src/shared/`, `presentation/src/utils/`).

**Rationale**: Module Federation architecture requires clear boundaries. Tightly coupled components create runtime failures when remotes load independently. Self-contained modules enable parallel development and independent deployment.

### II. Type Safety & Quality Enforcement

Type safety is NON-NEGOTIABLE:

- **TypeScript Strict Mode**: All workspaces MUST enable `strict: true` in `tsconfig.json`
- **No `any` Types**: Explicit types required; use `unknown` + type guards when type truly unknowable
- **Interface Contracts**: All public APIs, props, and Module Federation exports MUST have explicit type definitions
- **Zero Type Errors**: `pnpm typecheck` MUST pass with zero errors before any commit
- **Linting**: `pnpm lint` MUST pass with zero warnings; ESLint rules are enforced, not optional

**Rationale**: Micro-frontend architecture amplifies type safety benefits. Type errors at module boundaries cause runtime failures in production. Static analysis catches integration issues before they reach users.

### III. Code Maintainability Standards

Code MUST be maintainable:

- **Consistent Formatting**: Prettier runs on save; all code follows project formatting standards
- **Conventional Commits**: All commits MUST follow Conventional Commits specification (enforced by commitlint)
- **Descriptive Naming**: Variables, functions, components use descriptive names reflecting intent (no `data`, `temp`, `handler` without context)
- **Maximum Function Length**: Functions exceeding 50 lines MUST be refactored into smaller, focused units
- **Documentation**: Complex logic MUST include comments explaining WHY, not WHAT (code shows what)
- **No Dead Code**: Remove unused imports, commented-out code, and unreferenced files before commit

**Rationale**: Maintainability enables iteration velocity. Code is read 10x more than written. Clear, consistent code reduces cognitive load and onboarding time.

### IV. Workspace Isolation & Dependencies

Workspace dependencies MUST follow strict rules:

- **Install in Workspace**: All dependencies MUST be installed within the specific workspace (`cd container && pnpm add <package>`), NEVER at root
- **Shared Dependencies Aligned**: Shared dependencies (React, TypeScript, Vite) MUST use identical versions across workspaces to prevent Module Federation conflicts
- **Explicit Peer Dependencies**: Module Federation remotes MUST declare peer dependencies matching host versions
- **No Cross-Workspace Imports**: `container/` MUST NOT directly import from `presentation/src/`; use Module Federation exports only
- **Dependency Review**: New dependencies require justification; prefer existing solutions before adding packages

**Rationale**: pnpm workspace isolation prevents version conflicts. Module Federation breaks when shared dependencies mismatch. Explicit boundaries enable independent builds and deployments.

### V. Code Review & Quality Gates

All changes MUST pass quality gates:

- **Pre-commit Hooks**: Husky enforces linting and commit message format before allowing commits
- **Build Success**: `pnpm build` MUST succeed for all workspaces before merging
- **Test Coverage**: New features MUST include tests covering primary user paths
- **Type Safety**: `pnpm typecheck` MUST pass with zero errors
- **Peer Review**: All PRs require at least one approval from a maintainer
- **No Force Push**: Rewriting history on shared branches is prohibited

**Rationale**: Quality gates catch issues before production. Automated checks reduce review burden. Consistent standards maintain codebase health over time.

## Technology Stack Standards

The project MUST adhere to these technology standards:

- **Node.js**: Version 20+ LTS (specified in `.nvmrc` or `package.json#engines`)
- **Package Manager**: pnpm ≥ 9 (specified in `package.json#packageManager`)
- **Build Tool**: Vite for both workspaces (fast HMR, Module Federation support)
- **Monorepo**: Turborepo for task orchestration and caching
- **React**: Version 19+ with TypeScript for `container/` workspace
- **Vue**: Version 3+ with TypeScript for `presentation/` workspace
- **Styling**: Tailwind CSS v4 for `container/`, existing PPTist styles for `presentation/`
- **Linting**: ESLint 9+ with typescript-eslint parser
- **Formatting**: Prettier 3+ with Tailwind plugin
- **Git Hooks**: Husky for pre-commit and commit-msg hooks
- **Commit Convention**: Conventional Commits (enforced by commitlint)

**Technology Changes**: Proposing new frameworks or major version upgrades requires:

1. Written justification document covering benefits, migration effort, breaking changes
2. Proof-of-concept demonstrating viability
3. Approval from at least two maintainers
4. Migration plan with rollback strategy

**Rationale**: Technology consistency reduces context switching and enables knowledge sharing. Standards prevent fragmentation and incompatible tooling choices.

## Development Workflow

Standard development workflow MUST follow these phases:

### Phase 1: Planning

- Feature specification created in `specs/[###-feature-name]/spec.md`
- Implementation plan generated in `specs/[###-feature-name]/plan.md`
- Architecture reviewed for Module Federation implications
- Workspace assignments clarified (container vs. presentation vs. shared)

### Phase 2: Implementation

- Development follows TDD when tests are explicitly required in specification
- Commits made frequently with conventional commit messages
- Pre-commit hooks validate linting, formatting, type safety
- Developer runs `pnpm dev` to verify both apps load correctly with Module Federation

### Phase 3: Review

- Pull request created with description linking to specification
- Automated checks run: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`
- All checks MUST pass (green) before review begins
- At least one peer review with approval required
- Reviewer verifies: code matches specification, follows constitution principles, includes necessary tests

**Workflow Exceptions**: Hotfixes may bypass some planning steps but MUST still pass all quality gates.

**Rationale**: Structured workflow ensures quality, traceability, and team coordination. Automated gates reduce human error and review burden.

## Governance

This constitution governs all development practices for the Micro-Frontend Lesson Builder project:

- **Precedence**: Constitution principles supersede team preferences or historical practices when conflicts arise
- **Amendment Procedure**:
  1. Proposed amendments submitted as pull requests modifying this file
  2. Amendments discussed in team meeting or asynchronous review
  3. Approval requires majority consensus from active maintainers
  4. Amendment merged with updated version number and date
  5. Breaking amendments require migration plan for existing code
- **Versioning Policy**: Constitution follows semantic versioning:
  - **MAJOR**: Backward-incompatible changes (e.g., removing enforced principles, changing required tooling)
  - **MINOR**: New principles added or existing principles materially expanded
  - **PATCH**: Clarifications, typo fixes, formatting improvements without semantic changes
- **Compliance Reviews**: Periodic reviews (quarterly recommended) assess adherence to principles; violations addressed through refactoring sprints
- **Complexity Justification**: When constitution principles conflict with practical needs, document justification in implementation plan Complexity Tracking section

**Enforcement**: Pull request reviewers MUST verify constitution compliance. Automated checks (linting, typecheck, tests) enforce programmatically verifiable rules.

**Guidance Resources**: For day-to-day development guidance beyond constitutional principles, refer to `README.md` for setup instructions and common workflows.

**Version**: 1.0.0 | **Ratified**: 2025-10-29 | **Last Amended**: 2025-10-29
