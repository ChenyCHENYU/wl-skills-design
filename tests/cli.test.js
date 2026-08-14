"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "bin", "wl-skills-design.js");
const PKG = require(path.join(ROOT, "package.json"));

function runCli(args, cwd = ROOT) {
  const result = spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: "utf8" });
  return { code: result.status ?? 1, stdout: result.stdout || "", stderr: result.stderr || "" };
}

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "wlsd-test-"));
}

function withTemp(fn) {
  const dir = tmpDir();
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("--version 与 --help", () => {
  assert.strictEqual(runCli(["--version"]).stdout.trim(), PKG.version);
  const help = runCli(["--help"]);
  assert.strictEqual(help.code, 0);
  assert.match(help.stdout, /restore/);
  assert.match(help.stdout, /--editor/);
});

test("未知选项和命令失败", () => {
  assert.strictEqual(runCli(["--nope"]).code, 1);
  assert.strictEqual(runCli(["frobnicate"]).code, 1);
});

test("require CLI 不执行安装", () => withTemp((dir) => {
  const code = `process.chdir(${JSON.stringify(dir)});require(${JSON.stringify(CLI)})`;
  const result = spawnSync(process.execPath, ["-e", code], { encoding: "utf8" });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.deepStrictEqual(fs.readdirSync(dir), []);
}));

test("validate-model 只读校验实际项目模型", () => withTemp((dir) => {
  fs.mkdirSync(path.join(dir, "docs"));
  fs.writeFileSync(path.join(dir, "docs", "design-model.json"), JSON.stringify({
    schemaVersion: 1,
    projectCode: "TASK_APP",
    fields: [],
    functions: [],
    traceLinks: [],
  }), "utf8");
  const before = fs.readdirSync(dir).sort();
  const result = runCli(["validate-model", "--json"], dir);
  assert.strictEqual(result.code, 0, result.stderr);
  assert.strictEqual(JSON.parse(result.stdout).ok, true);
  assert.deepStrictEqual(fs.readdirSync(dir).sort(), before);
  assert.ok(!fs.existsSync(path.join(dir, ".wl-skills-design")));
}));

test("validate-model 对断链引用返回失败", () => withTemp((dir) => {
  const file = path.join(dir, "model.json");
  fs.writeFileSync(file, JSON.stringify({
    schemaVersion: 1,
    projectCode: "TASK_APP",
    fields: [],
    functions: [{ id: "FUNC_QUERY", code: "QUERY", name: "查询", inputFieldIds: ["FIELD_MISSING"], outputFieldIds: [], source: { path: "requirements.md" } }],
    traceLinks: [],
  }), "utf8");
  const result = runCli(["validate-model", "--model", file, "--json"], dir);
  assert.strictEqual(result.code, 1);
  assert.ok(JSON.parse(result.stdout).errors.some((item) => item.code === "DM008"));
}));

test("init 默认只安装 agents profile 并写状态", () => withTemp((dir) => {
  const result = runCli(["init", "--json"], dir);
  assert.strictEqual(result.code, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.deepStrictEqual(output.editors, ["agents"]);
  assert.ok(fs.existsSync(path.join(dir, "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(dir, ".github", "skills", "requirements-flowchart", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(dir, ".wl-skills-design", "state.json")));
  assert.ok(!fs.existsSync(path.join(dir, "CLAUDE.md")));
  assert.ok(!fs.existsSync(path.join(dir, ".github", "copilot-instructions.md")));
}));

test("--editor cursor 只安装当前路径，不安装 legacy 文件", () => withTemp((dir) => {
  const result = runCli(["init", "--editor", "cursor"], dir);
  assert.strictEqual(result.code, 0, result.stderr);
  assert.ok(fs.existsSync(path.join(dir, ".cursor", "rules", "conventions.mdc")));
  assert.ok(!fs.existsSync(path.join(dir, ".cursorrules")));
  assert.ok(!fs.existsSync(path.join(dir, "AGENTS.md")));
}));

test("init 冲突时事务前退出，不产生半套文件", () => withTemp((dir) => {
  fs.writeFileSync(path.join(dir, "AGENTS.md"), "用户规则", "utf8");
  const result = runCli(["init"], dir);
  assert.strictEqual(result.code, 2);
  assert.strictEqual(fs.readFileSync(path.join(dir, "AGENTS.md"), "utf8"), "用户规则");
  assert.ok(!fs.existsSync(path.join(dir, ".github")));
  assert.ok(!fs.existsSync(path.join(dir, ".wl-skills-design")));
}));

test("--dry-run 不写盘", () => withTemp((dir) => {
  const result = runCli(["init", "--dry-run", "--json"], dir);
  assert.strictEqual(result.code, 0, result.stderr);
  assert.ok(JSON.parse(result.stdout).changedFiles > 0);
  assert.deepStrictEqual(fs.readdirSync(dir), []);
}));

test("update 保护本地改动，--force 备份后覆盖，restore 可恢复", () => withTemp((dir) => {
  assert.strictEqual(runCli(["init"], dir).code, 0);
  const target = path.join(dir, "AGENTS.md");
  fs.writeFileSync(target, "本地规则", "utf8");
  const blocked = runCli(["update"], dir);
  assert.strictEqual(blocked.code, 2);
  assert.strictEqual(fs.readFileSync(target, "utf8"), "本地规则");

  const forced = runCli(["update", "--force", "--json"], dir);
  assert.strictEqual(forced.code, 0, forced.stderr);
  assert.ok(JSON.parse(forced.stdout).backupId);
  assert.notStrictEqual(fs.readFileSync(target, "utf8"), "本地规则");

  const restored = runCli(["restore"], dir);
  assert.strictEqual(restored.code, 0, restored.stderr);
  assert.strictEqual(fs.readFileSync(target, "utf8"), "本地规则");
}));

test("update 切换 profile 时移除未修改旧适配器", () => withTemp((dir) => {
  assert.strictEqual(runCli(["init", "--editor", "agents"], dir).code, 0);
  const result = runCli(["update", "--editor", "cursor"], dir);
  assert.strictEqual(result.code, 0, result.stderr);
  assert.ok(!fs.existsSync(path.join(dir, "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(dir, ".cursor", "rules", "conventions.mdc")));
}));

test("status 检出修改，uninstall 不静默删除修改", () => withTemp((dir) => {
  assert.strictEqual(runCli(["init"], dir).code, 0);
  const clean = runCli(["status", "--json"], dir);
  assert.strictEqual(clean.code, 0);
  fs.appendFileSync(path.join(dir, "AGENTS.md"), "\n本地补充", "utf8");
  const dirty = runCli(["status", "--json"], dir);
  assert.strictEqual(dirty.code, 1);
  assert.deepStrictEqual(JSON.parse(dirty.stdout).modified, ["AGENTS.md"]);
  const blocked = runCli(["uninstall"], dir);
  assert.strictEqual(blocked.code, 2);
  assert.ok(fs.existsSync(path.join(dir, "AGENTS.md")));
}));

test("干净安装可以卸载并恢复", () => withTemp((dir) => {
  assert.strictEqual(runCli(["init"], dir).code, 0);
  const removed = runCli(["uninstall", "--json"], dir);
  assert.strictEqual(removed.code, 0, removed.stderr);
  assert.ok(!fs.existsSync(path.join(dir, "AGENTS.md")));
  assert.strictEqual(runCli(["restore"], dir).code, 0);
  assert.ok(fs.existsSync(path.join(dir, "AGENTS.md")));
}));

test("restore --list 与 --id 可用", () => withTemp((dir) => {
  assert.strictEqual(runCli(["init"], dir).code, 0);
  const modified = runCli(["update", "--force"], dir);
  assert.strictEqual(modified.code, 0, modified.stderr);
  const list = runCli(["restore", "--list", "--json"], dir);
  assert.strictEqual(list.code, 0, list.stderr);
  const ids = JSON.parse(list.stdout).backups;
  assert.ok(Array.isArray(ids) && ids.length >= 1);
  const restore = runCli(["restore", "--id", ids[0], "--json"], dir);
  assert.strictEqual(restore.code, 0, restore.stderr);
  assert.ok(JSON.parse(restore.stdout).ok);
  const missing = runCli(["restore", "--id", "99990101000000000"], dir);
  assert.strictEqual(missing.code, 1);
}));

test("restore 前生成安全快照，可再次 restore 撤销", () => withTemp((dir) => {
  assert.strictEqual(runCli(["init"], dir).code, 0);
  const target = path.join(dir, "AGENTS.md");
  fs.writeFileSync(target, "本地规则", "utf8");
  assert.strictEqual(runCli(["update", "--force"], dir).code, 0);
  const restored = runCli(["restore", "--json"], dir);
  assert.strictEqual(restored.code, 0, restored.stderr);
  assert.ok(JSON.parse(restored.stdout).safetyBackupId, "覆盖现存文件前应生成快照");
  assert.strictEqual(fs.readFileSync(target, "utf8"), "本地规则");
  const undone = runCli(["restore", "--json"], dir);
  assert.strictEqual(undone.code, 0, undone.stderr);
  assert.notStrictEqual(fs.readFileSync(target, "utf8"), "本地规则");
}));

test("uninstall --purge 清除状态与备份目录", () => withTemp((dir) => {
  assert.strictEqual(runCli(["init"], dir).code, 0);
  const purged = runCli(["uninstall", "--purge", "--json"], dir);
  assert.strictEqual(purged.code, 0, purged.stderr);
  assert.ok(!fs.existsSync(path.join(dir, ".wl-skills-design")));
}));
