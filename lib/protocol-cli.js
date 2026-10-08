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
    { name: "init", args: "[--target <dir>] [--editor <id>]", summary: "安装技能包（默认 agents profile）", execution: "programmatic", sideEffects: "写入受管文件（冲突保护+备份）" },
    { name: "update", args: "[--target <dir>]", summary: "安全升级；本地改动视为冲突", execution: "programmatic", sideEffects: "仅更新未修改受管文件" },
    { name: "status", args: "[--target <dir>] [--run-id <id>]", summary: "受管文件状态 / 执行回执", execution: "programmatic", sideEffects: "无" },
    { name: "verify", args: "<spec|flowchart|db|api> [--file <path>] [--run-id <id>]", summary: "机械执行设计产物验证子集", execution: "programmatic", sideEffects: "写 .wl-skills-design/runs/ 回执" },
    { name: "validate-model", args: "[--model <file>]", summary: "只读校验设计模型", execution: "programmatic", sideEffects: "无" },
    { name: "doctor", args: "[--host <name>]", summary: "安装诊断 / 宿主入口静态诊断", execution: "programmatic", sideEffects: "无" },
    { name: "restore", args: "", summary: "恢复最近一次安装/升级/卸载前状态", execution: "programmatic", sideEffects: "回写受管文件" },
    { name: "uninstall", args: "[--target <dir>]", summary: "卸载受管文件；不静默删除本地改动", execution: "programmatic", sideEffects: "删除本包受管文件" },
    { name: "task", args: "--input <任务> [--run-id <id>]", summary: "判定并持久化任务计划", execution: "programmatic", sideEffects: "写 .wl-skills-design/runs/" },
    { name: "route", args: "--input <任务>", summary: "只读判定", execution: "programmatic", sideEffects: "无" },
    { name: "explain", args: "--input <任务>", summary: "只读判定解释", execution: "programmatic", sideEffects: "无" },
    { name: "doctor-host", args: "[--host <name>]", summary: "宿主入口静态诊断", execution: "programmatic", sideEffects: "无" },
    { name: "protocol", args: "describe | request --input-file <file>", summary: "本公开集成协议", execution: "programmatic", sideEffects: "见操作声明" },
  ];
  let skills = [];
  const loadErrors = [];
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "../files/.github/skills/_manifest.json"), "utf8"));
    skills = (manifest.skills || []).map((skill) => ({
      id: skill.id,
      description: skill.name,
      intents: skill.intents || [],
      status: skill.status || "released",
      entry: `.github/skills/${skill.skillPath}`,
      execution: "instructional",
    }));
  } catch (error) {
    loadErrors.push(`skills manifest 加载失败：${error.message}`);
  }
  return { skills, commands, mcpTools: [], loadErrors };
}

const protocol = createProtocol({
  packageName: pkg.name,
  packageVersion: pkg.version,
  capabilities: capabilitiesDocument.capabilities || [],
  constraints: { node: (pkg.engines && pkg.engines.node) || null, boundaryVersion: capabilitiesDocument.boundaryVersion || null },
  operations: OPERATIONS,
  inventory: buildInventory(),
});

function runOperation(operation, input, diagnostics) {
  const projectRoot = input.projectRoot || ".";
  if (input.context && diagnostics) diagnostics.push("context 字段不参与本包判定：design 的任务判定基于 input/targets，context 已显式忽略");
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
    if (input && typeof input === "object" && input.projectRoot === undefined) input.projectRoot = defaultRoot;
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
