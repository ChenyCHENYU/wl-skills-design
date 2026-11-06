"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const { spawnSync } = require("node:child_process");
const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "bin/wl-skills-design.js");
const stateRel = ".wl-skills/state/design/manifest.json";
function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "wl-design-compact-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const run = (...args) => {
    const response = spawnSync(process.execPath, [CLI, ...args, "--json"], { cwd: root, encoding: "utf8" });
    assert.equal(response.status, 0, response.stderr || response.stdout);
    return JSON.parse(response.stdout);
  };
  return { root, run };
}
function put(root, relative, body) { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, body); }

test("compact 默认只安装通用入口，doctor/task 读取包内技能并保留真实验证回执", t => {
  const { root, run } = fixture(t); run("init");
  assert.deepEqual(fs.readdirSync(root).sort(), [".agents", ".wl-skills", "AGENTS.md"]);
  assert.equal(fs.readFileSync(path.join(root, ".wl-skills/state/.gitignore"), "utf8"), "*/runs/\n*/cache/\n*/backups/\n");
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, stateRel))).hosts, ["codex"]);
  assert.equal(run("doctor").ok, true);
  const example = "files/.github/skills/requirements-flowchart/examples/01-purchase-approval.drawio";
  put(root, "approval.drawio", fs.readFileSync(path.join(ROOT, example)));
  const task = run("task", "--input", "检查流程图", "--file", "approval.drawio", "--run-id", "compact-flow");
  assert.equal(task.decision.status, "matched");
  assert.ok(task.decision.requiredFiles.every(file => file.startsWith(path.join(ROOT, "files") + path.sep)));
  const checked = run("verify", "flowchart", "--file", "approval.drawio", "--run-id", task.runId);
  assert.equal(checked.mechanicalOk, true);
  const status = run("status", "--run-id", task.runId);
  assert.equal(status.executionStatus, "completed"); assert.equal(status.planStale, false);
  assert.equal(status.validationStatus, "partial");
});

test("配置宿主不按目录扩大，--hosts 优先于兼容 --editor，Claude/Cline 共用技能目录", t => {
  const { root, run } = fixture(t);
  put(root, "package.json", JSON.stringify({ private: true, wlSkills: { schemaVersion: 1, integration: "compact", hosts: ["codex", "zcode", "kilo"] } }));
  put(root, ".cursor/rules/user.mdc", "USER");
  run("init"); assert.ok(!fs.existsSync(path.join(root, ".kilo")));
  run("update", "--hosts", "claude,cline", "--editor", "all");
  assert.ok(fs.existsSync(path.join(root, ".claude/skills/wl-skills-design/SKILL.md")));
  assert.ok(!fs.existsSync(path.join(root, ".cline")));
  assert.ok(!fs.existsSync(path.join(root, ".agents")));
  assert.equal(fs.readFileSync(path.join(root, ".cursor/rules/user.mdc"), "utf8"), "USER");
});

test("旧 state 升级 compact 只清理本包未修改资源，保留本地覆盖、项目契约和其他包规则", t => {
  const { root, run } = fixture(t); run("init", "--integration", "expanded", "--hosts", "all");
  put(root, ".wl-skills-design/state.json", fs.readFileSync(path.join(root, stateRel)));
  fs.unlinkSync(path.join(root, stateRel));
  const modified = ".github/standards/01-flowchart.md";
  fs.appendFileSync(path.join(root, modified), "\nLOCAL OVERRIDE\n");
  put(root, ".cursor/rules/user.mdc", "FOREIGN");
  const migration = run("update", "--integration", "compact", "--hosts", "codex");
  assert.ok(migration.preserved.includes(modified));
  assert.ok(!fs.existsSync(path.join(root, ".github/skills/requirements-flowchart/SKILL.md")));
  assert.ok(fs.readFileSync(path.join(root, modified), "utf8").includes("LOCAL OVERRIDE"));
  assert.ok(fs.existsSync(path.join(root, ".github/contracts/wl-delivery-profile.v1.json")));
  assert.equal(fs.readFileSync(path.join(root, ".cursor/rules/user.mdc"), "utf8"), "FOREIGN");
  assert.ok(!fs.existsSync(path.join(root, ".wl-skills-design/state.json")));
  run("uninstall"); assert.ok(fs.existsSync(path.join(root, modified)));
  assert.ok(fs.existsSync(path.join(root, ".github/contracts/wl-delivery-profile.v1.json")));
});

test("共享运行态忽略项保留项目内容且不随卸载删除，事务失败恢复原始字节", t => {
  const { root, run } = fixture(t); const relative = ".wl-skills/state/.gitignore";
  const original = "# Project ignore\r\nlocal-secret\r\n"; put(root, relative, original);
  const { main } = require("../bin/wl-skills-design.js");
  const write = fs.writeFileSync;
  try {
    fs.writeFileSync = (file, ...args) => {
      if (String(file).includes("/state/design/manifest.json.tmp-")) throw new Error("manifest failure");
      return write(file, ...args);
    };
    assert.throws(() => main(["init", "--target", root, "--json"]), /已回滚/);
  } finally { fs.writeFileSync = write; }
  assert.equal(fs.readFileSync(path.join(root, relative), "utf8"), original);
  assert.ok(!fs.existsSync(path.join(root, stateRel)));
  run("init"); const installed = fs.readFileSync(path.join(root, relative), "utf8");
  assert.ok(installed.startsWith(original));
  for (const pattern of ["*/runs/", "*/cache/", "*/backups/"]) assert.equal(installed.split(/\r?\n/).filter(line => line === pattern).length, 1);
  run("update"); assert.equal(fs.readFileSync(path.join(root, relative), "utf8"), installed);
  run("uninstall"); assert.equal(fs.readFileSync(path.join(root, relative), "utf8"), installed);
});
