"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ID_PATTERN = /^[A-Z][A-Z0-9_-]{1,63}$/;
const REQUIRED_ARRAYS = ["fields", "functions", "traceLinks"];
const COLLECTIONS = ["terms", "fields", "functions", "flows", "screens", "tables", "apis"];

function addIssue(target, code, location, message) {
  target.push({ code, location, message });
}

function validateId(value, location, errors) {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) {
    addIssue(errors, "DM001", location, "必须是大写开头、仅含大写字母/数字/_/- 的稳定 ID");
    return false;
  }
  return true;
}

function validateUniqueArray(value, location, errors) {
  if (!Array.isArray(value)) return;
  const seen = new Set();
  for (const [index, item] of value.entries()) {
    if (seen.has(item)) addIssue(errors, "DM002", `${location}[${index}]`, `重复引用 ${item}`);
    seen.add(item);
  }
}

function validateDesignModel(model) {
  const errors = [];
  const warnings = [];
  if (!model || typeof model !== "object" || Array.isArray(model)) {
    addIssue(errors, "DM000", "$", "design-model 必须是 JSON 对象");
    return { ok: false, errors, warnings, summary: { errors: 1, warnings: 0 } };
  }

  if (model.schemaVersion !== 1) addIssue(errors, "DM003", "schemaVersion", "当前只支持 schemaVersion=1");
  validateId(model.projectCode, "projectCode", errors);
  for (const name of REQUIRED_ARRAYS) {
    if (!Array.isArray(model[name])) addIssue(errors, "DM004", name, "必须是数组");
  }

  const ids = new Map();
  const byCollection = new Map();
  for (const name of COLLECTIONS) {
    const values = model[name];
    if (values === undefined) continue;
    if (!Array.isArray(values)) {
      addIssue(errors, "DM004", name, "必须是数组");
      continue;
    }
    const ownIds = new Set();
    byCollection.set(name, ownIds);
    for (const [index, item] of values.entries()) {
      const location = `${name}[${index}]`;
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        addIssue(errors, "DM005", location, "必须是对象");
        continue;
      }
      if (!validateId(item.id, `${location}.id`, errors)) continue;
      if (ids.has(item.id)) {
        addIssue(errors, "DM006", `${location}.id`, `稳定 ID 已在 ${ids.get(item.id)} 使用`);
      } else {
        ids.set(item.id, location);
      }
      ownIds.add(item.id);
    }
  }

  const referenceRules = {
    functions: { inputFieldIds: "fields", outputFieldIds: "fields" },
    screens: { functionIds: "functions", fieldIds: "fields" },
    tables: { fieldIds: "fields" },
    apis: { functionIds: "functions", requestFieldIds: "fields", responseFieldIds: "fields" },
  };
  for (const [collection, fields] of Object.entries(referenceRules)) {
    for (const [index, item] of (model[collection] || []).entries()) {
      for (const [field, targetCollection] of Object.entries(fields)) {
        const value = item?.[field];
        const location = `${collection}[${index}].${field}`;
        if (!Array.isArray(value)) {
          addIssue(errors, "DM007", location, "必须是稳定 ID 数组");
          continue;
        }
        validateUniqueArray(value, location, errors);
        const targets = byCollection.get(targetCollection) || new Set();
        for (const [refIndex, ref] of value.entries()) {
          if (!targets.has(ref)) addIssue(errors, "DM008", `${location}[${refIndex}]`, `引用不存在的 ${targetCollection} ID：${ref}`);
        }
      }
    }
  }

  const termIds = byCollection.get("terms") || new Set();
  for (const [index, field] of (model.fields || []).entries()) {
    if (field?.enumId && !termIds.has(field.enumId)) {
      addIssue(errors, "DM009", `fields[${index}].enumId`, `引用不存在的 terms ID：${field.enumId}`);
    }
  }

  for (const [index, flow] of (model.flows || []).entries()) {
    const location = `flows[${index}].activityIds`;
    if (!Array.isArray(flow?.activityIds)) {
      addIssue(errors, "DM007", location, "必须是稳定 ID 数组");
      continue;
    }
    validateUniqueArray(flow.activityIds, location, errors);
    for (const [refIndex, ref] of flow.activityIds.entries()) {
      if (!ids.has(ref)) addIssue(errors, "DM010", `${location}[${refIndex}]`, `引用不存在的活动/功能稳定 ID：${ref}`);
    }
  }

  if (!Array.isArray(model.traceLinks)) {
    // required array error is already reported above
  } else {
    const allowedTypes = new Set(["implements", "reads", "writes", "exposes", "renders", "depends-on"]);
    for (const [index, trace] of model.traceLinks.entries()) {
      for (const endpoint of ["from", "to"]) {
        const ref = trace?.[endpoint];
        if (!ids.has(ref)) addIssue(errors, "DM011", `traceLinks[${index}].${endpoint}`, `引用不存在的稳定 ID：${ref}`);
      }
      if (!allowedTypes.has(trace?.type)) addIssue(errors, "DM012", `traceLinks[${index}].type`, "追踪类型不受支持");
    }
  }

  const profile = model.profiles?.api;
  if (profile?.profileId && !profile?.protocolVersion) {
    addIssue(errors, "DM013", "profiles.api.protocolVersion", "声明 profileId 时必须同时声明协议版本");
  }
  if (profile?.protocolVersion && profile.protocolVersion !== "1.0") {
    addIssue(warnings, "DM101", "profiles.api.protocolVersion", `当前工具内置协议为 1.0，收到 ${profile.protocolVersion}`);
  }
  if ((model.screens || []).length === 0) addIssue(warnings, "DM102", "screens", "未声明页面；纯后端/集成项目可忽略");
  if ((model.tables || []).length === 0) addIssue(warnings, "DM103", "tables", "未声明数据表；无持久化项目可忽略");
  if ((model.apis || []).length === 0) addIssue(warnings, "DM104", "apis", "未声明 API；纯设计阶段可暂挂");

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    summary: { errors: errors.length, warnings: warnings.length },
  };
}

function validateDesignModelFile(file) {
  const resolved = path.resolve(file);
  if (!fs.existsSync(resolved)) {
    return {
      ok: false,
      errors: [{ code: "DM404", location: resolved, message: "design-model 文件不存在" }],
      warnings: [],
      summary: { errors: 1, warnings: 0 },
    };
  }
  try {
    return validateDesignModel(JSON.parse(fs.readFileSync(resolved, "utf8")));
  } catch (error) {
    return {
      ok: false,
      errors: [{ code: "DM400", location: resolved, message: `JSON 解析失败：${error.message}` }],
      warnings: [],
      summary: { errors: 1, warnings: 0 },
    };
  }
}

module.exports = { ID_PATTERN, validateDesignModel, validateDesignModelFile };
