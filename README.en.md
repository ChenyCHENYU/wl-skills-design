<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/ChenyCHENYU/wl-skills-design/main/assets/wl-design-logo-dark.svg">
    <img alt="WL · World Leading · skills-design" src="https://raw.githubusercontent.com/ChenyCHENYU/wl-skills-design/main/assets/wl-design-logo.svg" width="100%">
  </picture>
</p>

<p align="center"><strong>Turn business facts into aligned, traceable requirements and design deliverables with mechanical verification.</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@agile-team/wl-skills-design"><img src="https://img.shields.io/npm/v/@agile-team/wl-skills-design?color=16827d" alt="npm" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/node/v/@agile-team/wl-skills-design" alt="Node.js" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-64748b" alt="License" /></a>
</p>

[中文](README.md)

**Business facts → Requirements and flows → Database and APIs → Cross-document review → Repair and recheck → Development handoff**

## Where it fits

For requirements analysis, product design, technical design and design reviews. Start from scratch or bring existing documents. No sibling WL package is required. The current project-scope guard excludes mobile projects.

| Task | Deliverables | Checks |
| --- | --- | --- |
| Model workflows and screens | draw.io swimlanes, prototype annotations | Activity codes, roles, branches, layout and actions |
| Specify requirements | Structured documents, button-level IPO logic | Inputs, outputs, conditions, state changes and error messages |
| Design data and APIs | ER, dictionaries, DDL, interface definitions | Fields, types, indexes, responses and error codes |
| Intake unfinished documents | Gap report, patch tasks, open questions | Missing structure, terminology and enum drift |
| Review and assess changes | Findings, traceability and impact matrices | Alignment across requirements, workflows, data and APIs |

Standards distinguish **[M] mechanical checks** from **[J] semantic judgment**. The CLI runs its implemented mechanical subset; the Agent assists with semantic review; owners confirm business facts and delivery decisions.

## Get started in three steps

Run these commands in the actual target project root with Node.js 20+. Setup is a one-time integration task; daily work starts with a specific request to an Agent that has loaded the project rules.

### 1. Install the executor and rules

```bash
npm install -D @agile-team/wl-skills-design
npx --no-install wl-skills-design init
```

The default profile uses `AGENTS.md`. Codex's native gateway is `.agents/skills/wl-skills-design/SKILL.md`. For Cursor, add `--editor cursor` to `init`; see `--help` for other profiles.

Document-only repositories may use `npx @agile-team/wl-skills-design init` to distribute rules. Pin the project dependency and lockfile for repeatable checks and CI.

### 2. Check the installation

```bash
npx --no-install wl-skills-design doctor
npx --no-install wl-skills-design doctor-host --host codex --json
```

`doctor` checks installed assets and the Skill catalog. `doctor-host` checks entry points and version alignment. Refresh the editor rules, then confirm actual tool calls through a real task.

### 3. Give the Agent a concrete task

> Create a requirements skeleton for DEMO equipment inspections, from entry to archiving, excluding repair dispatch. The goals are digital records and traceable exceptions. List missing facts first, then develop the workflow and button-level IPO logic.

Start with **project code, scope and goals**. Add roles, objects, states, business rules and technical profiles progressively. Missing facts stay pending rather than being invented.

The first task response should show selected Skills/rules, targets, `runId` and pending checks. Installed assets alone do not prove that the editor or model used them.

## Example: propagate an inspection-rule change

A new condition for confirming an inspection affects the workflow, button logic, state fields and API constraints.

| Stage | Action | What to verify |
| --- | --- | --- |
| Assess impact | Ask which design documents the condition affects | Affected files, open facts and recheck order |
| Apply authorized changes | Update the workflow, IPO, data and API definitions | Consistent codes, state values and error messages |
| Run deterministic checks | Use the corresponding `verify` domain | Rule IDs, actual checked files and findings |
| Review alignment | Review semantics and traceability, then read `status` | Mechanical findings, semantic findings and unverified items |

For an existing API document, the Agent or CI can run:

```bash
npx --no-install wl-skills-design task --input "Validate RESTful API design" --file docs/api/01-inspection.md --run-id inspection-review --json
npx --no-install wl-skills-design verify api --file docs/api/01-inspection.md --run-id inspection-review --json
npx --no-install wl-skills-design status --run-id inspection-review --json
```

After authorized repairs, refresh the task plan and recheck using the same `runId`. `status` distinguishes execution, checked scope, stale evidence and pending checks. Mechanical success can still report `partial`; semantics and final rendering need separate review.

## Verification entry points

| Deliverable | Command |
| --- | --- |
| Requirements | `npx --no-install wl-skills-design verify spec --target .` |
| Swimlane diagram | `npx --no-install wl-skills-design verify flowchart --file docs/flowchart/input.drawio` |
| Database design | `npx --no-install wl-skills-design verify db --target .` |
| API design | `npx --no-install wl-skills-design verify api --target .` |
| Optional design model | `npx --no-install wl-skills-design validate-model --model docs/design-model.json` |

`--file` limits checks to the selected file or directory. A single-file check does not establish cross-document completeness. CI uses the same CLI and archives its output and receipts. See [public API boundaries](docs/public-api.md) for implemented checks, skips and structured integration.

For long diagram labels, preview `layout-flowchart --file <source> --output <new-file> --dry-run`. Applying the layout creates a new file; verify the diagram and inspect the actual rendering afterward.

## Maintenance

| Need | Command |
| --- | --- |
| Managed files and local changes | `npx --no-install wl-skills-design status` |
| Preview a rule update | `npx --no-install wl-skills-design update --dry-run` |
| Align executor and rules | Update the dependency and lockfile, then review and run `update` |
| List recovery snapshots | `npx --no-install wl-skills-design restore --list` |
| Preview removal | `npx --no-install wl-skills-design uninstall --dry-run` |

Asset lifecycle operations preserve user content and other packages' contributions. Reviews and impact analysis are read-only by default; repairs to existing designs stay within the authorized scope.

## Guides

- [Usage](files/.github/guides/usage.md) and [input checklist](files/.github/guides/inputs-checklist.md): creation, intake, review and incremental fact collection.
- [Optional design model](files/.github/guides/design-model.md): stable IDs and cross-document references.
- [Project scope](docs/project-scope.md), [public API](docs/public-api.md) and [maintenance contract](docs/maintenance-contract.md).

## WL · World Leading

Each package works independently. Combine only the capabilities your project needs.

| Package | Responsibility |
| --- | --- |
| [skills-gate](https://github.com/ChenyCHENYU/wl-skills-gate) | Project hooks, build gates and quality workflow orchestration |
| [skills-kit](https://github.com/ChenyCHENYU/wl-skills-kit) | PC Vue administration engineering conventions |
| [skills-ui](https://github.com/ChenyCHENYU/wl-skills-ui) | Interface conventions, layout and interaction quality |
| [skills-bd](https://github.com/ChenyCHENYU/wl-skills-bd) | Java backend conventions, contracts and checks |
| [skills-test](https://github.com/ChenyCHENYU/wl-skills-test) | Test design, execution, evidence and delivery |
| **skills-design** | Requirements, workflows, database and API design |

[Apache-2.0](LICENSE)
