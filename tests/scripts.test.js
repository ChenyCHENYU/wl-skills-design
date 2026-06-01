/**
 * 构建脚本测试 — scripts/sync-editors.js + scripts/check.js
 *
 * 覆盖：sync --check 通过 / check 通过 /
 *       editors.json 启用数与生成产物数一致 /
 *       check.js 的 registry 正则能解析到 ✅ Skill
 *
 * 运行：node --test
 */

const { test } = require("node:test");
const assert = require("node:assert");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SYNC = path.join(ROOT, "scripts", "sync-editors.js");
const CHECK = path.join(ROOT, "scripts", "check.js");
const EDITORS = path.join(
  ROOT,
  "files",
  ".github",
  "skills",
  "_compat",
  "editors.json"
);
const REGISTRY = path.join(
  ROOT,
  "files",
  ".github",
  "skills",
  "_registry.md"
);

function run(script, args = []) {
  try {
    const stdout = execFileSync(process.execPath, [script, ...args], {
      cwd: ROOT,
      stdio: "pipe",
    }).toString();
    return { code: 0, stdout, stderr: "" };
  } catch (e) {
    return {
      code: e.status ?? 1,
      stdout: (e.stdout || "").toString(),
      stderr: (e.stderr || "").toString(),
    };
  }
}

test("sync-editors --check 当前应无漂移", () => {
  const r = run(SYNC, ["--check"]);
  assert.strictEqual(r.code, 0, `sync --check 失败:\n${r.stdout}\n${r.stderr}`);
});

test("check.js doctor 全部通过", () => {
  const r = run(CHECK);
  assert.strictEqual(r.code, 0, `doctor 失败:\n${r.stdout}\n${r.stderr}`);
  assert.match(r.stdout, /全部检查通过/);
});

test("doctor 报告的编辑器数与 editors.json 启用数一致", () => {
  const json = JSON.parse(fs.readFileSync(EDITORS, "utf8"));
  const enabled = json.editors.filter((e) => e.enabled).length;
  const r = run(CHECK);
  const m = r.stdout.match(/编辑器配置漂移检查：(\d+) 个配置/);
  assert.ok(m, "doctor 输出应含编辑器配置数");
  assert.strictEqual(Number(m[1]), enabled);
});

test("registry 解析正则能命中 ✅ Skill 行", () => {
  const reg = fs.readFileSync(REGISTRY, "utf8");
  const rowRe = /^\|.*?\|\s*(✅|🔲|⚠️).*?\|\s*`([^`]+SKILL\.md)`\s*\|/gm;
  const released = [];
  let m;
  while ((m = rowRe.exec(reg)) !== null) {
    if (m[1] === "✅") released.push(m[2]);
  }
  assert.ok(released.length >= 5, `应至少解析到 5 个 ✅ Skill，实际 ${released.length}`);
  // 每个 ✅ Skill 的 SKILL.md 必须真实存在
  const skillsDir = path.join(ROOT, "files", ".github", "skills");
  for (const rel of released) {
    assert.ok(
      fs.existsSync(path.join(skillsDir, rel)),
      `缺少文件 skills/${rel}`
    );
  }
});
