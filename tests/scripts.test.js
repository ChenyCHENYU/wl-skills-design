"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CHECK = path.join(ROOT, "scripts", "check.js");
const SYNC = path.join(ROOT, "scripts", "sync-editors.js");
const SMOKE = path.join(ROOT, "scripts", "package-smoke.js");
const MANIFEST = path.join(ROOT, "files", ".github", "skills", "_manifest.json");
const EVALS = path.join(ROOT, "files", ".github", "skills", "_route-evals.json");
const { route } = require(CHECK);

function run(script, args = []) {
  return spawnSync(process.execPath, [script, ...args], { cwd: ROOT, encoding: "utf8" });
}

test("sync-editors --check 无漂移", () => {
  const result = run(SYNC, ["--check"]);
  assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("doctor 全部通过", () => {
  const result = run(CHECK);
  assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /全部检查通过/);
});

test("所有已发布 Skill 满足原生命名和最小 frontmatter", () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  assert.strictEqual(manifest.schemaVersion, 2);
  for (const skill of manifest.skills.filter((item) => item.status === "released")) {
    const file = path.join(ROOT, "files", ".github", "skills", skill.skillPath);
    const content = fs.readFileSync(file, "utf8");
    const name = content.match(/^---\r?\nname:\s*([^\r\n]+)/)?.[1];
    assert.strictEqual(name, path.basename(path.dirname(file)));
    const header = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || "";
    const keys = [...header.matchAll(/^([a-zA-Z][a-zA-Z0-9-]*):/gm)].map((match) => match[1]).sort();
    assert.deepStrictEqual(keys, ["description", "name"]);
    assert.ok(content.split(/\r?\n/).length <= 500);
  }
});

test("路由回归语料全部命中", () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const evals = JSON.parse(fs.readFileSync(EVALS, "utf8"));
  for (const item of evals.cases) {
    const actual = route(item.prompt, manifest);
    assert.strictEqual(actual.skill, item.skill, item.prompt);
    assert.strictEqual(actual.intent, item.intent, item.prompt);
  }
});

test("路由实际计入上下文信号且保留判定证据", () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const actual = route("评审一下接口设计", manifest);
  const api = actual.candidates.find((item) => item.id === "api.restful");
  assert.strictEqual(api.exact, true);
  assert.strictEqual(api.context, true);
  assert.strictEqual(api.negative, false);
  assert.strictEqual(api.score, 100);
});

test("Prompt 使用当前 agent 元数据且验证默认只读", () => {
  const dir = path.join(ROOT, "files", ".github", "prompts");
  const prompts = fs.readdirSync(dir).filter((name) => name.endsWith(".prompt.md"));
  assert.strictEqual(prompts.length, 15);
  for (const name of prompts) {
    const content = fs.readFileSync(path.join(dir, name), "utf8");
    assert.match(content, /^---\r?\nagent: agent/m);
    assert.doesNotMatch(content, /^mode:/m);
    assert.doesNotMatch(content, /read_file|create_file|replace_string_in_file/);
    if (name.startsWith("validate-")) assert.match(content, /默认不修改|不修改目标|只读/);
  }
});

test("package smoke 通过", () => {
  const result = run(SMOKE);
  assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
