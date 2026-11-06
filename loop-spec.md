---
type: template
title: Loop Specification
description: Structured loop spec — goal, verification, council, gates, termination. Design the loop before running it. Adapted from ksimback/looper.
tags: [tpm, quality]
---

# Loop Specification

Write this BEFORE starting any open loop. A complete spec prevents drift and infinite loops.

## Full Spec Format

```yaml
version: 1

meta:
  name: "<short name>"
  description: "<one-line description>"
  author: "<who created this>"

goal:
  statement: >
    <what the loop should accomplish — sharp, not vague>
  definition_of_done: >
    <checkable — "npm test exits 0" not "code is good">
  context_sources:
    - file: <path to context>

verification:
  - id: <unique-id>
    type: programmatic | judge | human
    # programmatic: a command that exits 0 = pass
    check: ["<command>", "<arg>"]
    expect: exit_zero
    # judge: a separate model scores a rubric
    rubric: >
      <criteria the judge evaluates>

host:
  cli: opencode | claude | codex
  model: <model-id>
  timeout_sec: <max seconds per iteration>

council:
  - id: <checker-id>
    role: reviewer | judge
    cli: <different-family-than-host>
    model: <model-id>
    timeout_sec: <max seconds per check>
    scope: [plan, delivery]

gates:
  plan_gate:
    when: after_plan
    members: [<checker-id>]
    verdict_policy: revise_until_clean
    criteria: [<verification-id>]
    max_revisions: 3
  delivery_gate:
    when: after_each_delivery
    members: [<checker-id>]
    verdict_policy: revise_until_clean
    criteria: [<verification-id>]
    max_revisions: 3

loop_control:
  max_iterations: <number>
  no_progress:
    max_stalled_iterations: 2
    signals:
      - same blocking issue repeats
      - delivery artifact has no material change
      - verifier output unchanged
    action: stop
  human_checkpoints: [after_plan]
  stop_conditions:
    - all deliverables pass their gates clean
    - max_iterations reached
    - no_progress detected for <N> iterations

execution:
  mode: in_session | external
  isolation: current_workspace | worktree
  side_effects:
    requires_approval: true
    duplicate_action_check: true

observability:
  state_file: state.json
  run_log: run-log.md
  checkpoint_granularity: iteration | gate

workspace:
  dir: ./loop-workspace
  layout: [plan.md, "delivery-{n}.md", "review-{n}.md", state.json, run-log.md]
```

## Key Fields Explained

| Field | What it does | Required? |
|-------|-------------|-----------|
| `goal.statement` | What the loop should accomplish | Yes |
| `goal.definition_of_done` | Checkable condition for "done" | Yes — without this the loop never converges |
| `verification[].type` | programmatic (exit code), judge (model rubric), or human | Yes — at least one |
| `host` | Model that runs the loop | Yes |
| `council` | Separate models that review/judge | No — only if Maker/Checker split is needed |
| `gates` | When and how review happens | Recommended |
| `budget` | USD / tokens / wall clock caps | Recommended — prevents runaway loops |
| `no_progress` | What "stuck" looks like and what to do | Yes — every loop needs termination guards |
| `human_checkpoints` | Points where human must sign off | No — only for high-risk loops |
| `execution.mode` | in_session (same conversation) or external (Python runner) | Default: in_session |
| `execution.isolation` | Worktree separation for parallel loops | Recommended for complex loops |
| `privacy.egress` | What data the checker can see and what's redacted | No — only if cross-model review exposes sensitive data |

## Example: Code Refactor Loop

```yaml
version: 1

meta:
  name: refactor-auth-module
  description: Extract auth logic from controllers into a dedicated service

goal:
  statement: >
    Move all authentication logic from controllers into an auth service,
    one route group at a time.
  definition_of_done: >
    All auth code is in src/services/auth/. All tests pass.
    grep for verifyToken/signToken in controllers returns nothing.
  context_sources:
    - file: src/controllers/
    - file: src/middleware/auth.ts

verification:
  - id: tests-pass
    type: programmatic
    check: ["pnpm", "test", "--run"]
    expect: exit_zero
  - id: no-auth-in-controllers
    type: programmatic
    check: ["grep", "-qr", "verifyToken|signToken", "src/controllers/"]
    expect: exit_one  # grep finds nothing = pass

host:
  cli: opencode
  model: opencode/deepseek-v4-flash-free
  timeout_sec: 300

council: []
# No cross-model review for this loop — programmatic verification is sufficient

gates:
  delivery_gate:
    when: after_each_delivery
    members: []
    verdict_policy: auto
    criteria: [tests-pass, no-auth-in-controllers]
    max_revisions: 3

loop_control:
  max_iterations: 10
  no_progress:
    max_stalled_iterations: 2
    signals:
      - same test failure repeats
      - delivery unchanged from previous iteration
    action: stop
  stop_conditions:
    - all tests pass and no auth in controllers
    - max_iterations reached
```

## When to Use

Write a loop spec whenever:
- An open loop is assigned (`TPM/24-looping-and-autonomy.md`)
- A task has a fuzzy "done" state
- A task would benefit from cross-model review
- Budget or wall clock limits are needed to prevent runaway loops
