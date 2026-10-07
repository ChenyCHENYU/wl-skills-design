"use strict";

/**
 * protocol-cli.js — design 的公开集成协议接线（薄层）
 *
 * 协议实现来自快照 integration-protocol.cjs（单源 conformance/support，勿改）；
 * 本文件只提供 design 的能力目录、操作映射，并复用 task-runtime 的原执行器。
 */

const fs = require("node:fs");
const path = require("node:path");
const pkg = require("../package.json");
const capabilitiesDocument = require("./capabilities.json");
const { createProtocol } = require("./integration-protocol.cjs");
const runtime = require("./task-runtime");

const BIN = "wl-skills-design";
const OPERATIONS = [
  { id: "route", summary: "只读任务判定：设计域技能、约束、歧义与缺口（不记录）", readOnly: true, required: ["task"], optional: ["targets", "projectRoot"], sideEffects: "无写入", mapping: `${BIN} route --input "<task>"` },
  { id: "explain", summary: "解释本次任务判定（只读，不记录）", readOnly: true, required: ["task"], optional: ["targets", "projectRoot"], sideEffects: "无写入", mapping: `${BIN} explain --input "<task>"` },
  { id: "task", summary: "判定并持久化任务计划（尚未执行设计动作）", readOnly: false, required: ["task"], optional: ["runId", "targets", "projectRoot"], sideEffects: "写入 .wl-skills-design/runs/ 下本包任务记录", mapping: `${BIN} task --input "<task>" [--run-id <id>]` },
  { id: "status", summary: "读取本包执行回执、验证状态与新鲜度", readOnly: true, required: [], optional: ["runId", "projectRoot"], sideEffects: "无写入", mapping: `${BIN} status --run-id <id>` },
  { id: "doctor-host", summary: "宿主入口静态诊断（不证明宿主已加载）", readOnly: true, required: [], optional: ["host", "projectRoot"], sideEffects: "无写入", mapping: `${BIN} doctor-host --host <host>` },
];

function buildInventory() {
  const commands = [
    { name: "init/update", summary: "安装/安全升级受管文件（冲突保护 + 备份）", execution: "programmatic" },
    { name: "verify", summary: "机械执行设计产物验证子集（spec|flowchart|db|api）", execution: "programmatic" },
    { name: "validate-model", summary: "只读校验设计模型结构与引用", execution: "programmatic" },
    { name: "status/restore/uninstall", summary: "受管文件状态、恢复与安全卸载", execution: "programmatic" },
    { name: "task/route/explain/status/doctor-host", summary: "任务判定与回执（本协议五操作的原入口）", execution: "programmatic" },
    { name: "protocol", summary: "本公开集成协议", execution: "programmatic" },
  ];
  let skills = [];
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "../files/.github/skills/_manifest.json"), "utf8"));
    const capabilityList = manifest.capabilities || manifest.skills || [];
    skills = capabilityList.map((skill) => ({ id: skill.id, description: skill.description || skill.summary || "", intents: skill.intents || [], status: skill.status || "released", entry: `.github/skills/${skill.id}/SKILL.md`, execution: "instructional" }));
  } catch { skills = []; }
  return { skills, commands, mcpTools: [] };
}

const protocol = createProtocol({
  packageName: pkg.name,
  packageVersion: pkg.version,
  capabilities: capabilitiesDocument.capabilities || [],
  constraints: { node: (pkg.engines && pkg.engines.node) || null, boundaryVersion: capabilitiesDocument.boundaryVersion || null },
  operations: OPERATIONS,
  inventory: buildInventory(),
});

function runOperation(operation, input) {
  const projectRoot = input.projectRoot || ".";
  if (operation === "status") return runtime.status(projectRoot, { runId: input.runId });
  if (operation === "doctor-host") return runtime.doctorHost(projectRoot, input.host || "codex");
  return runtime.task(projectRoot, input.task, {
    persist: operation === "task",
    runId: input.runId,
    targets: Array.isArray(input.targets) ? input.targets : [],
  });
}

function envelopeError(code, message, field) {
  return { protocolVersion: 1, package: pkg.name, packageVersion: pkg.version, operation: null, requestId: null, ok: false, error: { code, message, ...(field ? { field } : {}) }, diagnostics: [] };
}

function runCli(argv) {
  const sub = argv[0];
  const defaultRoot = argv[argv.indexOf("--target") + 1] || process.cwd();
  if (sub === "describe") {
    console.log(JSON.stringify(protocol.describe(), null, 2));
    return 0;
  }
  if (sub === "request") {
    const fileIndex = argv.indexOf("--input-file");
    const file = fileIndex >= 0 ? argv[fileIndex + 1] : null;
    if (!file) {
      console.log(JSON.stringify(envelopeError("missing-input", "缺少必要输入：--input-file <request.json>", "input-file"), null, 2));
      return 2;
    }
    let input;
    try {
      input = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
    } catch (error) {
      const message = error.code === "ENOENT" ? `请求文件不存在：${file}` : `请求文件无法解析：${error.message}`;
      console.log(JSON.stringify(envelopeError("invalid-input", message, "input-file"), null, 2));
      return 2;
    }
    if (input && typeof input === "object" && !input.projectRoot) input.projectRoot = defaultRoot;
    const envelope = protocol.request(input, runOperation);
    console.log(JSON.stringify(envelope, null, 2));
    return envelope.ok ? 0 : 2;
  }
  console.error("用法：");
  console.error("  wl-skills-design protocol describe --json");
  console.error("  wl-skills-design protocol request --input-file <request.json> --json");
  return 2;
}

module.exports = { protocol, runOperation, runCli, OPERATIONS };
