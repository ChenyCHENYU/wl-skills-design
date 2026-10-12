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
test("父关系自指和互相包含在布局写入前拒绝，机械验证不得通过", () => {
  const root = fixture();
  try {
    const original = fs.readFileSync(path.join(root, "input.drawio"));
    for (const [name, parents] of [["self", [["loop-a", "loop-a"]]], ["mutual", [["loop-a", "loop-b"], ["loop-b", "loop-a"]]]]) {
      const nodes = parents.map(([id, parent]) => `<mxCell id="${id}" vertex="1" parent="${parent}"><mxGeometry width="10" height="10" as="geometry"/></mxCell>`).join("");
      const text = original.toString();
      const at = text.lastIndexOf("</root>");
      const xml = text.slice(0, at) + nodes + text.slice(at);
      const input = `${name}.drawio`;
      const output = `absent/${name}.drawio`;
      fs.writeFileSync(path.join(root, input), xml);
      assert.throws(() => layout.layoutFile(root, input, output), /parent.*成环/);
      assert.equal(fs.existsSync(path.join(root, "absent")), false, "拒绝时不能先创建输出目录");
      assert.equal(fs.readFileSync(path.join(root, input), "utf8"), xml);
      const result = verifyFlowchartFile(path.join(root, input));
      assert.equal(result.mechanicalOk, false);
      assert.equal(result.validationStatus, "failed");
      assert.ok(result.checks.some((check) => check.rule === "引用" && check.status === "fail" && check.message.includes("parent 包含关系成环")));
    }
    assert.deepEqual(fs.readFileSync(path.join(root, "input.drawio")), original);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
test("父关系按页判定，业务连线回路与深层合法分组继续允许", () => {
  const cell = (id, parent) => `<mxCell id="${id}"${parent ? ` parent="${parent}"` : ""}/>`;
  const first = `${cell("0")}${cell("1", "0")}${cell("a", "1")}${cell("b", "a")}<mxCell id="ab" source="a" target="b" edge="1" parent="1"/><mxCell id="ba" source="b" target="a" edge="1" parent="1"/>`;
  const second = `${cell("0")}${cell("1", "0")}${cell("b", "1")}${cell("a", "b")}`;
  const xml = `<mxfile>${[first, second].map((nodes) => `<diagram><mxGraphModel><root>${nodes}</root></mxGraphModel></diagram>`).join("")}</mxfile>`;
  assert.doesNotThrow(() => layout.layoutXml(xml));
  assert.deepEqual(layout.parentCycleCells([{ page: 0, id: "a", parent: "b" }, { page: 1, id: "b", parent: "a" }]), []);
  const chain = Array.from({ length: 20000 }, (_, index) => ({ id: String(index), parent: index ? String(index - 1) : undefined }));
  assert.deepEqual(layout.parentCycleCells(chain.reverse()), [], "深层包含关系不使用递归检查");
});
test("非法几何不能绕过 F12，布局拒绝且保留输入字节", () => {
  const root = fixture();
  try {
    const original = fs.readFileSync(path.join(root, "input.drawio"), "utf8");
    const at = original.lastIndexOf("</root>");
    for (const [name, dimensions] of [["negative", 'width="-10" height="20"'], ["nan", 'width="NaN" height="20"'], ["infinite", 'width="10" height="Infinity"'], ["zero", 'width="0" height="20"'], ["missing", 'height="20"']]) {
      const xml = original.slice(0, at) + `<mxCell id="bad-${name}" vertex="1" parent="lane-a"><mxGeometry x="20" y="700" ${dimensions} as="geometry"/></mxCell>` + original.slice(at);
      fs.writeFileSync(path.join(root, `${name}.drawio`), xml);
      assert.throws(() => layout.layoutFile(root, `${name}.drawio`, `not-created/${name}.drawio`), /非法几何/);
      assert.equal(fs.existsSync(path.join(root, "not-created")), false);
      assert.equal(fs.readFileSync(path.join(root, `${name}.drawio`), "utf8"), xml);
      const report = verifyFlowchartFile(path.join(root, `${name}.drawio`));
      assert.equal(report.mechanicalOk, false, name);
      assert.ok(report.checks.some((check) => check.rule === "F12" && check.status === "fail" && check.message.includes(`bad-${name}`)), name);
    }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
test("合法单引号属性和科学计数几何同义，科学计数宽度仍检查容器边界", () => {
  const root = fixture();
  try {
    const original = fs.readFileSync(path.join(root, "input.drawio"), "utf8");
    const equivalent = original.replace(/\b(x|y|width|height)="(-?\d+(?:\.\d+)?)"/g, (_, key, value) => `${key}="${Number(value).toExponential()}"`).replace(/="([^"]*)"/g, (_, value) => `='${value.replace(/'/g, "&apos;")}'`);
    fs.writeFileSync(path.join(root, "equivalent.drawio"), equivalent);
    assert.deepEqual(parseDrawio(path.join(root, "equivalent.drawio")).cells, parseDrawio(path.join(root, "input.drawio")).cells);
    assert.equal(verifyFlowchartFile(path.join(root, "equivalent.drawio")).mechanicalOk, true);
    assert.doesNotThrow(() => layout.layoutXml(equivalent));
    const at = original.lastIndexOf("</root>");
    const overflow = original.slice(0, at) + '<mxCell id="scientific-wide" vertex="1" parent="lane-a"><mxGeometry x="20" y="700" width="1e3" height="20" as="geometry"/></mxCell>' + original.slice(at);
    fs.writeFileSync(path.join(root, "overflow.drawio"), overflow);
    const report = verifyFlowchartFile(path.join(root, "overflow.drawio"));
    assert.equal(report.mechanicalOk, false);
    assert.ok(report.checks.some((check) => check.rule === "F12" && check.status === "fail" && check.message.includes("节点越出容器")));
    layout.layoutFile(root, "overflow.drawio", "expanded.drawio");
    const parsed = parseDrawio(path.join(root, "expanded.drawio"));
    const wide = parsed.cells.find((cell) => cell.id === "scientific-wide");
    const lane = parsed.cells.find((cell) => cell.id === "lane-a");
    assert.equal(wide.geometry.width, 1000);
    assert.ok(lane.geometry.width >= wide.geometry.x + wide.geometry.width);
    assert.equal(verifyFlowchartFile(path.join(root, "expanded.drawio")).mechanicalOk, true);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
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
