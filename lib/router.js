"use strict";
const taskIntent = require("./task-intent.cjs");

// 此发布模块同时供 CLI 和路线评测使用，避免开发脚本产生第二套路由。
function normalize(text) {
  return text.normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ");
}

function containsPhrase(text, phrase) {
  return taskIntent.phraseMatches(text, phrase);
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
  const text = normalize(taskIntent.analyzeTask(prompt).activeText);
  const intent = detectIntent(prompt);
  const weights = manifest.routingPolicy.scoreWeights;
  const candidates = [];
  for (const skill of manifest.skills.filter((item) => item.status === "released")) {
    const negative = skill.triggers.negative.some((item) => containsPhrase(text, item));
    const exact = skill.triggers.exact.some((item) => containsPhrase(text, item));
    const context = skill.context.signals.some((item) => containsPhrase(text, item));
    let score = exact ? weights.exact : 0;
    if (skill.intents.includes(intent)) score += weights.intent;
    if (context) score += weights.context;
    if (negative) score += weights.negative;
    candidates.push({ id: skill.id, score, priority: skill.priority ?? 0, exact, context, negative });
  }
  candidates.sort((a, b) => b.score - a.score || b.priority - a.priority || a.id.localeCompare(b.id, "en"));
  const first = candidates[0];
  const second = candidates[1];
  const winner = first.score >= manifest.routingPolicy.minimumScore && first.score - second.score >= manifest.routingPolicy.minimumMargin ? first.id : null;
  return { skill: winner, intent, candidates };
}


module.exports = { containsPhrase, detectIntent, normalize, route };
