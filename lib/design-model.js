"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ID_PATTERN = /^[A-Z][A-Z0-9_-]{1,63}$/;
const NAME_EN_PATTERN = /^[a-z][A-Za-z0-9]*$/;
const OPERATION_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/;
const REQUIRED_ARRAYS = ["fields", "functions", "traceLinks"];
const COLLECTIONS = ["terms", "fields", "functions", "flows", "screens", "tables", "apis"];
const ITEM_PROPERTY_SPECS = {
  terms: {
    required: ["name", "definition", "source"],
    allowed: new Set(["id", "name", "definition", "aliases", "source"]),
  },
  fields: {
    required: ["nameZh", "nameEn", "logicalType", "source"],
    allowed: new Set(["id", "nameZh", "nameEn", "logicalType", "enumId", "source"]),
  },
  functions: {
    required: ["code", "name", "inputFieldIds", "outputFieldIds", "source"],
    allowed: new Set(["id", "code", "name", "inputFieldIds", "outputFieldIds", "source"]),
  },
  flows: {
    required: ["code", "name", "activityIds"],
    allowed: new Set(["id", "code", "name", "activityIds"]),
  },
  screens: {
    required: ["name", "functionIds", "fieldIds"],
    allowed: new Set(["id", "name", "functionIds", "fieldIds"]),
  },
  tables: {
    required: ["physicalName", "fieldIds"],
    allowed: new Set(["id", "physicalName", "fieldIds"]),
  },
  apis: {
    required: ["operationId", "functionIds", "requestFieldIds", "responseFieldIds"],
    allowed: new Set(["id", "operationId", "functionIds", "requestFieldIds", "responseFieldIds"]),
  },
  traceLinks: {
    required: ["from", "to", "type"],
    allowed: new Set(["from", "to", "type"]),
  },
};
const PROFILE_ALLOWED = {
  database: new Set(["dialect", "tenantMode", "deleteStrategy", "auditStrategy", "idStrategy", "concurrencyStrategy"]),
  api: new Set([
    "profileId", "protocolVersion", "contract", "protocol", "auth", "responseModel",
    "errorModel", "pagination", "versioning", "idempotency", "dateTime", "decimal", "batch",
  ]),
};

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

function validateSource(value, location, errors) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    addIssue(errors, "DM018", location, "source 必须是含 path 的对象");
    return;
  }
  if (typeof value.path !== "string" || !value.path.trim()) {
    addIssue(errors, "DM018", `${location}.path`, "source.path 不能为空");
  }
  for (const key of Object.keys(value)) {
    if (key !== "path" && key !== "anchor") {
      addIssue(errors, "DM015", `${location}.${key}`, "source 含未定义字段");
    }
  }
}

function validateItemShape(collection, item, location, errors) {
  const spec = ITEM_PROPERTY_SPECS[collection];
  if (!spec) return;
  for (const key of Object.keys(item)) {
    if (!spec.allowed.has(key)) addIssue(errors, "DM015", `${location}.${key}`, "含未定义字段");
  }
  for (const key of spec.required) {
    const value = item[key];
    if (value === undefined || value === null || value === "") {
      addIssue(errors, "DM014", `${location}.${key}`, "缺少必填字段或为空");
    }
  }
  if (collection === "fields" && item.nameEn !== undefined && (typeof item.nameEn !== "string" || !NAME_EN_PATTERN.test(item.nameEn))) {
    addIssue(errors, "DM016", `${location}.nameEn`, "nameEn 必须是 lowerCamelCase");
  }
  if (collection === "apis" && item.operationId !== undefined && (typeof item.operationId !== "string" || !OPERATION_ID_PATTERN.test(item.operationId))) {
    addIssue(errors, "DM017", `${location}.operationId`, "operationId 命名不合法");
  }
  if ((collection === "terms" || collection === "fields" || collection === "functions") && item.source !== undefined) {
    validateSource(item.source, `${location}.source`, errors);
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
      validateItemShape(name, item, location, errors);
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
  const asArray = (value) => (Array.isArray(value) ? value : []);
  for (const [collection, fields] of Object.entries(referenceRules)) {
    for (const [index, item] of asArray(model[collection]).entries()) {
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
  for (const [index, field] of asArray(model.fields).entries()) {
    if (field?.enumId && !termIds.has(field.enumId)) {
      addIssue(errors, "DM009", `fields[${index}].enumId`, `引用不存在的 terms ID：${field.enumId}`);
    }
  }

  for (const [index, flow] of asArray(model.flows).entries()) {
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
      validateItemShape("traceLinks", trace && typeof trace === "object" && !Array.isArray(trace) ? trace : {}, `traceLinks[${index}]`, errors);
      for (const endpoint of ["from", "to"]) {
        const ref = trace?.[endpoint];
        if (!ids.has(ref)) addIssue(errors, "DM011", `traceLinks[${index}].${endpoint}`, `引用不存在的稳定 ID：${ref}`);
      }
      if (!allowedTypes.has(trace?.type)) addIssue(errors, "DM012", `traceLinks[${index}].type`, "追踪类型不受支持");
    }
  }

  for (const [profileName, profile] of Object.entries(model.profiles || {})) {
    const allowed = PROFILE_ALLOWED[profileName];
    if (!allowed) {
      addIssue(errors, "DM015", `profiles.${profileName}`, "含未定义 profile");
      continue;
    }
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
      addIssue(errors, "DM005", `profiles.${profileName}`, "必须是对象");
      continue;
    }
    for (const key of Object.keys(profile)) {
      if (!allowed.has(key)) addIssue(errors, "DM015", `profiles.${profileName}.${key}`, "含未定义字段");
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
