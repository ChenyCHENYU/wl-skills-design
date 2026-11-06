"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const pkg = require("../package.json");
const bin = path.resolve(__dirname, "../bin/wl-skills-design.js");

const cases = [
  ["设计接口", "matched", ["api.restful"]],
  ["设计用户模块接口", "matched", ["api.restful"]],
  ["规划订单模块 API", "matched", ["api.restful"]],
  ["设计数据库", "matched", ["data.database"]],
  ["设计采购数据表", "matched", ["data.database"]],
  ["设计接口调用流程图", "matched", ["requirements.flowchart"]],
  ["设计数据库访问流程图", "matched", ["requirements.flowchart"]],
  ["设计用户模块接口并绘制接口调用流程图", "ambiguous", []],
  ["不要设计用户模块接口，只评审数据库设计", "matched", ["data.database"], "inspect"],
  ["旧需求写过“设计用户模块接口”，本次只绘制流程图", "matched", ["requirements.flowchart"]],
  ["只解释如何设计用户模块接口，不生成文件", "matched", ["api.restful"], "explain"],
  ["先列一个设计用户模块接口的计划，不改文件", "matched", ["api.restful"], "plan"],
  ["设计数据库并设计用户模块接口", "ambiguous", []],
  ["排查接口调用报错", "needs-context", []],
  ["写一首诗", "not-applicable", []],
  ["设计报表，排查接口调用报错", "gap", []],
  ["设计 myapiHelper", "gap", []],
  [`设计${"的".repeat(41)}接口`, "gap", []],
];

for (const [task, status, skills, mode] of cases) test(`公开 CLI 与协议识别设计动宾顺序：${task}`, () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "wl-design-natural-"));
  const project = path.join(temporary, "project");
  fs.mkdirSync(project);
  fs.writeFileSync(path.join(project, "package.json"), JSON.stringify({ private: true, devDependencies: { [pkg.name]: pkg.version } }));
  const run = (args, expectedExit = 0) => {
    const result = spawnSync(process.execPath, [bin, ...args], { cwd: project, encoding: "utf8", timeout: 30000 });
    assert.equal(result.status, expectedExit, result.stderr || result.stdout);
    return JSON.parse(result.stdout);
  };
  try {
    const request = path.join(temporary, "request.json");
    fs.writeFileSync(request, JSON.stringify({ operation: "route", projectRoot: project, task }));
    const envelope = run(["protocol", "request", "--input-file", request, "--json"]);
    assert.equal(envelope.ok, true);
    const direct = run(["route", "--input", task, "--target", project, "--json"], status === "ambiguous" ? 2 : status === "gap" ? 1 : 0);
    for (const result of [direct, envelope.result]) {
      const decision = result.decision || result;
      assert.equal(decision.status, status);
      assert.deepEqual(decision.selectedSkills, skills);
      assert.equal(decision.action.businessWritesAuthorized, false);
      if (mode) assert.equal(decision.action.mode, mode);
      if (["explain", "plan"].includes(mode)) assert.equal(decision.action.checksAllowed, false);
    }
    assert.equal(envelope.result.integration.packageName, pkg.name);
    assert.equal(envelope.result.integration.runId, null);
    assert.deepEqual(fs.readdirSync(project), ["package.json"]);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});
