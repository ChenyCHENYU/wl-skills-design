"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const Ajv2020 = require("ajv/dist/2020");
const { validateDesignModel } = require("../lib/design-model.js");

const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "bin/wl-skills-design.js");
const SCHEMA = path.join(ROOT, "files/.github/skills/_design-model.schema.json");
const validateSchema = new Ajv2020({ strict: true, allErrors: true }).compile(JSON.parse(fs.readFileSync(SCHEMA, "utf8")));

function base() { return { schemaVersion: 1, projectCode: "PC", fields: [], functions: [], traceLinks: [] }; }
function cases() {
  const field = { id: "FIELD_X", nameZh: "字段", nameEn: "fieldName", logicalType: "string", source: { path: "docs/spec.md" } };
  return {
    "unknown-property": { ...base(), unrecognizedProperty: true },
    "field-type": { ...base(), fields: [{ ...field, nameZh: 42 }] },
    "source-anchor": { ...base(), fields: [{ ...field, source: { ...field.source, anchor: 42 } }] },
    "database-enum": { ...base(), profiles: { database: { tenantMode: "not-a-mode" } } },
    "protocol-const": { ...base(), profiles: { api: { protocolVersion: "2.0" } } },
  };
}

test("完整发布 Schema 的类型/枚举/const/未知属性与 validate-model 同义，既有诊断保留", () => {
  assert.equal(validateSchema(base()), true);
  assert.equal(validateDesignModel(base()).ok, true);
  for (const [name, model] of Object.entries(cases())) {
    assert.equal(validateSchema(model), false, name);
    const result = validateDesignModel(model);
    assert.equal(result.ok, false, name);
    assert.ok(result.errors.some(issue => issue.code === "DM019"), name);
  }
  const result = validateDesignModel({ ...base(), schemaVersion: 2 });
  assert.ok(result.errors.some(issue => issue.code === "DM003"), "原 DM 业务诊断不能被 Schema 错误取代");
  assert.ok(validateDesignModel(cases()["protocol-const"]).warnings.some(issue => issue.code === "DM101"));
});

test("CLI Schema 好/坏输入真实退出码和 status 回执一致，模型字节保持", () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "wl-design-model-schema-")));
  try {
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "model-schema-fixture", private: true }));
    for (const [name, model] of Object.entries({ valid: base(), ...cases() })) {
      const file = path.join(root, name + ".json"), bytes = JSON.stringify(model);
      fs.writeFileSync(file, bytes);
      const runId = "schema-" + name;
      const execution = spawnSync(process.execPath, [CLI, "validate-model", "--target", root, "--model", file, "--run-id", runId, "--json"], { cwd: root, encoding: "utf8" });
      assert.equal(execution.status, name === "valid" ? 0 : 1, execution.stderr);
      const output = JSON.parse(execution.stdout);
      assert.equal(output.ok, name === "valid");
      assert.equal(output.receipt.validationStatus, name === "valid" ? "passed" : "failed");
      assert.deepEqual(output.receipt.checkedFiles, [{ path: path.basename(file), sha256: crypto.createHash("sha256").update(bytes).digest("hex"), bytes: Buffer.byteLength(bytes) }]);
      if (name !== "valid") assert.ok(output.errors.some(issue => issue.code === "DM019"), name);
      const status = spawnSync(process.execPath, [CLI, "status", "--target", root, "--run-id", runId, "--json"], { cwd: root, encoding: "utf8" });
      assert.equal(status.status, 0, status.stderr);
      const saved = JSON.parse(status.stdout);
      assert.equal(saved.executionStatus, name === "valid" ? "completed" : "failed");
      assert.equal(saved.validationStatus, name === "valid" ? "passed" : "failed");
      assert.equal(fs.readFileSync(file, "utf8"), bytes);
    }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("发布 Schema 加载/编译失败明确 DM020，不回退宽松校验", () => {
  for (const body of ["throw new Error('injected read failure')", "return JSON.stringify({type:'unrecognized-schema-type'})"]) {
    const script = `const fs=require('node:fs');const original=fs.readFileSync;fs.readFileSync=function(file,...args){if(file===${JSON.stringify(SCHEMA)}){${body}}return original.call(this,file,...args);};const result=require(${JSON.stringify(path.join(ROOT, "lib/design-model.js"))}).validateDesignModel(${JSON.stringify(base())});process.stdout.write(JSON.stringify(result));`;
    const result = spawnSync(process.execPath, ["-e", script], { cwd: os.tmpdir(), encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.equal(output.ok, false);
    assert.ok(output.errors.some(issue => issue.code === "DM020"));
  }
});
