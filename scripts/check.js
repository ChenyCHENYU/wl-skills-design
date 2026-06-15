#!/usr/bin/env node

/**
 * check.js — 一致性自检（doctor）
 *
 * 校验项：
 *   1. _manifest.json 路由完整，已发布 Skill 具备可执行闭环要素
 *   2. _registry.md 与 manifest 的状态/路径一致
 *   3. standards/index.md 引用的规范文件都存在
 *   4. 各 SKILL.md / prompt 引用的内部路径都存在
 *   5. 10 个编辑器配置正文与 copilot-instructions.md 一致（调用 sync --check）
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
const MANIFEST = path.join(SKILLS, "_manifest.json");

const errors = [];
const warnings = [];

function read(p) {
  return fs.readFileSync(p, "utf8");
}
function exists(p) {
  return fs.existsSync(p);
}
function readJson(p) {
  return JSON.parse(read(p));
}
function hasFiles(dir) {
  return exists(dir) && fs.readdirSync(dir, { withFileTypes: true }).some((e) => e.isFile());
}
function parseRegistryRows() {
  const reg = read(path.join(SKILLS, "_registry.md"));
  const rowRe = /^\|\s*([^|]+?)\s*\|\s*(✅|🔲|⚠️).*?\|\s*`([^`]+SKILL\.md)`\s*\|/gm;
  const rows = new Map();
  let m;
  while ((m = rowRe.exec(reg)) !== null) {
    rows.set(m[3], {
      name: m[1].trim(),
      status: m[2],
      skillPath: m[3],
    });
  }
  return rows;
}

// ── 0. _manifest.json：机器可读路由表完整性 ──────────────────────────────
function checkManifest() {
  if (!exists(MANIFEST)) {
    errors.push("[manifest] 缺少机器可读路由表：skills/_manifest.json");
    return { released: 0, total: 0 };
  }

  let manifest;
  try {
    manifest = readJson(MANIFEST);
  } catch (e) {
    errors.push(`[manifest] _manifest.json 不是合法 JSON：${e.message}`);
    return { released: 0, total: 0 };
  }

  if (manifest.schemaVersion !== 1) {
    errors.push("[manifest] schemaVersion 必须为 1");
  }
  if (!Array.isArray(manifest.skills) || manifest.skills.length === 0) {
    errors.push("[manifest] skills 必须是非空数组");
    return { released: 0, total: 0 };
  }

  const requiredLoop = manifest.routingPolicy?.requiredCloseLoop || [
    "generate",
    "validate",
    "repair",
    "revalidate",
  ];
  const seenIds = new Set();
  const seenPaths = new Set();
  const allowedStatus = new Set(["released", "planned", "deprecated"]);
  let released = 0;

  for (const skill of manifest.skills) {
    const label = skill.id || skill.name || "<unknown>";

    if (!skill.id || seenIds.has(skill.id)) {
      errors.push(`[manifest] Skill id 缺失或重复：${label}`);
    }
    seenIds.add(skill.id);

    if (!allowedStatus.has(skill.status)) {
      errors.push(`[manifest] ${label} status 非法：${skill.status}`);
    }
    if (!skill.skillPath || seenPaths.has(skill.skillPath)) {
      errors.push(`[manifest] ${label} skillPath 缺失或重复：${skill.skillPath}`);
    }
    seenPaths.add(skill.skillPath);

    if (!Array.isArray(skill.triggers?.exact) || skill.triggers.exact.length === 0) {
      errors.push(`[manifest] ${label} 缺少 exact 触发词`);
    }
    if (!Array.isArray(skill.triggers?.semantic) || skill.triggers.semantic.length === 0) {
      errors.push(`[manifest] ${label} 缺少 semantic 语义触发描述`);
    }
    if (!Array.isArray(skill.requiredContext) || skill.requiredContext.length === 0) {
      errors.push(`[manifest] ${label} 缺少 requiredContext`);
    }
    if (!Array.isArray(skill.outputs) || skill.outputs.length === 0) {
      errors.push(`[manifest] ${label} 缺少 outputs`);
    }

    for (const rel of skill.standardPaths || []) {
      if (!exists(path.join(GH, rel))) {
        errors.push(`[manifest] ${label} 引用了不存在的规范：.github/${rel}`);
      }
    }
    for (const rel of skill.promptPaths || []) {
      if (!exists(path.join(GH, rel))) {
        errors.push(`[manifest] ${label} 引用了不存在的 prompt：.github/${rel}`);
      }
    }

    if (skill.status !== "released") continue;
    released++;

    if (!Array.isArray(skill.standardPaths) || skill.standardPaths.length === 0) {
      errors.push(`[manifest] ${label} 已发布但未声明 standardPaths`);
    }
    if (!Array.isArray(skill.promptPaths) || skill.promptPaths.length === 0) {
      errors.push(`[manifest] ${label} 已发布但未声明 promptPaths`);
    }
    for (const stage of requiredLoop) {
      if (!skill.closeLoop?.includes(stage)) {
        errors.push(`[manifest] ${label} 闭环缺少阶段：${stage}`);
      }
    }

    const skillFile = path.join(SKILLS, skill.skillPath);
    if (!exists(skillFile)) {
      errors.push(`[manifest] ${label} 已发布但缺少 SKILL.md：skills/${skill.skillPath}`);
      continue;
    }
    const skillDir = path.dirname(skillFile);
    if (!exists(path.join(skillDir, "USAGE.md"))) {
      errors.push(`[manifest] ${label} 缺少 USAGE.md`);
    }
    if (!hasFiles(path.join(skillDir, "templates"))) {
      errors.push(`[manifest] ${label} templates/ 必须至少包含 1 个模板文件`);
    }
    if (!hasFiles(path.join(skillDir, "examples"))) {
      errors.push(`[manifest] ${label} examples/ 必须至少包含 1 个真实样例`);
    }
  }

  return { released, total: manifest.skills.length };
}

// ── 1. _registry.md：与 manifest 的状态/路径保持一致 ───────────────────
function checkRegistry(manifestStats) {
  const rows = parseRegistryRows();
  const manifest = exists(MANIFEST) ? readJson(MANIFEST) : { skills: [] };
  const statusToSymbol = {
    released: "✅",
    planned: "🔲",
    deprecated: "⚠️",
  };
  let checked = 0;
  for (const skill of manifest.skills || []) {
    const row = rows.get(skill.skillPath);
    if (!row) {
      errors.push(`[registry] manifest 中的 ${skill.id} 未在 _registry.md 登记：${skill.skillPath}`);
      continue;
    }
    const expected = statusToSymbol[skill.status];
    if (row.status !== expected) {
      errors.push(`[registry] ${skill.id} 状态与 manifest 不一致：registry=${row.status}, manifest=${expected}`);
    }
    if (skill.status === "released") {
      checked++;
      if (!exists(path.join(SKILLS, skill.skillPath))) {
        errors.push(`[registry] ✅ Skill 缺少文件：skills/${skill.skillPath}`);
      }
    }
  }
  for (const row of rows.values()) {
    if (!(manifest.skills || []).some((s) => s.skillPath === row.skillPath)) {
      errors.push(`[registry] _registry.md 中存在 manifest 未登记的 Skill：${row.skillPath}`);
    }
  }
  if (checked === 0 || checked !== manifestStats.released) {
    warnings.push("[registry] ✅ Skill 数量与 manifest 不一致，检查表格格式");
  }
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

// ── 3b. prompt 内部路径存在 ───────────────────────────────────────────────
function checkPromptReferences() {
  const promptDir = path.join(GH, "prompts");
  if (!exists(promptDir)) return 0;
  const promptFiles = fs
    .readdirSync(promptDir)
    .filter((name) => name.endsWith(".prompt.md"))
    .map((name) => path.join(promptDir, name));

  const refRe = /\.github\/([A-Za-z0-9_\-/.]+(?:\.md|\.drawio|\.json))/g;
  let checked = 0;
  for (const pf of promptFiles) {
    const content = read(pf);
    let m;
    while ((m = refRe.exec(content)) !== null) {
      checked++;
      const full = path.join(GH, m[1]);
      if (!exists(full)) {
        errors.push(`[prompt] ${path.relative(ROOT, pf)} 引用了不存在的路径：.github/${m[1]}`);
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
const m0 = checkManifest();
const r1 = checkRegistry(m0);
const r2 = checkStandardsIndex();
const r3 = checkSkillReferences();
const r4 = checkPromptReferences();
checkEditorDrift();

const editorCount = getEditorCount();
console.log(`  · manifest 路由完整性检查：${m0.released}/${m0.total} 个已发布/总 Skill`);
console.log(`  · registry/manifest 对齐检查：${r1} 个已发布 Skill`);
console.log(`  · standards index 引用检查：${r2} 项`);
console.log(`  · SKILL.md 内部引用检查：${r3} 项`);
console.log(`  · prompt 内部引用检查：${r4} 项`);
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
