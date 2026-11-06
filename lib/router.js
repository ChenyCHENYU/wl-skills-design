"use strict";
const taskIntent = require("./task-intent.cjs");

// 此发布模块同时供 CLI 和路线评测使用，避免开发脚本产生第二套路由。
function normalize(text) {
  return text.normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ");
}

function containsPhrase(text, phrase) {
  return taskIntent.phraseMatches(text, phrase);
}

function containsCombination(text, combinations = []) {
  const clauses = text.split(/[,，。；;\n]|并且?|同时|以及|然后|另外/u);
  return combinations.some(({ verbs, objects, exclude = [] }) => clauses.some((clause) => !exclude.some((phrase) => containsPhrase(clause, phrase)) && verbs.some((verb) => {
    let offset = -1;
    while ((offset = clause.indexOf(verb, offset + 1)) >= 0) {
      if (!containsPhrase(clause, verb)) continue;
      const before = clause.slice(Math.max(0, offset - 40), offset);
      const after = clause.slice(offset + verb.length, offset + verb.length + 40);
      if (objects.some((object) => containsPhrase(before, object) || containsPhrase(after, object))) return true;
    }
    return false;
  })));
}

function workflowOwners(text) {
  const owners = new Set();
  const domains = [/需求|说明书/u, /流程|泳道/u, /原型|画面/u, /数据库|数据表/u, /接口|\bapi\b/iu, /词典|术语/u];
  if (/评审|审查|检查|核对|review/iu.test(text) && /一起|跨文档|之间|一致|全套|对照/u.test(text)
      && domains.filter(pattern => pattern.test(text)).length >= 2) owners.add("cross.designReview");
  if (/影响|波及|同步/u.test(text) && /变更|改成|修改|调整|改为|改[^，。；;\n]{0,20}(?:接口|字段|流程|状态)/u.test(text)) owners.add("cross.changeImpact");
  if (/接收|接入|导入|整理|补全/u.test(text) && /文档|详设|word/iu.test(text) && /完整|补充|缺失|差距|旧|既有|这批/u.test(text)) owners.add("doc.intake");
  return owners;
}

function candidateFocus(text) {
  const parts = text.split(/([,，。；;\n]|并且?|同时|然后|另外)/u);
  const production = /生成|编写|绘制|设计(?!方案|文档|说明|规范|标准|模型|结果|图|稿)|画/u;
  return parts.map((part, index) => part.replace(/(?:根据|依据|基于|参考|按(?:照)?)([^,，。；;\n]{1,64})/gu, (whole, reference) => {
    const verbs = [...reference.matchAll(new RegExp(production.source, "gu"))];
    if (verbs.length) {
      const at = verbs.at(-1).index;
      const prohibition = reference.slice(0, at).match(/(?:不要|不用|无需|禁止|不得|不可|不能|别|不再|不|do not|don't)\s*$/iu)?.[0] || "";
      return prohibition + reference.slice(at);
    }
    if (/^[,，]$/u.test(parts[index + 1] || "") && /^\s*(?:请|先|帮我)?\s*(?:生成|编写|绘制|设计|画)/u.test(parts[index + 2] || "")) return "";
    return whole;
  })).join("");
}

function detectIntent(prompt) {
  const text = normalize(taskIntent.analyzeTask(prompt).activeText);
  const rules = [
    ["impact", /变更|影响|change impact/],
    ["review", /评审|评分|审查|走查|评估|review|追溯矩阵/],
    ["validate", /验证|校验|检查|validate|audit/],
    ["repair", /修复|整改|repair|fix/],
    ["maintain", /维护|登记|统一|对齐|整理|maintain/],
  ];
  return rules.find(([, regex]) => regex.test(text))?.[0] || "create";
}

function route(prompt, manifest) {
  const activeText = normalize(taskIntent.analyzeTask(prompt).activeText);
  const weights = manifest.routingPolicy.scoreWeights;
  const owners = workflowOwners(activeText);
  const text = owners.size ? activeText : candidateFocus(activeText);
  const ownedSkill = owners.size === 1 ? manifest.skills.find(skill => owners.has(skill.id)) : null;
  const lexicalIntent = detectIntent(text);
  const intent = ownedSkill && !ownedSkill.intents.includes(lexicalIntent) ? ownedSkill.intents[0] : lexicalIntent;
  const independentCreation = /(?:并且?|然后|另外|再|同时)[^，。；;\n]{0,8}(?:设计|生成|绘制|画|编写|创建)/u.test(text);
  const candidates = [];
  for (const skill of manifest.skills.filter((item) => item.status === "released")) {
    const negative = skill.triggers.negative.some((item) => containsPhrase(text, item));
    const exact = owners.has(skill.id) || skill.triggers.exact.some((item) => containsPhrase(text, item)) || containsCombination(text, skill.triggers.combinations);
    const context = skill.context.signals.some((item) => containsPhrase(text, item));
    let score = exact ? weights.exact : 0;
    if (skill.intents.includes(intent)) score += weights.intent;
    if (context) score += weights.context;
    if (negative) score += weights.negative;
    if (owners.has(skill.id) && !independentCreation) score += weights.intent;
    candidates.push({ id: skill.id, name: skill.name, description: skill.description || skill.name, score, priority: skill.priority ?? 0, exact, context, negative });
  }
  candidates.sort((a, b) => b.score - a.score || b.priority - a.priority || a.id.localeCompare(b.id, "en"));
  const first = candidates[0];
  const second = candidates[1];
  const winner = first.score >= manifest.routingPolicy.minimumScore && first.score - second.score >= manifest.routingPolicy.minimumMargin ? first.id : null;
  return { skill: winner, intent, candidates };
}


module.exports = { containsPhrase, detectIntent, normalize, route };
