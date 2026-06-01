#!/usr/bin/env node

/**
 * check.js — 一致性自检（doctor）
 *
 * 校验项：
 *   1. _registry.md 中标 ✅ 的 Skill，其 SKILL.md 文件真实存在
 *   2. standards/index.md 引用的规范文件都存在
 *   3. 各 SKILL.md 引用的 standards / sub / templates 路径都存在
 *   4. 9 个编辑器配置正文与 copilot-instructions.md 一致（调用 sync --check）
 *
 * 用法：node scripts/check.js
 * 退出码：0 = 全过，1 = 有问题
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const GH = path.join(ROOT, "files", ".github");
const SKILLS = path.join(GH, "skills");
const STANDARDS = path.join(GH, "standards");

const errors = [];
const warnings = [];

function read(p) {
  return fs.readFileSync(p, "utf8");
}
function exists(p) {
  return fs.existsSync(p);
}

// ── 1. _registry.md：✅ Skill 的 SKILL.md 存在 ───────────────────────────
function checkRegistry() {
  const reg = read(path.join(SKILLS, "_registry.md"));
  const rowRe = /^\|.*?\|\s*(✅|🔲|⚠️).*?\|\s*`([^`]+SKILL\.md)`\s*\|/gm;
  let m;
  let checked = 0;
  while ((m = rowRe.exec(reg)) !== null) {
    const [, status, rel] = m;
    const full = path.join(SKILLS, rel);
    if (status === "✅") {
      checked++;
      if (!exists(full)) {
        errors.push(`[registry] ✅ Skill 缺少文件：skills/${rel}`);
      }
    }
  }
  if (checked === 0) warnings.push("[registry] 未解析到任何 ✅ Skill 行，检查表格格式");
  return checked;
}

// ── 2. standards/index.md：引用的规范文件存在 ────────────────────────────
function checkStandardsIndex() {
  const idx = read(path.join(STANDARDS, "index.md"));
  const linkRe = /\]\(\.\/([0-9]{2}-[a-z-]+\.md)\)/g;
  let m;
  let checked = 0;
  while ((m = linkRe.exec(idx)) !== null) {
    checked++;
    if (!exists(path.join(STANDARDS, m[1]))) {
      errors.push(`[standards] index.md 引用了不存在的文件：standards/${m[1]}`);
    }
  }
  return checked;
}

// ── 3. 各 SKILL.md 引用的内部路径存在 ────────────────────────────────────
function checkSkillReferences() {
  const skillFiles = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name === "SKILL.md") skillFiles.push(full);
    }
  })(SKILLS);

  const refRe = /\.github\/(standards\/[0-9]{2}-[a-z-]+\.md|skills\/[A-Za-z0-9_\-/]+\.(md|drawio))/g;
  let checked = 0;
  for (const sf of skillFiles) {
    const content = read(sf);
    let m;
    while ((m = refRe.exec(content)) !== null) {
      checked++;
      const full = path.join(GH, m[1]);
      if (!exists(full)) {
        errors.push(`[skill] ${path.relative(ROOT, sf)} 引用了不存在的路径：.github/${m[1]}`);
      }
    }
  }
  return checked;
}

// ── 4. 编辑器配置漂移 ────────────────────────────────────────────────────
function checkEditorDrift() {
  try {
    execFileSync(process.execPath, [path.join(__dirname, "sync-editors.js"), "--check"], {
      stdio: "pipe",
    });
    return true;
  } catch (e) {
    const out = (e.stdout || "").toString() + (e.stderr || "").toString();
    out
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("-"))
      .forEach((l) => errors.push(`[editor-drift] ${l.replace(/^-\s*/, "")}`));
    if (!out.includes("-")) errors.push("[editor-drift] 编辑器配置与源不一致，运行 npm run sync");
    return false;
  }
}

// ── 编辑器数量（动态，来自 editors.json，消除硬编码漂移）──────────────────
function getEditorCount() {
  try {
    const json = JSON.parse(
      read(path.join(SKILLS, "_compat", "editors.json"))
    );
    return (json.editors || []).filter((e) => e.enabled).length;
  } catch {
    return 0;
  }
}

// ── 主流程 ───────────────────────────────────────────────────────────────
console.log("\n  wl-skills-design doctor — 一致性自检\n");
const r1 = checkRegistry();
const r2 = checkStandardsIndex();
const r3 = checkSkillReferences();
checkEditorDrift();

const editorCount = getEditorCount();
console.log(`  · registry ✅ Skill 检查：${r1} 项`);
console.log(`  · standards index 引用检查：${r2} 项`);
console.log(`  · SKILL.md 内部引用检查：${r3} 项`);
console.log(`  · 编辑器配置漂移检查：${editorCount} 个配置\n`);

if (warnings.length) {
  console.log("  ⚠ 警告：");
  warnings.forEach((w) => console.log(`     ${w}`));
  console.log("");
}

if (errors.length) {
  console.error(`  ✖ 发现 ${errors.length} 个问题：`);
  errors.forEach((er) => console.error(`     ${er}`));
  console.error("");
  process.exit(1);
}

console.log("  ✔ 全部检查通过\n");
