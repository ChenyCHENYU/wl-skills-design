# wl-skills-design

Product-design Agent Skills package: 9 design standards, 10 discoverable Skills, 16 VS Code prompts, dual-track mechanical/semantic verification (`[M]`/`[J]`), a mechanical-verification CLI, anonymized synthetic examples, and a transactional installer.

[中文说明](./README.md)

## Quick start

Requires Node.js 20+.

```bash
npx @agile-team/wl-skills-design init            # AGENTS.md profile (default)
npx @agile-team/wl-skills-design init --editor copilot
npx @agile-team/wl-skills-design update --dry-run
wl-skills-design verify spec --target ./my-project
wl-skills-design verify flowchart --file docs/flowchart/REQ-A-01-demo.drawio
wl-skills-design verify db --target ./my-project
wl-skills-design verify api --target ./my-project
```

## Capabilities

| Skill | Output | Checklist |
|-------|--------|-----------|
| `requirements-flowchart` | draw.io swimlane flowcharts | 20 items |
| `requirements-prototype` | D1–D3 prototype annotations | 23 items |
| `requirements-spec-doc` | Requirement specs with IPO tables (GB granularity baseline) | 43 items |
| `data-database-design` | ER, data dictionary, DDL | 34 items |
| `api-interface-design` | Integration messages, REST, optional OpenAPI 3.1 | 38 items |
| `cross-glossary` | Terms, fields, enums, codes | 18 items |
| `cross-design-review` | Scores, findings, traceability matrix | D4 18 + RV 12 |
| `cross-change-impact` | Impact matrix, patch tasks, re-verification order | 20 items |
| `doc-intake` | Intake existing/half-finished docs: gap report, patch tasks, draft design-model | reuses domain checklists |
| `code-architecture` | Module boundaries, layering, contracts, quality gates | AC01–AC20 |

## Dual-track verification

Every checklist item is tagged `[M]` (mechanically decidable) or `[J]` (judgment). All four domains are covered by `wl-skills-design verify`, which executes the `[M]` items deterministically (code formats and uniqueness, table shapes and column standards, draw.io structure, dictionary↔DDL field/type/length consistency, contract types, parseable examples, traceability closure); the agent judges `[J]` items and merges both into a single rule-numbered report. The `demo/` folder is a living example that stays verify-green across all four domains.

## Doc intake

The `doc-intake` skill onboards half-finished documents: classify and place content by coding system, run mechanical + semantic gap analysis (including enum-value drift and near-name drift detection), produce a patch-task plan reusing the change-impact format, fill structural gaps within granted scope, and cast a draft design-model from existing codes — never inventing business facts.

## Safety

- `validate` / `review` / `impact` are read-only by default; `repair` requires explicit authorization.
- Install/update preflight all conflicts (exit code 2, no half-written trees); managed files are hash-tracked; local edits are protected; transactional backups keep the last 5; restore snapshots before overwriting and can be undone.
- A lock file guards concurrent runs; `uninstall --purge` removes state when explicitly requested.
- All shipped examples are anonymized synthetic content, enforced by CI privacy scans (separator-normalized matching).

## CLI

```
init | update | status | doctor | validate-model | verify <spec|flowchart> | restore | uninstall
Options: --editor <id[,id]|all> --target <dir> --file <path> --model <file>
         --list --id <backupId> --purge --dry-run --force --json
```

Editor profiles: `agents` (default), `copilot`, `claude`, `cursor`, `windsurf`, `cline`, `kiro`, `qoder`, `trae`.

## Development

```bash
npm ci --ignore-scripts
npm run verify     # doctor + adapter drift + CLI tests + mechanical-verify tests + real npm payload smoke
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for conventions (route-eval coverage for trigger changes, [M]/[J] consistency, anonymization gates).

## License

[Apache-2.0](./LICENSE). All templates and examples are anonymized synthetic data.
