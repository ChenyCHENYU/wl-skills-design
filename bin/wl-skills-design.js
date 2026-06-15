#!/usr/bin/env node

/**
 * wl-skills-design CLI
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
const GH_DIR = path.join(FILES_DIR, ".github");
const MANIFEST = path.join(GH_DIR, "skills", "_manifest.json");
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

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function countFiles(dir, predicate) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countFiles(full, predicate);
    else if (!predicate || predicate(full)) count++;
  }
  return count;
}

function getHelpStats() {
  const manifest = fs.existsSync(MANIFEST) ? readJson(MANIFEST) : { skills: [] };
  const releasedSkills = manifest.skills.filter((s) => s.status === "released").length;
  const plannedSkills = manifest.skills.filter((s) => s.status === "planned").length;
  const promptCount = countFiles(path.join(GH_DIR, "prompts"), (f) =>
    f.endsWith(".prompt.md")
  );
  const standardCount = countFiles(path.join(GH_DIR, "standards"), (f) =>
    /[\\/][0-9]{2}-[a-z-]+\.md$/.test(f)
  );
  const editors = fs.existsSync(path.join(GH_DIR, "skills", "_compat", "editors.json"))
    ? readJson(path.join(GH_DIR, "skills", "_compat", "editors.json")).editors
    : [];
  const editorCount = editors.filter((e) => e.enabled).length;
  return { releasedSkills, plannedSkills, promptCount, standardCount, editorCount };
}

// ─── 帮助 ────────────────────────────────────────────────────────────────
if (showHelp) {
  const stats = getHelpStats();
  console.log(`
  @agile-team/wl-skills-design v${PKG.version}
  产品设计 AI 技能包 — 一条命令将设计规范和 AI Skill 导入项目

  用法：
    npx @agile-team/wl-skills-design          # 全量安装（init）
    npx @agile-team/wl-skills-design init      # 同上
    npx @agile-team/wl-skills-design update    # 增量更新（覆盖已安装文件，本地改动自动备份 .bak）
    npx @agile-team/wl-skills-design --dry-run # 预览，不实际写入
    npx @agile-team/wl-skills-design --force   # 强制覆盖已有文件（覆盖前仍会备份）

  安装内容：
    .github/copilot-instructions.md    AI 主入口
    .github/skills/_manifest.json      机器可读路由表（精准识别、状态门禁、闭环定义）
    .github/standards/                 ${stats.standardCount} 条设计规范
    .github/skills/                    ${stats.releasedSkills} 个已发布 Skill，${stats.plannedSkills} 个规划中 Skill
    .github/prompts/                   VS Code Copilot 提示词（${stats.promptCount} 个）
    .github/guides/                    使用指南
    CLAUDE.md / AGENTS.md / .cursorrules / .windsurfrules 等（${stats.editorCount} 种编辑器）

  覆盖策略：
    init   默认保护已有文件；遇到不同内容会跳过并提示使用 update 或 --force
    update 覆盖不同内容前自动备份为 .bak.<时间戳>
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

function sameContent(src, dest) {
  return fs.existsSync(dest) && fs.readFileSync(src).equals(fs.readFileSync(dest));
}

function backupFile(dest) {
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  let bak = `${dest}.bak.${stamp}`;
  let n = 1;
  while (fs.existsSync(bak)) bak = `${dest}.bak.${stamp}-${n++}`;
  fs.copyFileSync(dest, bak);
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
  let backedUp = 0;
  let protectedFiles = 0;

  console.log(`\n  wl-skills-design v${PKG.version} — ${command === "update" ? "增量更新" : "全量安装"}`);
  if (dryRun) console.log("  [dry-run 模式：不实际写入]\n");
  if (command === "init" && !force) {
    console.log("  [init 默认保护已有文件；如需覆盖请使用 update 或 --force]\n");
  }

  for (const src of allFiles) {
    const rel = path.relative(FILES_DIR, src);
    const dest = path.join(TARGET_DIR, rel);

    if (fs.existsSync(dest)) {
      const same = sameContent(src, dest);
      if (same && !force) {
        skipped++;
        continue;
      }

      if (command === "init" && !force) {
        console.log(`  ${dryRun ? "[预览]" : "↷"} ${rel}（已存在且不同，已保护跳过）`);
        protectedFiles++;
        continue;
      }

      if (!same && !dryRun) {
        backupFile(dest);
        backedUp++;
      }
      const action = same ? "强制刷新" : "备份后覆盖";
      console.log(`  ${dryRun ? "[预览]" : "⚠"} ${rel}（${dryRun ? `将${action}` : action}）`);
      if (!dryRun) copyFile(src, dest);
      copied++;
      continue;
    }

    console.log(`  ${dryRun ? "[预览]" : "✔"} ${rel}`);
    if (!dryRun) copyFile(src, dest);
    copied++;
  }

  console.log(`\n  ${dryRun ? "预览完成" : "安装完成"}`);
  console.log(`  ✔ ${dryRun ? "将复制" : "已复制"} ${copied} 个文件${skipped ? `，跳过 ${skipped} 个未变化文件` : ""}${protectedFiles ? `，保护跳过 ${protectedFiles} 个已有文件` : ""}${backedUp ? `，备份 ${backedUp} 个本地改动文件（.bak）` : ""}`);

  if (protectedFiles && !dryRun) {
    console.log(`
  注意：
    有 ${protectedFiles} 个目标文件已存在且内容不同，init 已保护跳过。
    如确认要升级这些文件，请运行：
      npx @agile-team/wl-skills-design update
    或：
      npx @agile-team/wl-skills-design init --force
    `);
  }

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
