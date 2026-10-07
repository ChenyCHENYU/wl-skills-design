"use strict";

// 此发布模块同时供 CLI 和路线评测使用，避免开发脚本产生第二套路由。
function normalize(text) {
  return text.normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ");
}

function containsPhrase(text, phrase) {
  const value = normalize(phrase);
  let index = text.indexOf(value);
  while (value && index !== -1) {
    const before = text.slice(Math.max(0, index - 24), index);
    const after = text[index + value.length] || "";
    const boundary = !/^[a-z0-9_.+-]+$/i.test(value) || !/[a-z0-9]/i.test((text[index - 1] || "") + after);
    const negated = /(?:不要|不用|无需|禁止|别|不是|不做|do not|don't|without)(?:生成|创建|做|画|绘制|进行|设计)?\s*$/i.test(before);
    if (boundary && !negated) return true;
    index = text.indexOf(value, index + value.length);
  }
  return false;
}

function detectIntent(prompt) {
  const text = normalize(prompt);
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
  const text = normalize(prompt);
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
