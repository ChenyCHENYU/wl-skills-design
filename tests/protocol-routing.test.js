"use strict";

const test = require("node:test");
const assert = require("assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { protocol, runOperation } = require("../lib/protocol-cli");
const cases = require("./protocol-routing-cases.json");
const BIN = path.join(__dirname, "..", "bin", "wl-skills-design.js");

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "wl-design-routing-"));
}

function routeAt(projectRoot, task) {
  return protocol.request({ operation: "route", projectRoot, task }, runOperation);
}

test.before(() => {
  const root = tempRoot();
  const run = spawnSync(process.execPath, [BIN, "init", "--target", root], { encoding: "utf8", timeout: 120000 });
  assert.equal(run.status, 0, run.stderr);
  module.exports.installedRoot = root;
});

for (const item of cases) {
  const expectedBare = item.skill ? "gap" : item.status;
  const expectedInstalled = item.installedStatus || (item.skill ? "matched" : item.status);

  test(`未安装：「${item.task}」→ ${expectedBare}${item.skill ? ` + ${item.skill}` : ""}`, () => {
    const envelope = routeAt(tempRoot(), item.task);
    assert.equal(envelope.ok, true);
    const decision = envelope.result.decision || envelope.result;
    assert.equal(decision.status, expectedBare);
    if (item.skill) assert.ok(decision.selectedSkills.includes(item.skill), `应选中 ${item.skill}，实际 ${decision.selectedSkills}`);
    else assert.equal((decision.selectedSkills || []).length, 0);
  });

  test(`已安装：「${item.task}」→ ${expectedInstalled}${item.skill ? ` + ${item.skill}` : ""}`, () => {
    const envelope = routeAt(module.exports.installedRoot, item.task);
    assert.equal(envelope.ok, true);
    const decision = envelope.result.decision || envelope.result;
    assert.equal(decision.status, expectedInstalled);
    if (item.skill) assert.ok(decision.selectedSkills.includes(item.skill));
  });
}
