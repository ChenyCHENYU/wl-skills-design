"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const layout = require("../lib/flowchart-layout");
const { parseDrawio, verifyFlowchartFile } = require("../lib/verify");
const sample = path.resolve(__dirname, "../files/.github/skills/requirements-flowchart/examples/01-purchase-approval.drawio");
function fixture() { const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "wl-flowchart-layout-"))); fs.copyFileSync(sample, path.join(root, "input.drawio")); return root; }
test("长中文标题、编码和岗位独立增高，显式换行保留", () => {
  const short = layout.activitySize(["BASE-A-03-E-01", "维护", "业务专员"]);
  const long = layout.activitySize(["BASE-A-03-E-01", "冶金规范基础数据新增申请与多系统审批状态处理".repeat(3), "主数据业务专员与总部审核责任人".repeat(2)]);
  assert.ok(long.width > short.width); assert.ok(long.heights[1] > short.heights[1]); assert.ok(long.heights[2] > short.heights[2]);
  assert.equal(long.height, long.heights.reduce((a, b) => a + b, 0));
  assert.ok(layout.activitySize(["BASE-A-03-E-01", "维护<br>申请<br>审批", "业务专员"]).heights[1] >= 70);
  assert.ok(layout.activitySize(["BASE-A-03-E-01", "MaterialSynchronizationIdentifier".repeat(3), "业务专员"]).width > 260, "不可断开的英文标识符扩宽，不能假设浏览器逐字换行");
});
test("真实 XML 输出可解析、幂等；文字/ID/连线端点/标签保持", () => {
  const root = fixture();
  try {
    const before = parseDrawio(path.join(root, "input.drawio"));
    const adjusted = layout.layoutXml(before.content);
    fs.writeFileSync(path.join(root, "output.drawio"), adjusted.xml);
    assert.equal(layout.layoutXml(adjusted.xml).xml, adjusted.xml);
    const identity = (cell) => [cell.page, cell.id, cell.value, cell.source, cell.target, cell.parent];
    assert.deepEqual(parseDrawio(path.join(root, "output.drawio")).cells.map(identity), before.cells.map(identity));
    assert.equal(verifyFlowchartFile(path.join(root, "output.drawio")).ok, true);
    assert.equal(adjusted.renderStatus, "unverified");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
test("错误 XML、DTD、压缩数据、重复 ID 均拒绝", () => {
  for (const xml of ['<mxfile><diagram></mxfile>', '<!DOCTYPE x><mxfile/>', '<mxfile><diagram>compressed-data</diagram></mxfile>', '<mxfile><diagram><mxGraphModel><root><mxCell id="1"/><mxCell id="1"/></root></mxGraphModel></diagram></mxfile>']) assert.throws(() => layout.layoutXml(xml));
});
test("普通三节点组合保持内部布局，不能仅凭三个子节点改为三行活动", () => {
  const xml = `<mxfile><diagram><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="g" style="group;" vertex="1" parent="1"><mxGeometry width="400" height="60" as="geometry"/></mxCell>${["start", "decision", "end"].map((id, i) => `<mxCell id="${id}" value="${id}" style="${i === 1 ? "rhombus" : "ellipse"};" vertex="1" parent="g"><mxGeometry x="${i * 150}" y="0" width="80" height="60" as="geometry"/></mxCell>`).join("")}</root></mxGraphModel></diagram></mxfile>`;
  const adjusted = layout.layoutXml(xml);
  const cells = (document) => document.children[0].children[0].children[0].children[0].children.filter((node) => node.name === "mxCell");
  const identity = (cell) => ({ id: cell.attrs.id, value: cell.attrs.value, style: cell.attrs.style, geometry: cell.children });
  assert.deepEqual(cells(layout.parseXml(adjusted.xml)).map(identity), cells(layout.parseXml(xml)).map(identity));
  assert.deepEqual(adjusted.changes, []);
});
test("流程图验证与布局复用活动身份，通用 GROUP 不计入活动三行规则", () => {
  const root = fixture();
  try {
    const generic = `<mxCell id="general" style="group;" vertex="1" parent="lane-a"><mxGeometry x="20" y="900" width="240" height="80" as="geometry"/></mxCell>${["start", "decision", "end"].map((id, i) => `<mxCell id="general-${id}" value="${id}" style="${i === 1 ? "rhombus" : "ellipse"};" vertex="1" parent="general"><mxGeometry x="${i * 80}" y="0" width="70" height="60" as="geometry"/></mxCell>`).join("")}`;
    const original = fs.readFileSync(path.join(root, "input.drawio"), "utf8");
    const insertion = original.lastIndexOf("</root>");
    fs.writeFileSync(path.join(root, "generic.drawio"), original.slice(0, insertion) + generic + original.slice(insertion));
    const before = verifyFlowchartFile(path.join(root, "input.drawio"));
    const after = verifyFlowchartFile(path.join(root, "generic.drawio"));
    for (const rule of ["F04", "F05", "F06", "F07", "F08", "F14"]) assert.deepEqual(after.checks.filter((item) => item.rule === rule), before.checks.filter((item) => item.rule === rule));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
test("原图与既有输出不覆盖，dry-run 零写入", () => {
  const root = fixture();
  try {
    const before = fs.readFileSync(path.join(root, "input.drawio"));
    assert.throws(() => layout.layoutFile(root, "input.drawio", "input.drawio"));
    layout.layoutFile(root, "input.drawio", "out.drawio", true);
    assert.equal(fs.existsSync(path.join(root, "out.drawio")), false);
    layout.layoutFile(root, "input.drawio", "out.drawio");
    assert.throws(() => layout.layoutFile(root, "input.drawio", "out.drawio"));
    assert.deepEqual(fs.readFileSync(path.join(root, "input.drawio")), before);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
test("最近存在祖先的外部符号链接拒绝且零写入", () => {
  const root = fixture(); const external = fixture();
  try { fs.symlinkSync(external, path.join(root, "escape")); assert.throws(() => layout.layoutFile(root, "input.drawio", "escape/missing/out.drawio")); assert.equal(fs.existsSync(path.join(external, "missing")), false); }
  finally { fs.rmSync(root, { recursive: true, force: true }); fs.rmSync(external, { recursive: true, force: true }); }
});
test("CLI 调整与真实校验回执关联同一 runId，语义/渲染未验证", () => {
  const root = fixture();
  try {
    const result = spawnSync(process.execPath, [path.resolve(__dirname, "../bin/wl-skills-design.js"), "layout-flowchart", "--target", root, "--file", "input.drawio", "--output", "out.drawio", "--run-id", "layout-real", "--json"], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const value = JSON.parse(result.stdout); assert.equal(value.runId, "layout-real"); assert.equal(value.receipt.executionStatus, "completed"); assert.equal(value.receipt.validationStatus, "partial"); assert.equal(value.renderStatus, "unverified");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
