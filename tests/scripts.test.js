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
const MANIFEST = path.join(
  ROOT,
  "files",
  ".github",
  "skills",
  "_manifest.json"
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

test("manifest 为每个已发布 Skill 提供可执行闭环要素", () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  assert.strictEqual(manifest.schemaVersion, 1);
  assert.ok(Array.isArray(manifest.skills));

  const requiredLoop = manifest.routingPolicy.requiredCloseLoop;
  const released = manifest.skills.filter((s) => s.status === "released");
  assert.ok(released.length >= 7, `应至少有 7 个已发布 Skill，实际 ${released.length}`);

  const gh = path.join(ROOT, "files", ".github");
  const skillsDir = path.join(gh, "skills");
  for (const skill of released) {
    assert.ok(skill.triggers.exact.length > 0, `${skill.id} 缺少 exact 触发词`);
    assert.ok(skill.triggers.semantic.length > 0, `${skill.id} 缺少 semantic 触发描述`);
    assert.ok(skill.requiredContext.length > 0, `${skill.id} 缺少 requiredContext`);
    assert.ok(skill.outputs.length > 0, `${skill.id} 缺少 outputs`);
    for (const stage of requiredLoop) {
      assert.ok(skill.closeLoop.includes(stage), `${skill.id} 缺少闭环阶段 ${stage}`);
    }
    assert.ok(fs.existsSync(path.join(skillsDir, skill.skillPath)), `${skill.id} 缺少 SKILL.md`);
    for (const rel of skill.standardPaths) {
      assert.ok(fs.existsSync(path.join(gh, rel)), `${skill.id} 规范不存在：${rel}`);
    }
    for (const rel of skill.promptPaths) {
      assert.ok(fs.existsSync(path.join(gh, rel)), `${skill.id} prompt 不存在：${rel}`);
    }
  }
});
