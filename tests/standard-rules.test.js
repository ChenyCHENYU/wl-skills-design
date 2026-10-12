"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { parseStandardRules } = require("../lib/standard-rules.js");
const { verifyFlowchartFile } = require("../lib/verify.js");
const CLI = path.resolve(__dirname, "../bin/wl-skills-design.js");

test("标准说明表不覆盖清单类别，复合规则 ID 和中文名称保留", () => {
  const text = "- [ ] **F05** [M]. 标题宽高与 `tenant_id` 独立\n- [ ] **FC-01** [M] — 活动与 spec 联查\n- [ ] X01 [J] — 语义需人工复核\n| F05 | 解释表的补充 |\n| FC-01 | 补充联查方式 |\n| Z01 | **仅表格规则** |\n";
  assert.deepEqual(parseStandardRules(text), [
    { id: "F05", kind: "mechanical", name: "标题宽高与 tenant_id 独立" },
    { id: "FC-01", kind: "mechanical", name: "活动与 spec 联查" },
    { id: "X01", kind: "semantic", name: "语义需人工复核" },
    { id: "Z01", kind: "semantic", name: "仅表格规则" },
  ]);
  assert.equal(parseStandardRules(text, { includeTables: false }).length, 3);
});

test("真实流程图 task/notice/verify/status 包含全部 20 项且联查未验证可见", () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "wl-design-rule-inventory-")));
  const run = (...args) => {
    const result = spawnSync(process.execPath, [CLI, ...args, "--target", root, "--json"], { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr + result.stdout);
    return JSON.parse(result.stdout);
  };
  try {
    run("init");
    const file = "approval.drawio";
    fs.copyFileSync(path.resolve(__dirname, "../files/.github/skills/requirements-flowchart/examples/01-purchase-approval.drawio"), path.join(root, file));
    const task = run("task", "--input", "检查需求流程图结构", "--file", file, "--run-id", "rule-inventory-real");
    assert.equal(task.decision.requiredChecks.length, 20);
    for (const id of ["FC-01", "FC-02", "FC-03", "FC-04", "FC-05"]) assert.ok(task.decision.requiredChecks.includes(`requirements.flowchart:${id}`));
    const f05 = task.notice.rules.find((rule) => rule.id === "requirements.flowchart:F05");
    assert.ok(f05.name.includes("活动宽高按文字自适应"));
    assert.equal(f05.source, ".github/standards/01-flowchart.md");
    assert.equal(task.decision.applicableRules.find((rule) => rule.id === "requirements.flowchart:FC-01").kind, "mechanical");
    const report = verifyFlowchartFile(path.join(root, file));
    assert.equal(report.coverage.checks.length, 20);
    for (const id of ["FC-01", "FC-02", "FC-03"]) assert.equal(report.coverage.checks.find((rule) => rule.id === id).status, "skip");
    for (const id of ["FC-04", "FC-05"]) assert.equal(report.coverage.checks.find((rule) => rule.id === id).status, "pass");
    const verification = run("verify", "flowchart", "--file", file, "--run-id", "rule-inventory-real");
    assert.equal(verification.receipt.validationStatus, "partial");
    const status = run("status", "--run-id", "rule-inventory-real");
    assert.equal(status.executionStatus, "completed");
    assert.equal(status.validationStatus, "partial");
    for (const id of ["FC-01", "FC-02", "FC-03"]) {
      assert.ok(status.pendingChecks.includes(`requirements.flowchart:${id}`));
      assert.equal(status.tools.at(-1).checks.find((rule) => rule.id === `requirements.flowchart:${id}`).status, "skipped");
    }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
