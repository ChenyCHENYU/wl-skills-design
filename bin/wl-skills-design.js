#!/usr/bin/env node

/**
 * wl-skills-design CLI v${PKG.version}
 *
 * 命令:
 *   init      全量安装（默认）— 将 AI 设计技能包复制到当前项目
 *   update    增量更新 — 覆盖有变化的文件，保留用户自定义内容
 *   --version 显示版本号
 *   --help    帮助
 *   --dry-run 预览模式（不实际写入，仅显示将要复制的文件）
 */

const fs = require("fs");
const path = require("path");

const FILES_DIR = path.resolve(__dirname, "..", "files");
const TARGET_DIR = process.cwd();
const PKG = require("../package.json");
const args = process.argv.slice(2);

// ─── 已知命令 / 选项白名单 ───────────────────────────────────────────────
const KNOWN_COMMANDS = new Set(["init", "update"]);
const KNOWN_FLAGS = new Set(["--dry-run", "--help", "-h", "--force", "--version", "-v"]);

const dryRun = args.includes("--dry-run");
const showHelp = args.includes("--help") || args.includes("-h");
const showVersion = args.includes("--version") || args.includes("-v");
const force = args.includes("--force");

if (showVersion) {
  console.log(`${PKG.version}`);
  process.exit(0);
}

if (!showHelp) {
  const unknownFlags = args.filter(
    (a) => a.startsWith("-") && !KNOWN_FLAGS.has(a)
  );
  if (unknownFlags.length > 0) {
    console.error(`\n  ✖ 未知选项: ${unknownFlags.join(", ")}`);
    console.error("  请使用 --help 查看可用选项\n");
    process.exit(1);
  }
}

const positional = args.filter((a) => !a.startsWith("-"));
const command = positional[0] || "init";

if (!KNOWN_COMMANDS.has(command) && !showHelp) {
  console.error(`\n  ✖ 未知命令: ${command}`);
  console.error("  可用命令：init | update | --help\n");
  process.exit(1);
}

// ─── 帮助 ────────────────────────────────────────────────────────────────
if (showHelp) {
  console.log(`
  @agile-team/wl-skills-design v${PKG.version}
  产品设计 AI 技能包 — 一条命令将设计规范和 AI Skill 导入项目

  用法：
    npx @agile-team/wl-skills-design          # 全量安装（init）
    npx @agile-team/wl-skills-design init      # 同上
    npx @agile-team/wl-skills-design update    # 增量更新（覆盖已安装文件）
    npx @agile-team/wl-skills-design --dry-run # 预览，不实际写入

  安装内容：
    .github/copilot-instructions.md    AI 主入口
    .github/standards/                 5 条设计规范（01-flowchart ✅，02~05 规划中）
    .github/skills/                    AI Skill（流程图 ✅，原型/数据库/接口/代码 规划中）
    .github/prompts/                   VS Code Copilot 提示词
    .github/guides/                    使用指南
    CLAUDE.md / AGENTS.md / .cursorrules / .windsurfrules 等（10 种编辑器）
  `);
  process.exit(0);
}

// ─── 工具函数 ────────────────────────────────────────────────────────────
function getAllFiles(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? getAllFiles(full, base) : [full];
  });
}

function copyFile(src, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dest);
}

// ─── init / update 主逻辑 ────────────────────────────────────────────────
function run() {
  if (!fs.existsSync(FILES_DIR)) {
    console.error("\n  ✖ 找不到 files/ 目录，包可能损坏，请重新安装\n");
    process.exit(1);
  }

  const allFiles = getAllFiles(FILES_DIR);
  let copied = 0;
  let skipped = 0;

  console.log(`\n  wl-skills-design v${PKG.version} — ${command === "update" ? "增量更新" : "全量安装"}`);
  if (dryRun) console.log("  [dry-run 模式：不实际写入]\n");

  for (const src of allFiles) {
    const rel = path.relative(FILES_DIR, src);
    const dest = path.join(TARGET_DIR, rel);

    // update 模式：跳过未变化的文件
    if (command === "update" && !force && fs.existsSync(dest)) {
      const srcContent = fs.readFileSync(src);
      const destContent = fs.readFileSync(dest);
      if (srcContent.equals(destContent)) {
        skipped++;
        continue;
      }
    }

    console.log(`  ${dryRun ? "[预览]" : "✔"} ${rel}`);
    if (!dryRun) copyFile(src, dest);
    copied++;
  }

  console.log(`\n  ${dryRun ? "预览完成" : "安装完成"}`);
  console.log(`  ✔ ${dryRun ? "将复制" : "已复制"} ${copied} 个文件${skipped ? `，跳过 ${skipped} 个未变化文件` : ""}`);

  if (!dryRun) {
    console.log(`
  下一步：
    1. 打开 AI 工具（Copilot / Claude / Cursor 等）
    2. 说"帮我画一个流程图，流程是..."
    3. AI 自动识别并调用 draw.io 流程图规范 ✅

  完整文档：.github/guides/usage.md
    `);
  }
}

run();
