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

function expectCode(model, code, kind = "errors") {
  const result = validateDesignModel(model);
  const list = kind === "errors" ? result.errors : result.warnings;
  assert.ok(list.some((item) => item.code === code), `期望 ${kind} 含 ${code}，实际：${JSON.stringify(list)}`);
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

test("结构类错误 DM001/DM003/DM004/DM005 被报告", () => {
  const model = validModel();
  model.projectCode = "bad-code";
  expectCode(model, "DM001");
  const model2 = validModel();
  model2.schemaVersion = 2;
  expectCode(model2, "DM003");
  const model3 = validModel();
  model3.fields = {};
  expectCode(model3, "DM004");
  const model4 = validModel();
  model4.screens = [null];
  expectCode(model4, "DM005");
});

test("引用类错误 DM002/DM007/DM009/DM010/DM011/DM012 被报告", () => {
  const model = validModel();
  model.screens[0].fieldIds = ["FIELD_ID", "FIELD_ID"];
  expectCode(model, "DM002");
  const model2 = validModel();
  model2.tables[0].fieldIds = "FIELD_ID";
  expectCode(model2, "DM007");
  const model3 = validModel();
  model3.fields[0].enumId = "TERM_MISSING";
  expectCode(model3, "DM009");
  const model4 = validModel();
  model4.flows[0].activityIds = ["FUNC_MISSING"];
  expectCode(model4, "DM010");
  const model5 = validModel();
  model5.traceLinks[0].to = "SCREEN_MISSING";
  expectCode(model5, "DM011");
  const model6 = validModel();
  model6.traceLinks[0].type = "relates-to";
  expectCode(model6, "DM012");
});

test("Schema 对齐错误 DM014/DM015/DM016/DM017/DM018 被报告", () => {
  const model = validModel();
  delete model.fields[0].nameZh;
  expectCode(model, "DM014");
  const model2 = validModel();
  model2.fields[0].customFlag = true;
  expectCode(model2, "DM015");
  const model3 = validModel();
  model3.profiles = { api: { ...model3.profiles.api, retry: "always" } };
  expectCode(model3, "DM015");
  const model4 = validModel();
  model4.fields[0].nameEn = "_id";
  expectCode(model4, "DM016");
  const model5 = validModel();
  model5.apis[0].operationId = "9query";
  expectCode(model5, "DM017");
  const model6 = validModel();
  model6.fields[0].source = { anchor: "x" };
  expectCode(model6, "DM018");
});

test("协议漂移 DM013 与集合为空警告 DM102–DM104 被报告", () => {
  const model = validModel();
  model.profiles = { api: { profileId: "custom-profile" } };
  expectCode(model, "DM013");
  const empty = {
    schemaVersion: 1,
    projectCode: "TASK_APP",
    fields: [],
    functions: [],
    traceLinks: [],
  };
  const result = validateDesignModel(empty);
  assert.ok(result.ok, "空集合只产生警告");
  for (const code of ["DM102", "DM103", "DM104"]) {
    assert.ok(result.warnings.some((item) => item.code === code), `缺少 ${code}`);
  }
});
