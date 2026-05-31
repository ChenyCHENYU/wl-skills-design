#!/usr/bin/env node

/**
 * sync-editors.js — 多编辑器配置同步器
 *
 * 单一数据源：files/.github/copilot-instructions.md
 * 由 _compat/editors.json + _compat/headers/*.txt 派生出 9 个编辑器配置文件，
 * 并从 package.json 注入版本号（消除 10 处手改版本号的漂移）。
 *
 * 用法：
 *   node scripts/sync-editors.js          # 写入所有编辑器配置
 *   node scripts/sync-editors.js --check   # 只校验是否一致，不写入（CI / 发布前用）
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FILES = path.join(ROOT, "files");
const COMPAT = path.join(FILES, ".github", "skills", "_compat");
const SOURCE = path.join(FILES, ".github", "copilot-instructions.md");
const PKG = require(path.join(ROOT, "package.json"));

const checkOnly = process.argv.includes("--check");
const VERSION = PKG.version;

/** 把正文里的「版本：vX.Y.Z」统一为 package.json 的版本 */
function normalizeVersion(text) {
  return text.replace(/版本：v[0-9]+\.[0-9]+\.[0-9]+/g, `版本：v${VERSION}`);
}

function buildOutputs() {
  const editorsJson = JSON.parse(
    fs.readFileSync(path.join(COMPAT, "editors.json"), "utf8")
  );
  const body = normalizeVersion(fs.readFileSync(SOURCE, "utf8"));

  return editorsJson.editors
    .filter((e) => e.enabled)
    .map((e) => {
      const outPath = path.join(FILES, e.outputPath);
      // GitHub Copilot：源文件即输出，不加头部
      if (e.id === "github-copilot") {
        return { id: e.id, outPath, content: body };
      }
      const header = fs.readFileSync(path.join(COMPAT, e.headerFile), "utf8");
      return { id: e.id, outPath, content: normalizeVersion(header) + body };
    });
}

function run() {
  const outputs = buildOutputs();

  if (checkOnly) {
    const drifted = [];
    for (const o of outputs) {
      const current = fs.existsSync(o.outPath)
        ? fs.readFileSync(o.outPath, "utf8")
        : null;
      if (current !== o.content) drifted.push(path.relative(ROOT, o.outPath));
    }
    if (drifted.length) {
      console.error(`\n  ✖ 编辑器配置与源不一致（${drifted.length} 个）：`);
      drifted.forEach((f) => console.error(`     - ${f}`));
      console.error(`\n  请运行：npm run sync\n`);
      process.exit(1);
    }
    console.log(`  ✔ 10 个编辑器配置与源一致（v${VERSION}）`);
    return;
  }

  let written = 0;
  for (const o of outputs) {
    const dir = path.dirname(o.outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const current = fs.existsSync(o.outPath)
      ? fs.readFileSync(o.outPath, "utf8")
      : null;
    if (current !== o.content) {
      fs.writeFileSync(o.outPath, o.content);
      console.log(`  ✔ 同步 ${path.relative(ROOT, o.outPath)}`);
      written++;
    }
  }
  console.log(
    `\n  同步完成 — ${written} 个文件更新，${outputs.length - written} 个已是最新（v${VERSION}）`
  );
}

run();
