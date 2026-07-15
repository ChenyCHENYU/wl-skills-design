#!/usr/bin/env node

"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "bin", "wl-skills-design.js");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wlsd-pack-smoke-"));

function run(args, cwd) {
  return execFileSync(process.execPath, [CLI, ...args], { cwd, stdio: "pipe" }).toString();
}

try {
  const agents = path.join(tempRoot, "agents");
  fs.mkdirSync(agents);
  run(["init", "--editor", "agents", "--json"], agents);
  assert.ok(fs.existsSync(path.join(agents, "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(agents, ".github", "skills", "requirements-flowchart", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(agents, ".wl-skills-design", "state.json")));
  assert.ok(!fs.existsSync(path.join(agents, "CLAUDE.md")));
  assert.ok(!fs.existsSync(path.join(agents, ".github", "copilot-instructions.md")));
  run(["doctor", "--json"], agents);

  const cursor = path.join(tempRoot, "cursor");
  fs.mkdirSync(cursor);
  run(["init", "--editor", "cursor"], cursor);
  assert.ok(fs.existsSync(path.join(cursor, ".cursor", "rules", "conventions.mdc")));
  assert.ok(!fs.existsSync(path.join(cursor, ".cursorrules")));
  assert.ok(!fs.existsSync(path.join(cursor, "AGENTS.md")));

  const requireDir = path.join(tempRoot, "require");
  fs.mkdirSync(requireDir);
  const before = fs.readdirSync(requireDir);
  require(CLI);
  assert.deepStrictEqual(fs.readdirSync(requireDir), before, "require CLI 不得产生安装副作用");

  console.log("  ✔ package smoke 通过");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
