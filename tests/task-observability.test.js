"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const { route } = require("../lib/router.js");
const { route: evaluatedRoute } = require("../scripts/check.js");
const runtime = require("../lib/task-runtime.js");
const manifest = require("../files/.github/skills/_manifest.json");
const { verifyDbDir, verifyApiDir } = require("../lib/verify.js");
const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "bin/wl-skills-design.js");

function temp(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wl-design-observe-"));
  try { return fn(root); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
function run(root, ...args) { return spawnSync(process.execPath, [CLI, ...args, "--target", root, "--json"], { encoding: "utf8" }); }
function json(output) { assert.ok(output.stdout, output.stderr); return JSON.parse(output.stdout); }

test("发布路由和路线eval调用同一实现，边界与原因可解释", () => temp((root) => {
  assert.equal(route, evaluatedRoute);
  assert.equal(run(root, "init").status, 0);
  for (const item of require("../files/.github/skills/_route-evals.design.json").cases) {
    assert.equal(route(item.prompt, manifest).skill, item.skill);
  }
  const unknown = json(run(root, "task", "--input", "帮我处理一下"));
  assert.equal(unknown.decision.status, "needs-context");
  assert.equal(unknown.decision.applicable, null);
  assert.deepEqual(unknown.decision.requiredChecks, []);
  const task = json(run(root, "task", "--input", "创建库存数据库设计", "--run-id", "design-actual"));
  assert.equal(task.decision.status, "matched");
  assert.deepEqual(task.decision.selectedSkills, ["data.database"]);
  assert.equal(task.executionStatus, "not-executed");
  assert.equal(task.decision.modelRead, "unverified");
  assert.ok(task.decision.requiredChecks.includes("data.database:A01"));
  assert.equal(json(run(root, "status", "--run-id", task.runId)).validationStatus, "unverified");
  const host = json(run(root, "doctor", "--host", "codex"));
  assert.equal(host.hostDiscovery, "unverified");
  assert.equal(host.gateway.status, "present");
  assert.equal(json(run(root, "doctor-host")).contentLoaded, "unverified");
  const beforePure = fs.readdirSync(path.join(root, ".wl-skills-design/runs")).sort();
  assert.equal(json(run(root, "route", "--input", "代码 review")).decision.status, "not-applicable");
  assert.equal(json(run(root, "explain", "--input", "设计用户旅程图")).decision.status, "gap");
  assert.equal(json(run(root, "explain", "--input", "设计用户旅程图")).runId, undefined);
  assert.deepEqual(fs.readdirSync(path.join(root, ".wl-skills-design/runs")).sort(), beforePure);
  json(run(root, "task", "--input", "设计用户旅程图"));
  assert.ok(runtime.observation.listGaps(runtime.options(root)).length);
  assert.equal(json(run(root, "task", "--input", "创建流程图与数据库设计")).decision.status, "ambiguous");
  assert.equal(json(run(root, "task", "--input", "整理文档")).decision.status, "baseline");

  fs.unlinkSync(path.join(root, ".github/skills/data-database-design/SKILL.md"));
  const missing = json(run(root, "task", "--input", "数据库设计"));
  assert.equal(missing.decision.status, "gap");
  assert.equal(missing.ready, false);
  assert.equal(json(run(root, "doctor", "--host", "codex")).entryReadiness, "incomplete");
}));

test("真实verify回执包含未执行机械与语义项，输入修改使旧证据失效", () => temp((root) => {
  assert.equal(run(root, "init").status, 0);
  fs.cpSync(path.join(ROOT, "demo/docs/db"), path.join(root, "docs/db"), { recursive: true });
  fs.writeFileSync(path.join(root, "docs/db", "unchecked.txt"), "not a design document\n");
  const task = json(run(root, "task", "--input", "验证库存数据库设计", "--run-id", "db-real"));
  const verified = json(run(root, "verify", "db", "--run-id", task.runId));
  assert.equal(verified.mechanicalOk, true);
  assert.equal(verified.ok, false);
  assert.equal(verified.receipt.executionStatus, "completed");
  assert.equal(verified.receipt.validationStatus, "partial");
  assert.ok(verified.receipt.checks.some((item) => item.status === "passed"));
  assert.ok(verified.receipt.checks.some((item) => item.status === "skipped"));
  assert.ok(verified.receipt.checkedFiles.length > 0);
  assert.ok(verified.receipt.checkedFiles.every((item) => item.path.startsWith("docs/db/") && item.path.endsWith(".md")));
  assert.ok(!verified.receipt.checkedFiles.some((item) => item.path.endsWith("unchecked.txt")));
  assert.ok(verified.reports.every((report) => report.coverage.semantic.every((item) => item.status !== "pass")));
  const current = json(run(root, "status", "--run-id", task.runId));
  assert.equal(current.stages.hostDiscovered, "unverified");
  assert.equal(current.stages.contentLoaded, "unverified");
  assert.ok(current.pendingChecks.length > 0);
  const document = fs.readdirSync(path.join(root, "docs/db")).find((name) => name.endsWith(".md"));
  fs.appendFileSync(path.join(root, "docs/db", document), "\nuser changed input\n");
  assert.equal(json(run(root, "status", "--run-id", task.runId)).validationStatus, "stale");
  const inputError = run(root, "verify", "api", "--run-id", "missing-input");
  assert.equal(inputError.status, 1);
  assert.equal(json(run(root, "status", "--run-id", "missing-input")).executionStatus, "failed");
}));

test("canonical验证清单逐项覆盖，语义不以机械子集冒充通过", () => {
  const db = verifyDbDir(path.join(ROOT, "demo/docs/db"));
  const api = verifyApiDir(path.join(ROOT, "demo/docs/api"));
  assert.equal(db.coverage.checks.length, 34);
  assert.equal(api.coverage.checks.length, 38);
  assert.ok(api.coverage.unverified.some((item) => item.kind === "mechanical"));
  assert.ok(api.coverage.unverified.some((item) => item.kind === "semantic"));
  assert.ok(api.checks.some((item) => item.rule === "B01" && item.status === "not-applicable"));
});

test("gateway独占命名、陌生内容force保护与零半安装", () => temp((root) => {
  const file = path.join(root, ".agents/skills/wl-skills-design/SKILL.md");
  fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, "user gateway\n");
  assert.notEqual(run(root, "init", "--force").status, 0);
  assert.equal(fs.readFileSync(file, "utf8"), "user gateway\n");
  assert.ok(!fs.existsSync(path.join(root, "AGENTS.md")));
}));
