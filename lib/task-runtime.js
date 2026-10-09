"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const pkg = require("../package.json");
const router = require("./router.js");
const observation = require("./task-observability.cjs");
const DEFAULT_MANIFEST = require("../files/.github/skills/_manifest.json");

function options(projectRoot, extra = {}) {
  return { projectRoot, packageName: pkg.name, packageVersion: pkg.version, storageDir: ".wl-skills-design/runs", targets: [], ruleFiles: [".github/skills/_manifest.json"].filter((item) => fs.existsSync(path.join(projectRoot, item))), configFiles: [".github/contracts/wl-delivery-profile.v1.json"].filter((item) => fs.existsSync(path.join(projectRoot, item))), ...extra };
}

function manifestFor(projectRoot) {
  const file = path.join(projectRoot, ".github/skills/_manifest.json");
  if (!fs.existsSync(file)) return DEFAULT_MANIFEST;
  observation.captureSnapshot({ projectRoot, targets: [".github/skills/_manifest.json"] });
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function canonicalFiles(skill) {
  return [`.github/skills/${skill.skillPath}`, ...skill.standardPaths.map((item) => `.github/${item}`)];
}

function ruleChecks(skill, projectRoot) {
  return skill.standardPaths.flatMap((item) => {
    const relative = `.github/${item}`;
    const file = path.join(projectRoot, relative);
    if (!fs.existsSync(file)) return [];
    const text = fs.readFileSync(file, "utf8");
    const bullets = [...text.matchAll(/^- \[ \] \*?\*?([A-Z]\d{2})\*?\*?(?: \[([MJ])\])?/gm)];
    const tables = [...text.matchAll(/^\|\s*([A-Z]\d{2})\s*\|/gm)];
    const rules = [...new Map([...bullets, ...tables].map((match) => [match[1], { id: `${skill.id}:${match[1]}`, kind: match[2] === "M" ? "mechanical" : "semantic", source: relative }])).values()];
    return rules.length ? rules : [{ id: `${skill.id}:standard:${item}`, kind: "semantic", source: relative }];
  });
}

function decide(projectRoot, input) {
  const manifest = manifestFor(projectRoot);
  const routed = router.route(input, manifest);
  const winner = manifest.skills.find((item) => item.id === routed.skill);
  const related = /设计|需求|流程图|泳道|原型|数据库|接口文档|openapi|swagger|词典|字段映射|文档|架构|ddd|design|spec|drawio/i.test(input);
  // 明确的日常/创作请求属于职责外；缺少目标的“检查”仍需上下文。
  // 已命中设计技能时优先保留设计意图，例如“设计诗词检索接口”。
  const foreign = /天气|菜谱|做饭|旅游|旅行|股票|翻译|写(?:一首|首)?诗|诗歌创作|write\s+(?:a\s+)?poem|代码 review|code review|pr review|运行故障|原型链|prototype pattern|github actions|ci workflow/i.test(input);
  const ambiguous = !winner && routed.candidates[0]?.score >= manifest.routingPolicy.minimumScore;
  let status = winner ? "matched" : ambiguous ? "ambiguous" : foreign ? "not-applicable" : related ? "gap" : "needs-context";
  let reasons = [winner ? "manifest-threshold-and-margin-satisfied" : ambiguous ? "insufficient-score-margin" : status === "gap" ? "related-design-task-without-covered-route" : status === "not-applicable" ? "outside-design-domain" : "insufficient-task-context"];
  const files = winner ? canonicalFiles(winner).map((relative) => {
    const file = path.join(projectRoot, relative);
    observation.captureSnapshot({ projectRoot, targets: [relative] });
    return fs.existsSync(file) && fs.statSync(file).isFile() ? { path: relative, status: "present", sha256: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") } : { path: relative, status: "missing" };
  }) : [];
  if (files.some((item) => item.status === "missing")) { status = "gap"; reasons = [...reasons, "required-canonical-files-missing"]; }
  const rules = winner ? ruleChecks(winner, projectRoot) : [];
  if (winner && !rules.length) rules.push({ id: `${winner.id}:canonical-workflow-review`, kind: "semantic", source: `.github/skills/${winner.skillPath}`, name: `${winner.name}流程约束` });
  // doc.intake 是先分流再读取领域规范的基线工作流，不凭空声明其覆盖其他领域规则。
  if (winner?.id === "doc.intake" && status === "matched") status = "baseline";
  const gaps = status === "gap" ? [{ kind: winner ? "asset" : "skill", reason: reasons.join(", "), suggestion: winner ? "修复本包 canonical 资产缺失并重新判定；禁止借用其他包同名文件" : "为此设计任务补充输入、负向领域、规则与验证器，先人工评审再启用" }] : [];
  const requiredChecks = rules.map((item) => item.id);
  if (winner && !requiredChecks.length) requiredChecks.push(`${winner.id}:canonical-workflow-review`);
  return { recordVersion: 1, applicable: status === "needs-context" ? null : status !== "not-applicable", status, reasons, ruleDetails: rules.map((item) => ({ ...item, name: item.name || item.id })), requiredRules: rules.map((item) => item.id), requiredFiles: files.filter((item) => item.status === "present").map((item) => item.path), missingInputs: files.filter((item) => item.status === "missing").map((item) => item.path), selectionEvidence: "deterministic-routing", hostDiscovery: "unverified", contentLoaded: "unverified", intent: routed.intent, selectedSkills: winner ? [winner.id] : [], candidates: routed.candidates, applicableRules: rules, requiredChecks, gaps, contextRequirements: winner?.context.blocking || [], unverified: ["host-discovery", "model-selected-skill", "model-read-canonical-files", ...requiredChecks], files, evidenceKind: "file-snapshot", modelRead: "unverified", ready: Boolean(winner && !files.some((item) => item.status === "missing")) };
}

function task(projectRoot, input, extra = {}) {
  const decision = decide(projectRoot, input);
  const state = extra.persist === false ? {} : observation.startTask({ ...options(projectRoot, { ...extra, targets: extra.targets || [] }), task: input, decision });
  return observation.attachNotice({ ...state, ok: !["gap", "ambiguous"].includes(decision.status), ready: decision.ready, decision, executionStatus: "not-executed", plan: { state: "planned", intent: decision.intent, steps: manifestFor(projectRoot).routingPolicy.closeLoopByIntent[decision.intent], authorization: "canonical-skill-existing-write-boundaries" } }, options(projectRoot, { originalTargets: extra.targets || [] }));
}

function status(projectRoot, extra = {}) { return observation.readStatus(options(projectRoot, extra)); }
function doctorHost(projectRoot, host = "codex") {
  return observation.doctorHost({ ...options(projectRoot), host, entryFiles: host === "claude" ? ["CLAUDE.md"] : host === "copilot" ? [".github/copilot-instructions.md"] : ["AGENTS.md"], skillPaths: DEFAULT_MANIFEST.skills.filter((item) => item.status === "released").map((item) => `.github/skills/${item.skillPath}`), gatewayPath: ".agents/skills/wl-skills-design/SKILL.md" });
}

function validationStart(projectRoot, extra = {}) {
  return observation.beginExecution({ ...options(projectRoot, { ...extra, ruleFiles: [".github/skills/_manifest.json", ...new Set(DEFAULT_MANIFEST.skills.flatMap((item) => item.standardPaths.map((file) => `.github/${file}`)))].filter((item) => fs.existsSync(path.join(projectRoot, item))), configFiles: [".github/contracts/wl-delivery-profile.v1.json"].filter((item) => fs.existsSync(path.join(projectRoot, item))) }), tool: "design-mechanical-validator", readOnlyVerification: true });
}
function validationFinish(handle, reports, exitCode) {
  const domainSkill = { spec: "requirements.spec", flowchart: "requirements.flowchart", db: "data.database", api: "api.restful" };
  const checks = reports.flatMap((report) => report.coverage.checks.map((item) => ({ id: `${domainSkill[report.domain]}:${item.id}`, status: item.status, reason: item.reason })));
  return observation.finishExecution(handle, { exitCode, validationStatus: reports.some((item) => item.validationStatus === "failed") ? "failed" : reports.some((item) => item.validationStatus === "partial") ? "partial" : "passed", checks, checkedFiles: reports.flatMap((report) => report.checkedFiles || []), summary: { mechanical: "executed", semantic: "unverified", subjects: reports.length }, artifacts: [] });
}

module.exports = { canonicalFiles, decide, doctorHost, observation, options, status, task, validationFinish, validationStart };
