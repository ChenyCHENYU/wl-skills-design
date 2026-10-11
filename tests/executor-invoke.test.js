"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const repo = path.resolve(__dirname, "..");
const cli = path.join(repo, "bin/wl-skills-design.js");

function snapshot(root) {
  const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [[path.relative(root, file), crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")]];
  });
  return walk(root).sort(([left], [right]) => left.localeCompare(right));
}

async function fixture(body) {
  const outer = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "wl-design-executor-invoke-")));
  const root = path.join(outer, "project");
  fs.mkdirSync(root);
  const run = (...args) => {
    const result = spawnSync(process.execPath, [cli, ...args, "--target", root, "--json"], { cwd: root, encoding: "utf8" });
    return { code: result.status, data: result.stdout ? JSON.parse(result.stdout) : null, stderr: result.stderr };
  };
  const execute = (payload) => {
    const request = path.join(outer, "request.json");
    fs.writeFileSync(request, JSON.stringify({ operation: "execute", projectRoot: root, ...payload }));
    return run("protocol", "request", "--input-file", request);
  };
  try {
    assert.equal(run("init").code, 0);
    for (const domain of ["spec", "api", "db"]) fs.cpSync(path.join(repo, "demo/docs", domain), path.join(root, "docs", domain), { recursive: true });
    fs.mkdirSync(path.join(root, "docs/flowchart"), { recursive: true });
    fs.copyFileSync(path.join(repo, "demo/docs/flow/01-equipment-inspection.drawio"), path.join(root, "docs/flowchart/sample.drawio"));
    await body({ root, run, execute });
  } finally { fs.rmSync(outer, { recursive: true, force: true }); }
}

test("Design 四领域单包稳定 execute 与原 verify 的检查、范围、机械结果同义", async () => fixture(async ({ root, run, execute }) => {
  for (const [domain, target, task] of [
    ["spec", "docs/spec/equipment/ch1-3.md", "检查需求说明书结构"],
    ["flowchart", "docs/flowchart/sample.drawio", "检查流程图结构"],
    ["db", "docs/db", "检查数据库设计结构"],
    ["api", "docs/api/01-inspection.md", "检查接口设计结构"],
  ]) {
    const runId = `invoke-${domain}`;
    const planned = run("task", "--input", task, "--file", target, "--run-id", runId);
    assert.equal(planned.code, 0, planned.stderr);
    assert.equal(planned.data.decision.status, "matched");
    const result = execute({ runId, executorId: `verify-${domain}`, parameters: { targets: [target] } });
    assert.equal(result.code, 0, result.stderr);
    assert.equal(result.data.ok, true);
    assert.equal(result.data.result.execution.exitCode, 0);
    assert.equal(result.data.result.execution.signal, null);
    assert.equal(result.data.result.executionStatus, "completed");
    const actual = JSON.parse(result.data.result.execution.stdout);
    const direct = run("verify", domain, "--file", target, "--run-id", runId);
    assert.equal(direct.code, 0);
    assert.equal(actual.mechanicalOk, true);
    assert.deepEqual(actual.reports, direct.data.reports);
    assert.deepEqual(actual.receipt.checkedFiles, direct.data.receipt.checkedFiles);
    const status = run("status", "--run-id", runId);
    assert.equal(status.data.executionStatus, "completed");
    assert.equal(status.data.runId, runId);
    assert.equal(status.data.validationStatus, "partial", "机械子集通过不能冒充语义完整通过");
    assert.ok(status.data.tools.at(-1).checkedFiles.every((item) => item.path.startsWith(target === "docs/db" ? target + "/" : target)));
    assert.equal(result.data.result.integration.projectRoot, root);
  }
}));

test("真实 API 违规保留失败 stdout 与同 runId 状态，业务文档字节不改", async () => fixture(async ({ root, run, execute }) => {
  const target = "docs/api/01-inspection.md";
  const file = path.join(root, target);
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("```json\n{", "```json\n{invalid"));
  assert.equal(run("task", "--input", "检查接口设计结构", "--file", target, "--run-id", "failed-api").code, 0);
  const before = fs.readFileSync(file);
  const result = execute({ runId: "failed-api", executorId: "verify-api", parameters: { targets: [target] } });
  assert.equal(result.data.ok, true);
  assert.equal(result.data.result.execution.exitCode, 1);
  assert.equal(result.data.result.executionStatus, "failed");
  assert.equal(JSON.parse(result.data.result.execution.stdout).mechanicalOk, false);
  assert.equal(run("status", "--run-id", "failed-api").data.validationStatus, "failed");
  assert.deepEqual(fs.readFileSync(file), before);
}));

test("未知执行器、错误领域、参数与目标拒绝零写入；execute 不默认化 projectRoot", async () => fixture(async ({ root, run, execute }) => {
  const target = "docs/api/01-inspection.md";
  assert.equal(run("task", "--input", "检查接口设计结构", "--file", target, "--run-id", "refused-api").code, 0);
  const before = snapshot(root);
  for (const change of [
    { executorId: "unknown", parameters: { targets: [target] } },
    { executorId: "verify-db", parameters: { targets: [target] } },
    { executorId: "verify-api", parameters: { targets: [target], qualityMode: "strict" } },
    { executorId: "verify-api", parameters: { targets: [] } },
    { executorId: "verify-api", parameters: { targets: ["docs/api/00-api-overview.md"] } },
    { projectRoot: null, executorId: "verify-api", parameters: { targets: [target] } },
  ]) {
    const result = execute({ runId: "refused-api", ...change });
    assert.equal(result.code, 2, JSON.stringify(change));
    assert.equal(result.data.ok, false);
    assert.deepEqual(snapshot(root), before);
  }
  const absent = execute({ projectRoot: undefined, runId: "refused-api", executorId: "verify-api", parameters: { targets: [target] } });
  assert.equal(absent.code, 2);
  assert.equal(absent.data.ok, false);
  assert.equal(absent.data.error.field, "projectRoot");
  assert.deepEqual(snapshot(root), before, "execute 不能沿用旧请求的 cwd 默认根");
}));

test("解释与计划任务不会借稳定 execute 启动验证", async () => fixture(async ({ root, run, execute }) => {
  const target = "docs/api/01-inspection.md";
  run("task", "--input", "解释接口设计规范，不要运行检查", "--file", target, "--run-id", "explain-only");
  const before = snapshot(root);
  const result = execute({ runId: "explain-only", executorId: "verify-api", parameters: { targets: [target] } });
  assert.equal(result.code, 2);
  assert.equal(result.data.ok, false);
  assert.deepEqual(snapshot(root), before);
}));
