"use strict";

// 本包标准是规则名称与清单的唯一来源；任务提示与验证覆盖复用同一解析。
// 带 [M/J] 的清单优先于解释表，避免表格覆盖已声明的机械/语义类别。
function parseStandardRules(text, { includeTables = true } = {}) {
  const rules = new Map();
  const readable = (value, fallback) => value.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").trim() || fallback;
  for (const match of text.matchAll(/^- \[ \]\s+\*{0,2}([A-Z]+(?:-\d+|\d+))\*{0,2}\s*(?:\[([MJ])\])?\s*[.．—-]?\s*(.*?)\s*$/gm)) {
    rules.set(match[1], { id: match[1], kind: match[2] === "M" ? "mechanical" : "semantic", name: readable(match[3], match[1]) });
  }
  if (includeTables) for (const match of text.matchAll(/^\|\s*([A-Z]+(?:-\d+|\d+))\s*\|\s*([^|]+)\|/gm)) {
    if (!rules.has(match[1])) rules.set(match[1], { id: match[1], kind: "semantic", name: readable(match[2], match[1]) });
  }
  return [...rules.values()];
}

module.exports = { parseStandardRules };
