"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const repo = path.resolve(__dirname, "..");
const cli = path.join(repo, "bin/wl-skills-design.js");
function fixture(fn) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "wl-design-targets-")));
  const run = (...args) => spawnSync(process.execPath, [cli, ...args, "--target", root, "--json"], { cwd: root, encoding: "utf8" });
  try {
    assert.equal(run("init").status, 0);
    for (const domain of ["api", "db", "spec"]) fs.cpSync(path.join(repo, "demo/docs", domain), path.join(root, "docs", domain), { recursive: true });
    return fn(root, run);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test("指定不存在的文件拒绝，不能借兄弟文件返回机械通过", () => fixture((root, run) => {
  for (const domain of ["api", "db", "spec"]) {
    const result = run("verify", domain, "--file", domain === "spec" ? "docs/spec/equipment/missing.md" : `docs/${domain}/missing.md`, "--run-id", `missing-${domain}`);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /目标不存在/);
    const status = JSON.parse(run("status", "--run-id", `missing-${domain}`).stdout);
    assert.equal(status.executionStatus, "failed");
    assert.equal(status.tools.length, 1);
    assert.deepEqual(status.tools[0].checkedFiles, []);
  }
}));

test("指定文件只检查该文件，无关兄弟违规不污染结果；目录则检查其自身", () => fixture((root, run) => {
  const selected = "docs/api/01-inspection.md";
  const invalid = fs.readFileSync(path.join(root, selected), "utf8").replace("```json\n{", "```json\n{invalid");
  fs.writeFileSync(path.join(root, "docs/api/99-other.md"), invalid);
  const exact = JSON.parse(run("verify", "api", "--file", selected).stdout);
  assert.equal(exact.mechanicalOk, true);
  assert.deepEqual(exact.receipt.checkedFiles.map((item) => item.path), [selected]);
  const directory = run("verify", "api", "--file", "docs/api");
  assert.equal(directory.status, 1);
  const all = JSON.parse(directory.stdout);
  assert.equal(all.mechanicalOk, false);
  assert.deepEqual(all.receipt.checkedFiles.map((item) => item.path).sort(), ["docs/api/00-api-overview.md", selected, "docs/api/99-other.md"]);
  const db = JSON.parse(run("verify", "db", "--file", "docs/db").stdout);
  assert.equal(db.mechanicalOk, true);
  assert.ok(db.receipt.checkedFiles.every((item) => item.path.startsWith("docs/db/")));
}));

test("局部需求与总览保持缺少跨文档验证的诚实口径，目录执行完整结构检查", () => fixture((root, run) => {
  const chapter = JSON.parse(run("verify", "spec", "--file", "docs/spec/equipment/ch1-3.md").stdout);
  assert.equal(chapter.mechanicalOk, true);
  assert.deepEqual(chapter.receipt.checkedFiles.map((item) => item.path), ["docs/spec/equipment/ch1-3.md"]);
  assert.ok(chapter.receipt.checks.some((item) => item.id === "requirements.spec:S03" && item.status === "skipped"));
  const overview = JSON.parse(run("verify", "api", "--file", "docs/api/00-api-overview.md").stdout);
  assert.equal(overview.mechanicalOk, true);
  assert.ok(overview.receipt.checks.some((item) => item.id === "api.restful:D02" && item.status === "skipped"));
  const complete = JSON.parse(run("verify", "spec", "--file", "docs/spec/equipment").stdout);
  assert.equal(complete.mechanicalOk, true);
  assert.equal(complete.receipt.checkedFiles.length, 3);
}));

test("CLI 空 target/file 值在写入前拒绝，等号形式与 pair 形式一致", () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "wl-design-empty-flags-")));
  try {
    for (const args of [["init", "--target="], ["init", "--target", " "], ["init", "--file="], ["task", "--input= "], ["init", "--target"]]) {
      const result = spawnSync(process.execPath, [cli, ...args, "--json"], { cwd: root, encoding: "utf8" });
      assert.equal(result.status, 1, JSON.stringify(args));
      assert.match(result.stderr, /缺少参数/);
      assert.deepEqual(fs.readdirSync(root), [], "无效参数不能隐式安装到 cwd");
    }
    const result = spawnSync(process.execPath, [cli, "init", `--target=${root}`, "--json"], { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(fs.existsSync(path.join(root, "AGENTS.md")));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("无领域内容的文件不能借 partial 宣称机械通过；相对路径公共入口保持可用", () => fixture((root, run) => {
  fs.writeFileSync(path.join(root, "docs/api/unrelated.md"), "# 普通说明\n\n没有接口定义。\n");
  fs.writeFileSync(path.join(root, "docs/spec/equipment/unrelated.md"), "# 普通说明\n\n没有需求分册。\n");
  for (const [domain, file, rule] of [["api", "docs/api/unrelated.md", "A01"], ["spec", "docs/spec/equipment/unrelated.md", "S01"]]) {
    const result = run("verify", domain, "--file", file);
    assert.equal(result.status, 1);
    const value = JSON.parse(result.stdout);
    assert.equal(value.mechanicalOk, false);
    assert.equal(value.receipt.validationStatus, "failed");
    assert.ok(value.reports[0].checks.some((item) => item.rule === rule && item.status === "fail"));
    assert.deepEqual(value.receipt.checkedFiles.map((item) => item.path), [file]);
  }
  const { verifyDbDir } = require("../lib/verify");
  const relative = path.relative(process.cwd(), path.join(repo, "demo/docs/db"));
  assert.equal(verifyDbDir(relative).mechanicalOk, true);
}));
