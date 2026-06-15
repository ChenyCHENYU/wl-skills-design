/**
 * CLI 行为测试 — bin/wl-skills-design.js
 *
 * 覆盖：--version / 未知选项退出码 / 未知命令退出码 / --help /
 *       init 全量安装 / --dry-run 不写盘 / update 备份 .bak.<ts>
 *
 * 运行：node --test  （从仓库根目录）
 * 零依赖，仅用 node:test + node:assert。
 */

const { test } = require("node:test");
const assert = require("node:assert");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "bin", "wl-skills-design.js");
const PKG = require(path.join(ROOT, "package.json"));

/** 运行 CLI，返回 { code, stdout, stderr } */
function runCli(args, cwd = ROOT) {
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...args], {
      cwd,
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

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "wlsd-test-"));
}

test("--version 输出 package.json 版本且退出码 0", () => {
  const r = runCli(["--version"]);
  assert.strictEqual(r.code, 0);
  assert.strictEqual(r.stdout.trim(), PKG.version);
});

test("未知选项以退出码 1 失败", () => {
  const r = runCli(["--nope"]);
  assert.strictEqual(r.code, 1);
  assert.match(r.stderr, /未知选项/);
});

test("未知命令以退出码 1 失败", () => {
  const r = runCli(["frobnicate"]);
  assert.strictEqual(r.code, 1);
  assert.match(r.stderr, /未知命令/);
});

test("--help 退出码 0 并列出命令", () => {
  const r = runCli(["--help"]);
  assert.strictEqual(r.code, 0);
  assert.match(r.stdout, /init/);
  assert.match(r.stdout, /update/);
});

test("init 将 files/ 复制到目标目录", () => {
  const dir = tmpDir();
  try {
    const r = runCli(["init"], dir);
    assert.strictEqual(r.code, 0);
    assert.ok(fs.existsSync(path.join(dir, ".github", "copilot-instructions.md")));
    assert.ok(fs.existsSync(path.join(dir, ".github", "skills", "_registry.md")));
    assert.ok(fs.existsSync(path.join(dir, "CLAUDE.md")));
    assert.ok(fs.existsSync(path.join(dir, "AGENTS.md")));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("init 默认保护已有且不同的本地文件", () => {
  const dir = tmpDir();
  try {
    const target = path.join(dir, "CLAUDE.md");
    fs.writeFileSync(target, "用户已有规则，不应被 init 覆盖");
    const r = runCli(["init"], dir);
    assert.strictEqual(r.code, 0);
    assert.match(r.stdout, /保护跳过/);
    assert.strictEqual(
      fs.readFileSync(target, "utf8"),
      "用户已有规则，不应被 init 覆盖"
    );
    const baks = fs.readdirSync(dir).filter((f) => f.startsWith("CLAUDE.md.bak."));
    assert.strictEqual(baks.length, 0, "init 默认保护跳过，不生成备份");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("--dry-run 不实际写盘", () => {
  const dir = tmpDir();
  try {
    const r = runCli(["init", "--dry-run"], dir);
    assert.strictEqual(r.code, 0);
    assert.match(r.stdout, /dry-run/);
    assert.ok(!fs.existsSync(path.join(dir, ".github", "copilot-instructions.md")));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("update 对含本地改动的文件生成带时间戳的备份", () => {
  const dir = tmpDir();
  try {
    runCli(["init"], dir);
    // 制造本地改动
    const target = path.join(dir, "CLAUDE.md");
    fs.writeFileSync(target, "本地改动内容，与包内不同");
    const r = runCli(["update"], dir);
    assert.strictEqual(r.code, 0);
    const baks = fs
      .readdirSync(dir)
      .filter((f) => f.startsWith("CLAUDE.md.bak."));
    assert.ok(baks.length >= 1, "应生成 CLAUDE.md.bak.<时间戳> 备份");
    // 备份内容应为本地改动，目标已被包内容覆盖
    assert.match(fs.readFileSync(path.join(dir, baks[0]), "utf8"), /本地改动内容/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
