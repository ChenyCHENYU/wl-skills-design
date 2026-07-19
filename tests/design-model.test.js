"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const { validateDesignModel } = require("../lib/design-model.js");

function validModel() {
  return {
    schemaVersion: 1,
    projectCode: "TASK_APP",
    profiles: { api: { profileId: "jh4j3-openapi3", protocolVersion: "1.0", contract: "both" } },
    terms: [],
    fields: [
      { id: "FIELD_ID", nameZh: "主键", nameEn: "id", logicalType: "string", source: { path: "requirements.md" } },
    ],
    functions: [
      { id: "FUNC_QUERY", code: "TASK_QUERY", name: "任务查询", inputFieldIds: ["FIELD_ID"], outputFieldIds: ["FIELD_ID"], source: { path: "requirements.md" } },
    ],
    flows: [{ id: "FLOW_QUERY", code: "QUERY", name: "查询流程", activityIds: ["FUNC_QUERY"] }],
    screens: [{ id: "SCREEN_TASK", name: "任务页面", functionIds: ["FUNC_QUERY"], fieldIds: ["FIELD_ID"] }],
    tables: [{ id: "TABLE_TASK", physicalName: "TASK_TABLE", fieldIds: ["FIELD_ID"] }],
    apis: [{ id: "API_QUERY", operationId: "queryPage", functionIds: ["FUNC_QUERY"], requestFieldIds: ["FIELD_ID"], responseFieldIds: ["FIELD_ID"] }],
    traceLinks: [{ from: "SCREEN_TASK", to: "API_QUERY", type: "depends-on" }],
  };
}

test("完整 design-model 通过稳定 ID 和引用校验", () => {
  const result = validateDesignModel(validModel());
  assert.strictEqual(result.ok, true, JSON.stringify(result.errors));
  assert.strictEqual(result.summary.errors, 0);
});

test("重复 ID、断链引用和协议漂移被报告", () => {
  const model = validModel();
  model.tables[0].id = "SCREEN_TASK";
  model.screens[0].fieldIds = ["FIELD_MISSING"];
  model.profiles.api.protocolVersion = "2.0";
  const result = validateDesignModel(model);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some((item) => item.code === "DM006"));
  assert.ok(result.errors.some((item) => item.code === "DM008"));
  assert.ok(result.warnings.some((item) => item.code === "DM101"));
});
