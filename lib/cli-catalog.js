"use strict";

/**
 * Native command names, dispatch identity and public descriptions share this catalog.
 * readOnly describes all filesystem effects: checking business files can still record a run.
 * This catalog does not grant protocol executor permissions (executors.json owns those).
 */
const COMMAND_CATALOG = Object.freeze(Object.fromEntries(Object.entries({
  init: {
    dispatch: "install", args: "[--target <dir>] [--editor <id[,id]>] [--dry-run] [--force]",
    summary: "安装技能包；默认 agents profile，冲突保护和备份",
    readOnly: false, sideEffects: "写入本包受管文件、安装状态和备份；--dry-run 无写入",
  },
  update: {
    dispatch: "install", args: "[--target <dir>] [--editor <id[,id]>] [--dry-run] [--force]",
    summary: "安全升级；本地改动默认视为冲突，--force 仅更新本包已有归属",
    readOnly: false, sideEffects: "更新本包受管文件、状态并备份；保留外来内容，--dry-run 无写入",
  },
  status: {
    dispatch: "status", args: "[--target <dir>] [--run-id <id>]",
    summary: "读取受管文件状态；--run-id 读取实际执行回执与新鲜度",
    readOnly: true, sideEffects: "无写入",
  },
  doctor: {
    dispatch: "doctor", args: "[--target <dir>] [--host <name>]",
    summary: "检查本包安装与 Skill；--host 仅静态宿主入口诊断",
    readOnly: true, sideEffects: "无写入；不证明宿主加载或模型读取",
  },
  "validate-model": {
    dispatch: "validateModel", args: "[--target <dir>] [--model <file>] [--run-id <id>]",
    summary: "只读检查设计模型结构、稳定 ID 与引用，独立记录校验回执",
    readOnly: false, sideEffects: "不改模型；写入 .wl-skills-design/runs/ 实际校验回执",
  },
  verify: {
    dispatch: "verify", args: "<spec|flowchart|db|api> [--target <dir>] [--file <path>]... [--run-id <id>]",
    summary: "按指定文件或目录执行设计验证机械子集；语义/未覆盖项单独报告",
    readOnly: false, sideEffects: "不改业务文档；写入 .wl-skills-design/runs/ 实际校验回执",
  },
  "layout-flowchart": {
    dispatch: "layoutFlowchart", args: "--file <drawio> [--target <dir>] [--output <new.drawio>] [--run-id <id>] [--dry-run]",
    summary: "按文字调整活动宽高、泳道与间距；输出新图，语义/渲染待复核",
    readOnly: false, sideEffects: "新建流程图并写本包 runs 回执，不覆盖原图；--dry-run 无写入",
  },
  restore: {
    dispatch: "restore", args: "[--target <dir>] [--list | --id <backupId>] [--dry-run]",
    summary: "列出备份或恢复最近/指定安装、升级、卸载前状态",
    readOnly: false, sideEffects: "恢复本包受管内容并生成安全快照；--list/--dry-run 无写入",
  },
  uninstall: {
    dispatch: "uninstall", args: "[--target <dir>] [--purge] [--dry-run]",
    summary: "卸载本包贡献；保留用户修改、外来内容和引用",
    readOnly: false, sideEffects: "删除本包受管内容并记录备份；--purge 清理可信快照，--dry-run 无写入",
  },
  task: {
    dispatch: "taskDecision", args: "--input <任务> [--target <dir>] [--file <path>]... [--run-id <id>]",
    summary: "判定并持久化任务计划、候选、规则与缺口；尚未执行业务动作",
    readOnly: false, sideEffects: "写入 .wl-skills-design/runs/ 本包任务计划",
  },
  route: {
    dispatch: "taskDecision", args: "--input <任务> [--target <dir>] [--file <path>]...",
    summary: "只读任务判定；不记录 run",
    readOnly: true, sideEffects: "无写入",
  },
  explain: {
    dispatch: "taskDecision", args: "--input <任务> [--target <dir>] [--file <path>]...",
    summary: "只读任务判定解释；不记录 run",
    readOnly: true, sideEffects: "无写入",
  },
  "doctor-host": {
    dispatch: "doctorHost", args: "[--target <dir>] [--host <name>]",
    summary: "静态宿主入口诊断；不证明宿主加载或模型读取",
    readOnly: true, sideEffects: "无写入",
  },
  protocol: {
    dispatch: "protocol", args: "describe | request --input-file <request.json> [--target <dir>]",
    summary: "公开 JSON 协议：能力目录、判定、状态与受控 execute",
    readOnly: false, sideEffects: "describe 无写入；request 按操作声明，task/execute 写本包 runs 回执",
  },
}).map(([name, metadata]) => [name, Object.freeze(metadata)])));

const COMMAND_NAMES = Object.freeze(Object.keys(COMMAND_CATALOG));

function getCommand(name) {
  return Object.hasOwn(COMMAND_CATALOG, name) ? COMMAND_CATALOG[name] : undefined;
}

function commandInventory() {
  return COMMAND_NAMES.map((name) => {
    const { args, summary, readOnly, sideEffects } = COMMAND_CATALOG[name];
    return { name, args, summary, readOnly, sideEffects, execution: "programmatic" };
  });
}

function helpCommandLines() {
  return COMMAND_NAMES.map((name) => `  ${name.padEnd(18)} ${COMMAND_CATALOG[name].args}\n${" ".repeat(21)}${COMMAND_CATALOG[name].summary}`).join("\n");
}

module.exports = { COMMAND_CATALOG, COMMAND_NAMES, commandInventory, getCommand, helpCommandLines };
