"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { COMMAND_CATALOG, COMMAND_NAMES, commandInventory } = require("../lib/cli-catalog");
const { COMMAND_HANDLERS, parseArgs } = require("../bin/wl-skills-design");

const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "bin/wl-skills-design.js");
const EXPECTED_COMMANDS = ["init", "update", "status", "doctor", "validate-model", "verify", "layout-flowchart", "restore", "uninstall", "task", "route", "explain", "doctor-host", "protocol"];
const SAMPLE = path.join(ROOT, "files/.github/skills/requirements-flowchart/examples/01-purchase-approval.drawio");

function withRoot(fn) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "wl-design-catalog-")));
  try { return fn(root); }
  finally { fs.rmSync(root, { recursive: true, force: true }); }
}

function run(args, cwd) {
  const result = spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: "utf8", timeout: 30000 });
  assert.equal(result.error, undefined, result.error?.message);
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

function json(args, cwd, expectedCode = 0) {
  const result = run([...args, "--json"], cwd);
  assert.equal(result.code, expectedCode, `${args.join(" ")}\n${result.stderr}\n${result.stdout}`);
  return JSON.parse(result.stdout);
}

function snapshot(root) {
  const entries = {};
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(file);
      else entries[path.relative(root, file)] = fs.readFileSync(file).toString("base64");
    }
  }
  visit(root);
  return entries;
}

test("actual acceptance, help and public inventory expose the exact native command catalog", () => withRoot((root) => {
  assert.deepEqual(COMMAND_NAMES, EXPECTED_COMMANDS);
  const handlerIds = [...new Set(COMMAND_NAMES.map((name) => COMMAND_CATALOG[name].dispatch))].sort();
  assert.deepEqual(Object.keys(COMMAND_HANDLERS).sort(), handlerIds, "no undispatched or unlisted handler IDs");
  for (const name of EXPECTED_COMMANDS) {
    assert.equal(parseArgs([name]).command, name);
    assert.equal(typeof COMMAND_HANDLERS[COMMAND_CATALOG[name].dispatch], "function");
  }
  for (const name of ["frobnicate", "constructor", "__proto__"]) assert.throws(() => parseArgs([name]), /未知命令/);
  const help = run(["--help"], root);
  assert.equal(help.code, 0);
  const block = help.stdout.split("命令：\n")[1].split("\n选项：")[0];
  assert.deepEqual([...block.matchAll(/^ {2}(\S+)\s+/gm)].map((match) => match[1]), EXPECTED_COMMANDS);
  for (const name of EXPECTED_COMMANDS) {
    assert.ok(block.includes(COMMAND_CATALOG[name].args), `${name} args`);
    assert.ok(block.includes(COMMAND_CATALOG[name].summary), `${name} summary`);
  }
  const described = json(["protocol", "describe"], root);
  assert.deepEqual(described.inventory.commands, commandInventory());
  assert.deepEqual(Object.keys(snapshot(root)), [], "help/describe do not install or persist a run");
}));

test("every listed command reaches its real CLI handler in an isolated standalone project", () => withRoot((root) => {
  fs.copyFileSync(SAMPLE, path.join(root, "input.drawio"));
  fs.writeFileSync(path.join(root, "model.json"), JSON.stringify({ schemaVersion: 1, projectCode: "CATALOG", fields: [], functions: [], traceLinks: [] }));
  const checks = {
    init: () => assert.deepEqual(json(["init"], root).editors, ["agents"]),
    update: () => assert.equal(json(["update", "--dry-run"], root).dryRun, true),
    status: () => assert.equal(json(["status"], root).managed, true),
    doctor: () => assert.deepEqual(json(["doctor"], root).skillIssues, []),
    "validate-model": () => assert.equal(json(["validate-model", "--model", "model.json", "--run-id", "catalog-model"], root).receipt.validationStatus, "passed"),
    verify: () => {
      const result = json(["verify", "flowchart", "--file", "input.drawio", "--run-id", "catalog-verify"], root);
      assert.equal(result.domain, "flowchart");
      assert.equal(result.mechanicalOk, true);
      assert.equal(result.validationStatus, "partial", "mechanical success cannot claim complete semantic validation");
    },
    "layout-flowchart": () => {
      const result = json(["layout-flowchart", "--file", "input.drawio", "--output", "preview.drawio", "--dry-run"], root);
      assert.equal(result.dryRun, true);
      assert.equal(result.output, "preview.drawio");
      assert.equal(fs.existsSync(path.join(root, "preview.drawio")), false);
    },
    restore: () => assert.ok(Array.isArray(json(["restore", "--list"], root).backups)),
    uninstall: () => assert.equal(json(["uninstall", "--dry-run"], root).dryRun, true),
    task: () => {
      const result = json(["task", "--input", "检查流程图", "--file", "input.drawio", "--run-id", "catalog-task"], root);
      assert.equal(result.runId, "catalog-task");
      assert.equal(result.executionStatus, "not-executed");
      assert.ok(result.recordPath.startsWith(".wl-skills-design/runs/catalog-task/"));
      assert.equal(fs.existsSync(path.join(root, result.recordPath)), true);
    },
    route: () => assert.equal(json(["route", "--input", "检查流程图", "--file", "input.drawio"], root).decision.status, "matched"),
    explain: () => assert.equal(json(["explain", "--input", "检查流程图", "--file", "input.drawio"], root).decision.status, "matched"),
    "doctor-host": () => assert.equal(json(["doctor-host", "--host", "codex"], root).host, "codex"),
    protocol: () => assert.equal(json(["protocol", "describe"], root).package, "@agile-team/wl-skills-design"),
  };
  assert.deepEqual(Object.keys(checks), EXPECTED_COMMANDS, "assertions cover explicit entry identity, not just a count");
  for (const name of EXPECTED_COMMANDS) checks[name]();
  assert.deepEqual(fs.readFileSync(path.join(root, "input.drawio")), fs.readFileSync(SAMPLE));
  assert.equal(fs.readFileSync(path.join(root, "model.json"), "utf8"), JSON.stringify({ schemaVersion: 1, projectCode: "CATALOG", fields: [], functions: [], traceLinks: [] }));
}));

test("catalog separates source-read-only checks from real run-record writes", () => withRoot((root) => {
  json(["init"], root);
  fs.writeFileSync(path.join(root, "model.json"), JSON.stringify({ schemaVersion: 1, projectCode: "CATALOG", fields: [], functions: [], traceLinks: [] }));
  const before = snapshot(root);
  for (const args of [["route", "--input", "设计接口"], ["explain", "--input", "设计接口"], ["status"], ["doctor"], ["doctor-host"], ["protocol", "describe"], ["restore", "--list"]]) {
    const result = run([...args, "--json"], root);
    assert.ok(result.code === 0 || result.code === 1, result.stderr);
    assert.deepEqual(snapshot(root), before, `${args.join(" ")} must not write`);
  }
  const result = json(["validate-model", "--model", "model.json", "--run-id", "model-real-write"], root);
  assert.equal(result.runId, "model-real-write");
  const after = snapshot(root);
  const added = Object.keys(after).filter((file) => !Object.hasOwn(before, file));
  assert.ok(added.some((file) => file.startsWith(".wl-skills-design/runs/")));
  for (const [file, bytes] of Object.entries(before)) assert.equal(after[file], bytes, file);
  for (const name of ["validate-model", "verify", "task", "layout-flowchart", "protocol"]) assert.equal(COMMAND_CATALOG[name].readOnly, false);
  assert.match(COMMAND_CATALOG["validate-model"].sideEffects, /runs/);
  for (const name of ["status", "doctor", "route", "explain", "doctor-host"]) assert.equal(COMMAND_CATALOG[name].readOnly, true);
}));

test("missing values and unknown flags fail before any CLI filesystem effect", () => withRoot((root) => {
  for (const args of [["init", "--target"], ["update", "--editor="], ["validate-model", "--model", "--json"], ["layout-flowchart", "--file", "--json"], ["layout-flowchart", "--output="], ["task", "--input="], ["protocol", "request", "--input-file="], ["restore", "--id"], ["doctor-host", "--host="], ["task", "--run-id="], ["status", "--unknown"]]) {
    const result = run(args, root);
    assert.equal(result.code, 1, args.join(" "));
    assert.match(result.stderr, /缺少参数|未知选项/);
    assert.deepEqual(fs.readdirSync(root), [], args.join(" "));
  }
}));
