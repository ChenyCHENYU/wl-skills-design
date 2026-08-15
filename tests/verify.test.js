"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "bin", "wl-skills-design.js");
const { verifySpecDir, verifyFlowchartFile } = require(path.join(ROOT, "lib", "verify.js"));

const EXAMPLE = path.join(ROOT, "files", ".github", "skills", "requirements-flowchart", "examples", "01-purchase-approval.drawio");
const DEMO_SPEC = path.join(ROOT, "demo", "docs", "spec", "equipment");

function withTemp(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wlsd-verify-"));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("机械验证：包内匿名流程图样例全绿", () => {
  const report = verifyFlowchartFile(EXAMPLE);
  assert.strictEqual(report.ok, true, JSON.stringify(report.checks.filter((item) => item.status === "fail")));
  assert.ok(report.summary.pass >= 15);
});

test("机械验证：demo 需求说明书全绿", () => {
  const report = verifySpecDir(DEMO_SPEC);
  assert.strictEqual(report.ok, true, JSON.stringify(report.checks.filter((item) => item.status === "fail")));
  assert.strictEqual(report.summary.fail, 0);
});

test("机械验证：流程图结构缺陷被检出", () => withTemp((dir) => {
  const file = path.join(dir, "bad.drawio");
  fs.writeFileSync(file, `<mxfile>` +
    `<diagram id="p0" name="流程标准定义"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram>` +
    `<diagram id="p1" name="流程">` +
    `<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/>` +
    `<mxCell id="a" value="开始" style="shape=mxgraph.flowchart.terminator;fillColor=#76608a;" vertex="1" parent="1"><mxGeometry x="10" y="10" width="40" height="20" as="geometry"/></mxCell>` +
    `<mxCell id="a" value="重复ID" style="" vertex="1" parent="1"><mxGeometry x="10" y="60" width="40" height="20" as="geometry"/></mxCell>` +
    `<mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;" edge="1" parent="1" source="a" target="missing"><mxGeometry relative="1" as="geometry"/></mxCell>` +
    `</root></mxGraphModel></diagram></mxfile>`, "utf8");
  const report = verifyFlowchartFile(file);
  assert.strictEqual(report.ok, false);
  const fails = report.checks.filter((item) => item.status === "fail").map((item) => item.rule);
  assert.ok(fails.includes("引用"), `断链/重复 ID 应报错，实际：${fails.join(",")}`);
}));

test("机械验证：spec 断链与跳号被检出", () => withTemp((dir) => {
  const target = path.join(dir, "spec");
  fs.mkdirSync(target);
  for (const name of fs.readdirSync(DEMO_SPEC)) {
    fs.copyFileSync(path.join(DEMO_SPEC, name), path.join(target, name));
  }
  const file = path.join(target, "4.1-inspection.md");
  let text = fs.readFileSync(file, "utf8");
  text = text.replace("| EQIP-A-01-E-04 | 点检归档 | 班长 | 结论正常的点检单 | 状态转 CONFIRMED，归档 | 归档点检单 |\n", "");
  text = text.replace("EQIP-A-01-E-02", "EQIP-A-01-E-07");
  fs.writeFileSync(file, text, "utf8");
  const report = verifySpecDir(target);
  assert.strictEqual(report.ok, false);
  const fails = report.checks.filter((item) => item.status === "fail").map((item) => item.rule);
  assert.ok(fails.includes("F03"), "对照表缺活动应判 F03");
  assert.ok(fails.includes("C02"), "活动跳号应判 C02");
}));

test("CLI verify 端到端：demo 通过，破损副本退出码 1", () => withTemp((dir) => {
  const good = spawnSync(process.execPath, [CLI, "verify", "spec", "--target", path.join(ROOT, "demo")], { encoding: "utf8" });
  assert.strictEqual(good.status, 0, good.stdout + good.stderr);
  assert.match(good.stdout, /机械检查/);

  const broken = path.join(dir, "docs", "spec", "demo");
  fs.mkdirSync(broken, { recursive: true });
  fs.writeFileSync(path.join(broken, "ch1-3.md"), "# 1. 系统目标\n\n- 目标一\n", "utf8");
  const bad = spawnSync(process.execPath, [CLI, "verify", "spec", "--target", dir], { encoding: "utf8" });
  assert.strictEqual(bad.status, 1);
  assert.match(bad.stdout, /S0[24]/);
}));

test("CLI verify flowchart --file 端到端", () => {
  const result = spawnSync(process.execPath, [CLI, "verify", "flowchart", "--file", EXAMPLE, "--json"], { encoding: "utf8" });
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  const output = JSON.parse(result.stdout);
  assert.strictEqual(output.ok, true);
  assert.strictEqual(output.domain, "flowchart");
});
