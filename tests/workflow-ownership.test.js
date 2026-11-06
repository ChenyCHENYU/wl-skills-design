"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const pkg = require("../package.json");
const cli = path.resolve(__dirname, "../bin/wl-skills-design.js");
const cases = [
  ["画出采购审批的泳道流程，包含申请人、主管和财务以及驳回路径", "matched", ["requirements.flowchart"]],
  ["把退款处理过程绘制成泳道图", "matched", ["requirements.flowchart"]],
  ["为采购申请页面做可评审的低保真原型，包含列表和编辑弹窗", "matched", ["requirements.prototype"]],
  ["把需求、流程图、原型、数据库和接口放在一起评审，找出不一致", "matched", ["cross.designReview"]],
  ["对照接口定义和数据库字段，检查两边是否一致", "matched", ["cross.designReview"]],
  ["把审批层级从二级改成三级前，分析会影响哪些设计和接口", "matched", ["cross.changeImpact"]],
  ["先梳理一个改接口后需要同步的设计文档清单", "matched", ["cross.changeImpact"]],
  ["接收这批旧Word详设和流程图，检查文档完整性并列出需要补充的内容", "baseline", ["doc.intake"]],
  ["实现采购模块前先设计代码目录、模块职责和依赖边界", "matched", ["code.architecture"]],
  ["不要评审全套设计，只调整采购原型上的字段标注", "matched", ["requirements.prototype"]],
  ["先给我列个接口设计计划，再绘制审批流程图", "ambiguous", []],
  ["跨文档评审需求与接口是否一致，并设计数据库", "ambiguous", []],
  ["设计数据库访问流程图", "matched", ["requirements.flowchart"]],
  ["根据流程图设计退款接口", "matched", ["api.restful"]],
  ["根据已确认的设计方案生成接口", "matched", ["api.restful"]],
  ["根据原型设计接口并绘制泳道图", "ambiguous", []],
  ["根据流程图不要设计接口，只解释原型设计", "matched", ["requirements.prototype"]],
  ["设计myapiHelper", "gap", []],
  [`设计${"的".repeat(49)}接口`, "gap", []],
];
for (const [task, status, selected] of cases) test(`跨域流程拥有其输入资料而不触发资料创建：${task}`, () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wl-design-workflow-"));
  try {
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ private: true, devDependencies: { [pkg.name]: pkg.version } }));
    const input = path.join(root, "request.json");
    fs.writeFileSync(input, JSON.stringify({ operation: "route", projectRoot: root, task }));
    const result = spawnSync(process.execPath, [cli, "protocol", "request", "--input-file", input, "--json"], { cwd: root, encoding: "utf8", timeout: 30000 });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const envelope = JSON.parse(result.stdout);
    const decision = envelope.result.decision;
    assert.equal(decision.status, status, JSON.stringify(decision.candidates));
    assert.deepEqual(decision.selectedSkills, selected);
    assert.deepEqual(decision.skillDetails.map(item => item.id), selected);
    assert.ok(decision.skillDetails.every(item => /[\u3400-\u9fff]/u.test(item.name)));
    assert.equal(decision.action.businessWritesAuthorized, false);
    assert.equal(envelope.result.executionStatus, "not-executed");
    assert.equal(fs.existsSync(path.join(root, ".wl-skills/state/design/runs")), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
