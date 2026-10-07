"use strict";

const test = require("node:test");
const assert = require("assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { protocol, runOperation } = require("../lib/protocol-cli");
const pkg = require("../package.json");

const BIN = path.join(__dirname, "..", "bin", "wl-skills-design.js");

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "wl-design-protocol-"));
}

test("describe 返回协议版本、能力目录与五个统一操作", () => {
  const described = protocol.describe();
  assert.equal(described.protocolVersion, 1);
  assert.equal(described.package, pkg.name);
  assert.ok(Array.isArray(described.capabilities) && described.capabilities.length > 0);
  assert.deepEqual(described.operations.map((operation) => operation.id), ["route", "explain", "task", "status", "doctor-host"]);
});

test("route 只读判定返回六类状态之一且不记录 run", () => {
  const root = tempRoot();
  const envelope = protocol.request({ operation: "route", projectRoot: root, task: "为设备点检模块生成需求说明书骨架" }, runOperation);
  assert.equal(envelope.ok, true);
  assert.ok(["matched", "baseline", "ambiguous", "gap", "not-applicable", "needs-context"].includes(envelope.result.decision.status));
});

test("task 持久化返回 runId 且 status 可回查", () => {
  const root = tempRoot();
  const planned = protocol.request({ operation: "task", projectRoot: root, task: "评估 docs/legacy 设计文档差距" }, runOperation);
  assert.equal(planned.ok, true);
  assert.ok(planned.result.runId);
  const status = protocol.request({ operation: "status", projectRoot: root, runId: planned.result.runId }, runOperation);
  assert.equal(status.ok, true);
  assert.equal(status.result.runId, planned.result.runId);
  assert.equal(status.result.executionStatus, "not-executed");
});

test("doctor-host 按指定 host 诊断", () => {
  const root = tempRoot();
  const envelope = protocol.request({ operation: "doctor-host", projectRoot: root, host: "claude" }, runOperation);
  assert.equal(envelope.ok, true);
  assert.equal(envelope.result.host, "claude");
});

test("协议错误码：missing-input / unknown-operation / invalid-input / unsupported-protocol", () => {
  assert.equal(protocol.request({ operation: "route" }, runOperation).error.code, "missing-input");
  assert.equal(protocol.request({ operation: "paint" }, runOperation).error.code, "unknown-operation");
  assert.equal(protocol.request([], runOperation).error.code, "invalid-input");
  assert.equal(protocol.request({ protocolVersion: 2, operation: "route", task: "x" }, runOperation).error.code, "unsupported-protocol");
});

test("边界输入校验：非法类型在触达执行器前判 invalid-input（独立复验缺陷回归）", () => {
  const invalidPayloads = [
    { operation: "task", task: true },
    { operation: "task", task: { text: "bad" } },
    { operation: "task", task: "检查目标", targets: [null, 42, {}] },
    { operation: "route", task: "检查目标", projectRoot: 42 },
    { operation: "task", task: "检查目标", runId: {} },
  ];
  for (const payload of invalidPayloads) {
    const envelope = protocol.request(payload, () => { throw new Error("不应触达执行器"); });
    assert.equal(envelope.ok, false);
    assert.equal(envelope.error.code, "invalid-input");
    assert.ok(envelope.error.field);
  }
});

test("CLI 缺 --input-file 时 stdout 输出 missing-input JSON 信封", () => {
  const run = spawnSync(process.execPath, [BIN, "protocol", "request"], { encoding: "utf8" });
  assert.equal(run.status, 2);
  const envelope = JSON.parse(run.stdout);
  assert.equal(envelope.ok, false);
  assert.equal(envelope.error.code, "missing-input");
  assert.equal(envelope.error.field, "input-file");
});

test("CLI protocol describe / request 全链路", () => {
  const describe = spawnSync(process.execPath, [BIN, "protocol", "describe"], { encoding: "utf8" });
  assert.equal(describe.status, 0);
  assert.equal(JSON.parse(describe.stdout).package, "@agile-team/wl-skills-design");
  const root = tempRoot();
  const file = path.join(root, "req.json");
  fs.writeFileSync(file, JSON.stringify({ operation: "route", task: "生成数据库设计" }));
  const request = spawnSync(process.execPath, [BIN, "protocol", "request", "--input-file", file, "--target", root], { encoding: "utf8" });
  assert.equal(request.status, 0);
  assert.equal(JSON.parse(request.stdout).ok, true);
});
