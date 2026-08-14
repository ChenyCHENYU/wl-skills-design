#!/usr/bin/env node

"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wlsd-pack-smoke-"));

function npmCli() {
  const candidate = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
  if (fs.existsSync(candidate)) return candidate;
  return require.resolve("npm/bin/npm-cli.js");
}

function npm(args, cwd) {
  return execFileSync(process.execPath, [npmCli(), ...args], { cwd, stdio: "pipe" }).toString();
}

try {
  const packDir = path.join(tempRoot, "pack");
  fs.mkdirSync(packDir);
  const packOutput = npm(["pack", ROOT, "--json", "--ignore-scripts", `--pack-destination=${packDir}`], packDir);
  const packed = JSON.parse(packOutput);
  assert.strictEqual(packed.length, 1, "npm pack 应只产出一个 tarball");
  const tarball = path.join(packDir, packed[0].filename);
  assert.ok(fs.existsSync(tarball), "tarball 必须存在");

  const fileList = packed[0].files.map((item) => item.path);
  for (const required of ["bin/wl-skills-design.js", "lib/design-model.js", "files/.github/skills/_manifest.json", "README.md", "CHANGELOG.md"]) {
    assert.ok(fileList.includes(required), `发布载荷缺少 ${required}`);
  }
  for (const forbidden of ["kit-internal", "spec-gen/", "scripts/", "tests/", "demo/"]) {
    assert.ok(!fileList.some((item) => item.startsWith(forbidden)), `发布载荷不得包含 ${forbidden}`);
  }

  const installDir = path.join(tempRoot, "install");
  fs.mkdirSync(installDir);
  fs.writeFileSync(path.join(installDir, "package.json"), JSON.stringify({ name: "smoke-host", private: true }), "utf8");
  npm(["install", tarball, "--no-save", "--ignore-scripts", "--no-audit", "--no-fund"], installDir);
  const cli = path.join(installDir, "node_modules", "@agile-team", "wl-skills-design", "bin", "wl-skills-design.js");
  assert.ok(fs.existsSync(cli), "安装后必须存在 bin 入口");
  const runInstalled = (args, cwd) => execFileSync(process.execPath, [cli, ...args], { cwd, stdio: "pipe" }).toString();

  const agents = path.join(tempRoot, "agents");
  fs.mkdirSync(agents);
  runInstalled(["init", "--editor", "agents", "--json"], agents);
  assert.ok(fs.existsSync(path.join(agents, "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(agents, ".github", "skills", "requirements-flowchart", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(agents, ".wl-skills-design", "state.json")));
  assert.ok(!fs.existsSync(path.join(agents, "CLAUDE.md")));
  assert.ok(!fs.existsSync(path.join(agents, ".github", "copilot-instructions.md")));
  runInstalled(["doctor", "--json"], agents);
  const modelDir = path.join(agents, "docs");
  fs.mkdirSync(modelDir);
  fs.writeFileSync(
    path.join(modelDir, "design-model.json"),
    JSON.stringify({ schemaVersion: 1, projectCode: "SMOKE_APP", fields: [], functions: [], traceLinks: [] }),
    "utf8"
  );
  runInstalled(["validate-model", "--json"], agents);
  runInstalled(["uninstall", "--json"], agents);
  assert.ok(!fs.existsSync(path.join(agents, "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(agents, ".wl-skills-design", "backups")));
  runInstalled(["restore", "--json"], agents);
  assert.ok(fs.existsSync(path.join(agents, "AGENTS.md")), "restore 必须能撤销卸载");

  const cursor = path.join(tempRoot, "cursor");
  fs.mkdirSync(cursor);
  runInstalled(["init", "--editor", "cursor"], cursor);
  assert.ok(fs.existsSync(path.join(cursor, ".cursor", "rules", "conventions.mdc")));
  assert.ok(!fs.existsSync(path.join(cursor, ".cursorrules")));
  assert.ok(!fs.existsSync(path.join(cursor, "AGENTS.md")));

  console.log("  ✔ package smoke 通过（真实 npm 载荷安装）");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
