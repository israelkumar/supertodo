<!--
Sync Impact Report:
- Version: NEW → 1.0.0 (Initial constitution establishment)
- Principle Changes:
  * NEW: Speed Over Perfection
  * NEW: Iterative Validation
  * NEW: Minimal Viable Scope (NON-NEGOTIABLE)
  * NEW: Defer Optimization
  * NEW: Prototype-to-Production Path
- Added Sections:
  * Fast Prototyping Constraints
  * Rapid Development Workflow
- Templates Updated:
  ✅ .specify/templates/plan-template.md - Added Constitution Check with validation checkpoint
  ✅ .specify/templates/spec-template.md - Added prototype vs production success criteria distinction and deferred edge cases
  ✅ .specify/templates/tasks-template.md - Added validation checkpoint phase and productionization phase separation
- Follow-up TODOs: None
-->

# SuperTodo Constitution

## Core Principles

### I. Speed Over Perfection

Every feature MUST prioritize getting to a working prototype quickly over achieving
production-ready quality on first iteration. Code quality, optimization, and polish are
deferred to subsequent iterations after validation. Prototypes MUST be functional enough
to demonstrate value and gather feedback, but need not handle edge cases, scale concerns,
or production hardening until validated.

**Rationale**: Fast feedback loops prevent wasted effort on features users don't want.
Building the wrong thing perfectly is more wasteful than building the right thing roughly.

### II. Iterative Validation

Every prototype MUST include a clear validation checkpoint before proceeding to the next
iteration. Validation checkpoints MUST define:
- What hypothesis is being tested
- What success/failure looks like
- Who provides the validation feedback
- Maximum time to reach checkpoint (default: 2 hours of work)

No work proceeds beyond a validation checkpoint without explicit approval or pivot decision.

**Rationale**: Frequent validation prevents scope creep and ensures effort is directed
toward proven value. Two-hour checkpoints keep iterations tight and feedback immediate.

### III. Minimal Viable Scope (NON-NEGOTIABLE)

Every feature specification MUST be reduced to the absolute minimum scope that demonstrates
core value. When in doubt, cut it out. Features MUST start with:
- Single happy path only (no edge cases)
- Manual configuration acceptable (no UI/automation initially)
- Hardcoded reasonable defaults (no parameterization)
- Console output acceptable (no polished UI)
- Inline implementation acceptable (no architectural separation)

Scope expansion requires explicit user approval and completed validation of minimal version.

**Rationale**: Minimum scope maximizes learning per unit effort. Most features never need
the complexity initially imagined. Start small, prove value, then expand.

### IV. Defer Optimization

Performance optimization, code organization, test coverage, error handling, and
architectural patterns MUST be deferred until after initial validation unless they
directly block the validation itself. Acceptable first-iteration shortcuts include:
- Synchronous blocking operations
- No error handling beyond crashes
- No logging or observability
- Duplicate code vs abstractions
- No tests (validation checkpoint substitutes)
- Hardcoded configuration

Technical debt from prototyping MUST be documented but does NOT block validation.

**Rationale**: Premature optimization wastes time on code that may be discarded.
Optimize what survives validation, discard what doesn't. Prototype debt is acceptable
debt when it buys speed.

### V. Prototype-to-Production Path

Every prototype MUST include a brief "productionization checklist" identifying what would
need to change before production use, but this work is NOT performed until validation
succeeds and production deployment is explicitly approved. Checklist MUST cover:
- Error handling gaps
- Performance/scale concerns
- Security considerations
- Test coverage needed
- Code quality improvements

**Rationale**: Acknowledging technical debt explicitly prevents it from being forgotten
while also preventing premature work on unvalidated features.

## Fast Prototyping Constraints

### Technology Selection

MUST favor technologies that enable fastest time-to-prototype:
- Use existing stack/libraries already in project
- Avoid new dependencies unless they cut development time >50%
- Prefer batteries-included frameworks over composability
- Choose interpreted over compiled when both work
- Use managed services over self-hosted when prototyping

### Documentation Requirement

Prototypes MUST include minimal documentation:
- 3-sentence feature description
- How to run/test the prototype
- Known limitations/shortcuts taken

Full documentation is deferred until post-validation productionization.

### Code Review

Prototypes undergo lightweight review:
- Focus on "does this demonstrate the value?" not "is this production-ready?"
- Reviewer checks validation checkpoint clarity
- Technical debt documentation sufficient (fixing it is not required)

## Rapid Development Workflow

### Feature Initiation

1. Draft 3-sentence feature description
2. Define first validation checkpoint (hypothesis, criteria, timeline)
3. Identify absolute minimum scope
4. Get user approval on scope reduction
5. Start implementing

### Validation Checkpoints

1. Demonstrate working prototype
2. Gather feedback against validation criteria
3. Decision: proceed to next iteration / pivot / abandon
4. If proceeding: define next checkpoint
5. Document outcomes

### Productionization Gate

Only features with successful validation and explicit production deployment approval
proceed to productionization. Productionization includes:
- Addressing items from productionization checklist
- Adding comprehensive error handling
- Adding test coverage
- Code quality improvements
- Performance optimization if needed
- Full documentation

## Governance

This constitution supersedes all other development practices and guidelines. All feature
work, code reviews, and planning MUST comply with these principles.

### Amendment Process

Constitution amendments require:
1. Documented rationale for change
2. User approval
3. Version increment per semantic versioning
4. Update of all dependent templates and documentation

### Compliance Verification

- Every spec MUST reference applicable constitution principles
- Every plan MUST validate against fast prototyping constraints
- Every task MUST indicate if it's prototype vs productionization work
- Complexity beyond minimal scope MUST be explicitly justified

**Version**: 1.0.0 | **Ratified**: 2026-02-15 | **Last Amended**: 2026-02-15
