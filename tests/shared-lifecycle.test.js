"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "bin/wl-skills-design.js");
const foreign = "<!-- wl-skills-kit:begin -->\n前端包规则\n<!-- wl-skills-kit:end -->\n";
const stateFile = (root) => path.join(root, ".wl-skills-design/state.json");
const exactHash = (content) => crypto.createHash("sha256").update(content).digest("hex");

function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wl-design-shared-"));
  const cli = (...args) => {
    const result = spawnSync(process.execPath, [CLI, ...args, "--json"], { cwd: root, encoding: "utf8" });
    return { code: result.status, data: result.stdout ? JSON.parse(result.stdout) : null, stderr: result.stderr };
  };
  function put(rel, text) { const file = path.join(root, rel); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); }
  try { run({ root, cli, put }); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test("共享用户内容、其他包区块共存，重复 update 和卸载不改变外部内容", () => fixture(({ root, cli, put }) => {
  const original = "用户规则";
  put("AGENTS.md", original);
  put(".github/skills/_registry.md", foreign);
  put(".github/skills/_route-evals.json", '{"foreign": true}');
  assert.equal(cli("init", "--editor", "all").code, 0);
  assert.equal(cli("update", "--editor", "all").code, 0);
  fs.appendFileSync(path.join(root, "AGENTS.md"), foreign);
  assert.equal(cli("status").code, 0);
  const removed = cli("uninstall", "--force");
  assert.equal(removed.code, 0, removed.stderr);
  assert.equal(fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"), original + foreign);
  assert.equal(fs.readFileSync(path.join(root, ".github/skills/_registry.md"), "utf8"), foreign);
  assert.equal(fs.readFileSync(path.join(root, ".github/skills/_route-evals.json"), "utf8"), '{"foreign": true}');
  assert.ok(!fs.existsSync(path.join(root, ".github/skills/_route-evals.design.json")));
}));

test("预存相同文件只引用，卸载保留原有完整文件", () => fixture(({ root, cli, put }) => {
  const raw = fs.readFileSync(path.join(ROOT, "files/AGENTS.md"));
  put("AGENTS.md", raw);
  assert.equal(cli("init").code, 0);
  const state = JSON.parse(fs.readFileSync(stateFile(root), "utf8"));
  assert.equal(state.files.find((item) => item.path === "AGENTS.md").kind, "reference");
  assert.equal(cli("uninstall", "--force").code, 0);
  assert.deepEqual(fs.readFileSync(path.join(root, "AGENTS.md")), raw);
}));

test("预存空 AGENTS/CLAUDE 文件经安装、升级、切换编辑器和卸载仍存在", () => fixture(({ root, cli, put }) => {
  for (const rel of ["AGENTS.md", "CLAUDE.md"]) put(rel, "");
  assert.equal(cli("init", "--editor", "agents,claude").code, 0);
  const state = JSON.parse(fs.readFileSync(stateFile(root), "utf8"));
  for (const rel of ["AGENTS.md", "CLAUDE.md"]) assert.equal(state.files.find((item) => item.path === rel).createdFile, false);
  assert.equal(cli("update", "--editor", "agents").code, 0);
  assert.equal(fs.readFileSync(path.join(root, "CLAUDE.md"), "utf8"), "", "移除编辑器贡献必须保留预存空文件");
  assert.equal(cli("update", "--editor", "agents,claude", "--force").code, 0);
  const removed = cli("uninstall", "--force");
  assert.equal(removed.code, 0, removed.stderr);
  for (const rel of ["AGENTS.md", "CLAUDE.md"]) {
    assert.equal(fs.readFileSync(path.join(root, rel), "utf8"), "");
    assert.ok(!removed.data.preserved.includes(rel), "贡献已正常移除，空文件不是本地修改");
  }
}));

test("恢复首次安装快照保留预存空文件并删除本包新建文件", () => fixture(({ root, cli, put }) => {
  put("AGENTS.md", "");
  const installed = cli("init", "--editor", "agents,claude");
  assert.equal(installed.code, 0);
  const restored = cli("restore", "--id", installed.data.backupId);
  assert.equal(restored.code, 0, restored.stderr);
  assert.equal(fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"), "");
  assert.ok(!fs.existsSync(path.join(root, "CLAUDE.md")), "本包新建文件在恢复前应不存在");
}));

test("旧区块记录缺少文件存在性基线时卸载保守保留空文件", () => fixture(({ root, cli }) => {
  assert.equal(cli("init", "--editor", "agents,claude").code, 0);
  const state = JSON.parse(fs.readFileSync(stateFile(root), "utf8"));
  for (const item of state.files) delete item.createdFile;
  fs.writeFileSync(stateFile(root), JSON.stringify(state));
  assert.equal(cli("uninstall").code, 0);
  for (const rel of ["AGENTS.md", "CLAUDE.md"]) assert.equal(fs.readFileSync(path.join(root, rel), "utf8"), "");
}));

test("旧整文件与旧 conventions 仅依据旧 state/hash 迁移，未知旧文件不动", () => fixture(({ root, cli, put }) => {
  assert.equal(cli("init", "--editor", "cursor,agents").code, 0);
  const state = JSON.parse(fs.readFileSync(stateFile(root), "utf8"));
  const agents = fs.readFileSync(path.join(ROOT, "files/AGENTS.md"));
  put("AGENTS.md", agents);
  const agentRecord = state.files.find((item) => item.path === "AGENTS.md");
  delete agentRecord.kind; delete agentRecord.installedHash; delete agentRecord.prefix;
  agentRecord.hash = exactHash(agents);
  const oldRule = "旧 design 编辑器规则\n";
  put(".cursor/rules/conventions.mdc", oldRule);
  state.files.push({ path: ".cursor/rules/conventions.mdc", hash: exactHash(oldRule) });
  put(".windsurf/rules/conventions.md", "其他包未登记规则");
  put(".github/skills/_route-evals.json", "旧路由机器文件\n");
  state.files.push({ path: ".github/skills/_route-evals.json", hash: exactHash("旧路由机器文件\n") });
  fs.writeFileSync(stateFile(root), JSON.stringify(state));
  assert.equal(cli("update").code, 0);
  assert.match(fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"), /^<!-- wl-skills-design:begin -->/);
  assert.ok(!fs.existsSync(path.join(root, ".cursor/rules/conventions.mdc")));
  assert.ok(fs.existsSync(path.join(root, ".cursor/rules/wl-skills-design.mdc")));
  assert.ok(!fs.existsSync(path.join(root, ".github/skills/_route-evals.json")));
  assert.ok(fs.existsSync(path.join(root, ".github/skills/_route-evals.design.json")));
  assert.equal(fs.readFileSync(path.join(root, ".windsurf/rules/conventions.md"), "utf8"), "其他包未登记规则");
}));

test("clean 即使 force 也保留修改过的本包区块和独占文件", () => fixture(({ root, cli }) => {
  assert.equal(cli("init").code, 0);
  const agents = path.join(root, "AGENTS.md");
  fs.writeFileSync(agents, fs.readFileSync(agents, "utf8").replace("版本：", "用户定制版本："));
  const skill = path.join(root, ".github/skills/doc-intake/SKILL.md");
  fs.appendFileSync(skill, "\n用户定制技能\n");
  const originalAgents = fs.readFileSync(agents);
  const originalSkill = fs.readFileSync(skill);
  assert.equal(cli("status").code, 1);
  const removed = cli("uninstall", "--force");
  assert.equal(removed.code, 0);
  assert.ok(removed.data.preserved.includes("AGENTS.md"));
  assert.ok(removed.data.preserved.includes(".github/skills/doc-intake/SKILL.md"));
  assert.deepEqual(fs.readFileSync(agents), originalAgents);
  assert.deepEqual(fs.readFileSync(skill), originalSkill);
  const retained = JSON.parse(fs.readFileSync(stateFile(root), "utf8"));
  assert.equal(retained.files.find((item) => item.path === "AGENTS.md").kind, "reference");
  assert.equal(cli("init", "--force").code, 2, "保留用户修改后，再安装不得重新认领覆盖");
  assert.deepEqual(fs.readFileSync(agents), originalAgents);
}));

test("项目 Delivery Profile 不因 force 升级重置", () => fixture(({ root, cli, put }) => {
  assert.equal(cli("init").code, 0);
  const rel = ".github/contracts/wl-delivery-profile.v1.json";
  const custom = '{"profileId": "project-custom", "protocolVersion": "1.0"}';
  put(rel, custom);
  assert.equal(cli("update", "--force").code, 0);
  assert.equal(fs.readFileSync(path.join(root, rel), "utf8"), custom);
  assert.equal(cli("uninstall", "--force").code, 0);
  assert.equal(fs.readFileSync(path.join(root, rel), "utf8"), custom);
}));

test("purge 仅移除本包快照，不删除状态目录及备份中的用户附加文件", () => fixture(({ root, cli, put }) => {
  const installed = cli("init");
  assert.equal(installed.code, 0);
  put(".wl-skills-design/user-note.txt", "状态目录的用户文件");
  put(`.wl-skills-design/backups/${installed.data.backupId}/user-note.txt`, "快照目录的用户文件");
  const removed = cli("uninstall", "--purge");
  assert.equal(removed.code, 0);
  assert.equal(removed.data.purged, false);
  assert.equal(fs.readFileSync(path.join(root, ".wl-skills-design/user-note.txt"), "utf8"), "状态目录的用户文件");
  assert.equal(fs.readFileSync(path.join(root, `.wl-skills-design/backups/${installed.data.backupId}/user-note.txt`), "utf8"), "快照目录的用户文件");
}));

test("restore 只恢复本包区块，保留安装后追加的其他包和用户文本", () => fixture(({ root, cli, put }) => {
  put("AGENTS.md", "原有用户规则\n");
  const installed = cli("init");
  assert.equal(installed.code, 0);
  fs.appendFileSync(path.join(root, "AGENTS.md"), foreign + "后来用户补充\n");
  const restored = cli("restore", "--id", installed.data.backupId);
  assert.equal(restored.code, 0, restored.stderr);
  assert.equal(fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"), "原有用户规则\n" + foreign + "后来用户补充\n");
}));

test("陌生独占文件在 force 下仍阻断且不产生半安装", () => fixture(({ root, cli, put }) => {
  put(".github/skills/doc-intake/SKILL.md", "用户已有技能");
  const result = cli("init", "--force");
  assert.equal(result.code, 2);
  assert.equal(fs.readFileSync(path.join(root, ".github/skills/doc-intake/SKILL.md"), "utf8"), "用户已有技能");
  assert.ok(!fs.existsSync(path.join(root, "AGENTS.md")));
  assert.ok(!fs.existsSync(path.join(root, ".wl-skills-design")));
}));

test("文件占用祖先目录时预检零写入", () => fixture(({ root, cli, put }) => {
  put(".github", "本地文件");
  assert.equal(cli("init", "--force").code, 1);
  assert.ok(!fs.existsSync(path.join(root, "AGENTS.md")));
  assert.ok(!fs.existsSync(path.join(root, ".wl-skills-design")));
  assert.equal(fs.readFileSync(path.join(root, ".github"), "utf8"), "本地文件");
}));

test("符号链接祖先目录被拒绝，不改写链接目标", () => fixture(({ root, cli, put }) => {
  put("external/keep", "外部数据");
  fs.symlinkSync(path.join(root, "external"), path.join(root, ".github"), "dir");
  assert.equal(cli("init", "--force").code, 1);
  assert.ok(!fs.existsSync(path.join(root, "AGENTS.md")));
  assert.deepEqual(fs.readdirSync(path.join(root, "external")), ["keep"]);
}));
