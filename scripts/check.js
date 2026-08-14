#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const FILES = path.join(ROOT, "files");
const GH = path.join(FILES, ".github");
const SKILLS = path.join(GH, "skills");
const PROMPTS = path.join(GH, "prompts");
const STANDARDS = path.join(GH, "standards");
const MANIFEST_FILE = path.join(SKILLS, "_manifest.json");
const ROUTE_EVALS = path.join(SKILLS, "_route-evals.json");
const errors = [];
const warnings = [];
const stats = {};

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function json(file) {
  return JSON.parse(read(file));
}

function exists(file) {
  return fs.existsSync(file);
}

function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function walk(dir, predicate = () => true) {
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full, predicate) : predicate(full) ? [full] : [];
    });
}

function zipEntries(file) {
  const buffer = fs.readFileSync(file);
  let eocd = -1;
  for (let offset = buffer.length - 22, floor = Math.max(0, buffer.length - 65_557); offset >= floor; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      eocd = offset;
      break;
    }
  }
  if (eocd < 0) throw new Error("找不到 ZIP 目录");

  const total = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let index = 0; index < total; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error("ZIP 中央目录损坏");
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) throw new Error(`ZIP 本地目录损坏：${name}`);
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const packed = buffer.subarray(start, start + compressedSize);
    if (method === 0) entries.set(name, Buffer.from(packed));
    else if (method === 8) entries.set(name, zlib.inflateRawSync(packed));
    else throw new Error(`不支持 ZIP 压缩方法 ${method}：${name}`);
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function parseFrontmatter(file) {
  const content = read(file).replace(/^\uFEFF/, "");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const fields = {};
  let current = null;
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([a-zA-Z][a-zA-Z0-9-]*):\s*(.*)$/);
    if (field) {
      current = field[1];
      fields[current] = field[2].trim().replace(/^['"]|['"]$/g, "");
    } else if (current && /^\s+\S/.test(line)) {
      fields[current] = `${fields[current]} ${line.trim()}`.trim();
    }
  }
  return { fields, body: content.slice(match[0].length) };
}

function checkManifestAndSkills() {
  let manifest;
  try {
    manifest = json(MANIFEST_FILE);
  } catch (error) {
    errors.push(`[manifest] 无效 JSON：${error.message}`);
    return null;
  }
  if (manifest.schemaVersion !== 2) errors.push("[manifest] schemaVersion 必须为 2");
  if (manifest.routingPolicy?.minimumScore !== 70) errors.push("[manifest] minimumScore 必须为 70");
  if (manifest.routingPolicy?.minimumMargin !== 15) errors.push("[manifest] minimumMargin 必须为 15");
  const ids = new Set();
  const paths = new Set();
  const names = new Set();
  let released = 0;

  for (const skill of manifest.skills || []) {
    const label = skill.id || "<missing-id>";
    if (!skill.id || ids.has(skill.id)) errors.push(`[manifest] id 缺失或重复：${label}`);
    if (!skill.skillPath || paths.has(skill.skillPath)) errors.push(`[manifest] skillPath 缺失或重复：${label}`);
    ids.add(skill.id);
    paths.add(skill.skillPath);
    if (!new Set(["released", "planned", "deprecated"]).has(skill.status)) {
      errors.push(`[manifest] ${label} status 非法：${skill.status}`);
    }
    if (!Array.isArray(skill.intents) || !skill.intents.length) errors.push(`[manifest] ${label} 缺少 intents`);
    if (!Array.isArray(skill.triggers?.exact) || !skill.triggers.exact.length) errors.push(`[manifest] ${label} 缺少 exact`);
    if (!Array.isArray(skill.triggers?.negative)) errors.push(`[manifest] ${label} 缺少 negative`);
    if (!skill.context?.blocking?.length) errors.push(`[manifest] ${label} 缺少 blocking context`);
    if (!Array.isArray(skill.context?.optional)) errors.push(`[manifest] ${label} 缺少 optional context`);
    if (!Array.isArray(skill.context?.signals) || !skill.context.signals.length) errors.push(`[manifest] ${label} 缺少 context signals`);
    if (!skill.outputs?.length) errors.push(`[manifest] ${label} 缺少 outputs`);
    for (const standard of skill.standardPaths || []) {
      if (!exists(path.join(GH, standard))) errors.push(`[manifest] ${label} 规范不存在：${standard}`);
    }
    for (const prompt of skill.promptPaths || []) {
      if (!exists(path.join(GH, prompt))) errors.push(`[manifest] ${label} Prompt 不存在：${prompt}`);
    }
    if (skill.status !== "released") continue;
    released += 1;
    const file = path.join(SKILLS, skill.skillPath);
    if (!exists(file)) {
      errors.push(`[skill] 缺少 ${skill.skillPath}`);
      continue;
    }
    const fm = parseFrontmatter(file);
    if (!fm) {
      errors.push(`[skill] ${skill.skillPath} 缺少 YAML frontmatter`);
      continue;
    }
    const keys = Object.keys(fm.fields).sort();
    if (keys.join(",") !== "description,name") {
      errors.push(`[skill] ${skill.skillPath} frontmatter 只能包含 name、description，实际：${keys.join(",")}`);
    }
    const folder = path.basename(path.dirname(file));
    if (fm.fields.name !== folder) errors.push(`[skill] ${skill.skillPath} name 必须等于目录名 ${folder}`);
    if (!/^[a-z0-9-]{1,64}$/.test(fm.fields.name || "")) errors.push(`[skill] ${skill.skillPath} name 非法`);
    if (!fm.fields.description || fm.fields.description.length > 1024) errors.push(`[skill] ${skill.skillPath} description 缺失或超过 1024 字符`);
    if (names.has(fm.fields.name)) errors.push(`[skill] name 重复：${fm.fields.name}`);
    names.add(fm.fields.name);
    const lines = read(file).split(/\r?\n/).length;
    if (lines > 500) errors.push(`[skill] ${skill.skillPath} 超过 500 行：${lines}`);
    if (/\btools\s*:|\ballowed-tools\s*:/.test(read(file).split("---", 2)[1] || "")) {
      errors.push(`[skill] ${skill.skillPath} 含非便携工具字段`);
    }
    for (const requiredDir of ["templates", "examples"]) {
      const dir = path.join(path.dirname(file), requiredDir);
      if (!walk(dir).length) errors.push(`[skill] ${skill.skillPath} 缺少 ${requiredDir}/ 资源`);
    }
    if (exists(path.join(path.dirname(file), "USAGE.md")) || exists(path.join(path.dirname(file), "README.md"))) {
      errors.push(`[skill] ${skill.skillPath} 目录含冗余 README/USAGE 文档`);
    }
  }
  stats.skills = `${released}/${manifest.skills.length}`;
  return manifest;
}

function checkRegistry(manifest) {
  if (!manifest) return;
  const registry = read(path.join(SKILLS, "_registry.md"));
  for (const skill of manifest.skills) {
    if (!registry.includes(`\`${skill.skillPath}\``)) errors.push(`[registry] 缺少 ${skill.skillPath}`);
  }
}

function checkPrompts(manifest) {
  const promptFiles = walk(PROMPTS, (file) => file.endsWith(".prompt.md"));
  for (const file of promptFiles) {
    const fm = parseFrontmatter(file);
    if (!fm) {
      errors.push(`[prompt] ${rel(file)} 缺少 frontmatter`);
      continue;
    }
    const keys = Object.keys(fm.fields);
    if (!fm.fields.description) errors.push(`[prompt] ${rel(file)} 缺少 description`);
    if (fm.fields.agent !== "agent") errors.push(`[prompt] ${rel(file)} 必须使用 agent: agent`);
    if (keys.includes("mode")) errors.push(`[prompt] ${rel(file)} 使用已淘汰的 mode 字段`);
    if (/\b(read_file|create_file|replace_string_in_file)\b/.test(read(file))) {
      errors.push(`[prompt] ${rel(file)} 含旧工具 ID`);
    }
    if (path.basename(file).startsWith("validate-") && /无需等待|自动修复|直接.*修复/.test(read(file))) {
      errors.push(`[prompt] ${rel(file)} 验证入口不得默认自动修复`);
    }
  }
  const expected = new Set((manifest?.skills || []).flatMap((skill) => skill.promptPaths || [])).size;
  if (expected && promptFiles.length !== expected) {
    errors.push(`[prompt] manifest 登记 ${expected} 个 Prompt，实际 ${promptFiles.length}`);
  }
  stats.prompts = promptFiles.length;
}

function checkIntentChain(manifest) {
  if (!manifest?.routingPolicy?.intentPriority) return;
  const source = read(path.join(GH, "copilot-instructions.md"));
  const line = source.split(/\r?\n/).find((item) => item.includes("动作意图"));
  if (!line) {
    errors.push("[intent] 调度正文缺少动作意图链");
    return;
  }
  const chain = [...line.matchAll(/`([a-z]+)`/g)].map((match) => match[1]);
  const expected = manifest.routingPolicy.intentPriority;
  if (chain.join(",") !== expected.join(",")) {
    errors.push(`[intent] 调度正文意图链与 manifest 不一致：${chain.join(" → ")} ≠ ${expected.join(" → ")}`);
  }
}

function checkLocalLinks() {
  const files = walk(FILES, (file) => /\.(md|mdc)$/.test(file));
  let checked = 0;
  for (const file of files) {
    const content = read(file);
    const regex = /\[[^\]]*\]\(([^)]+)\)/g;
    let match;
    while ((match = regex.exec(content))) {
      let target = match[1].trim().replace(/^<|>$/g, "").split("#")[0];
      if (!target || /^(https?:|mailto:|#)/i.test(target)) continue;
      target = decodeURIComponent(target);
      checked += 1;
      if (!exists(path.resolve(path.dirname(file), target))) {
        errors.push(`[link] ${rel(file)} -> ${match[1]}`);
      }
    }
  }
  stats.links = checked;
}

function normalize(text) {
  return text.normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ");
}

function squash(text) {
  return normalize(text).replace(/[\s\-_/.]+/g, "");
}

function containsPhrase(text, phrase) {
  const value = normalize(phrase);
  if (/^[a-z0-9_.+-]+$/i.test(value)) {
    return new RegExp(`(^|[^a-z0-9])${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i").test(text);
  }
  return text.includes(value);
}

function containsTerm(normalizedContent, term) {
  const squashed = squash(term);
  if (!squashed) return false;
  return normalizedContent.includes(squashed);
}

function detectIntent(prompt) {
  const text = normalize(prompt);
  const rules = [
    ["impact", /变更|影响|change impact/],
    ["review", /评审|评分|审查|走查|review|追溯矩阵/],
    ["validate", /验证|校验|检查|validate|audit/],
    ["repair", /修复|整改|repair|fix/],
    ["maintain", /维护|登记|统一|对齐|maintain/],
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

function checkRoutes(manifest) {
  if (!manifest) return;
  let evals;
  try {
    evals = json(ROUTE_EVALS);
  } catch (error) {
    errors.push(`[route] 路由语料无效：${error.message}`);
    return;
  }
  for (const item of evals.cases || []) {
    const actual = route(item.prompt, manifest);
    if (actual.skill !== item.skill || actual.intent !== item.intent) {
      errors.push(`[route] “${item.prompt}” 期望 ${item.skill}/${item.intent}，实际 ${actual.skill}/${actual.intent}`);
    }
  }
  stats.routes = evals.cases.length;
}

function checkContentContracts() {
  const allText = walk(ROOT, (file) => !file.includes(`${path.sep}.git${path.sep}`) && !file.includes(`${path.sep}node_modules${path.sep}`) && /\.(md|mdc|json|js|yaml|yml|txt|drawio)$/.test(file));
  const sensitive = [
    "\u70df\u53f0\u534e\u65b0",
    "\u534e\u65b0\u9879\u76ee",
    "\u6c5f\u82cf\u91d1\u6052",
    "\u91d1\u6052\u5e73\u53f0",
    ["hua", "xin"].join(""),
    "\u6e90\u81ea\u771f\u5b9e\u9879\u76ee",
  ];
  for (const file of allText) {
    const base = path.basename(file);
    if (file.includes(`${path.sep}kit-internal${path.sep}test-flowcharts${path.sep}`) && /^(?:~\$)?AI还原-/u.test(base)) continue;
    const squashedContent = squash(read(file));
    for (const term of sensitive) {
      if (containsTerm(squashedContent, term)) errors.push(`[privacy] ${rel(file)} 含禁用词：${term}`);
    }
  }

  const templates = walk(SKILLS, (file) => file.includes(`${path.sep}templates${path.sep}`));
  const templateBusinessTerms = [
    ["smelting", "OrderNo"].join(""),
    ["steel", "Grade"].join(""),
    ["PMP", "M007"].join(""),
    ["PM", "OM"].join(""),
    "\u70df\u53f0",
    "\u534e\u65b0",
  ];
  for (const file of templates) {
    const squashedContent = squash(read(file));
    for (const term of templateBusinessTerms) {
      if (containsTerm(squashedContent, term)) errors.push(`[template] ${rel(file)} 含业务样例值：${term}`);
    }
  }

  const publishedPrivacyTerms = [
    ["PM", "OM"].join(""),
    ["PMP", "M"].join(""),
    ["PM", "MB"].join(""),
    ["QM", "_PM"].join(""),
    "\u771f\u5b9e\u573a\u666f",
    "\u70bc\u94a2",
    "\u8f67\u94a2",
    "\u94a2\u79cd",
    "\u5408\u91d1",
    "\u7089\u6b21",
    "\u7089\u53f7",
    ["legacy", "-client"].join(""),
    "\u771f\u5b9e\u793a\u4f8b",
    "\u6765\u6e90\u4e8e\u771f\u5b9e",
    ["BI", "P"].join(""),
    "\u7528\u53cb",
    "\u751f\u4ea7\u8ba1\u5212",
    "\u751f\u4ea7\u8ba2\u5355",
    "\u4ea7\u54c1\u7c7b\u578b\u539f\u6599",
    ["smelt", "ing"].join(""),
    ["st", "eel"].join(""),
    ["bil", "let"].join(""),
    ["scr", "ap"].join(""),
  ];
  const publishedFiles = walk(FILES, (file) => /\.(md|mdc|json|yaml|yml|txt|drawio)$/.test(file));
  for (const file of publishedFiles) {
    const squashedContent = squash(read(file));
    for (const term of publishedPrivacyTerms) {
      if (containsTerm(squashedContent, term)) errors.push(`[privacy] ${rel(file)} 含非匿名样例词：${term}`);
    }
  }

  const examplePrivacyTerms = [
    "\u5ba2\u6237\u540d\u79f0",
    "\u5ba2\u6237\u7f16\u7801",
    "\u793a\u4f8b\u5ba2\u6237",
    "\u624b\u673a\u53f7",
    "\u8eab\u4efd\u8bc1",
    "\u771f\u5b9e\u59d3\u540d",
    "\u5bb6\u5ead\u4f4f\u5740",
  ];
  for (const file of publishedFiles.filter((item) => item.includes(`${path.sep}examples${path.sep}`))) {
    const content = read(file);
    for (const term of examplePrivacyTerms) {
      if (content.includes(term)) errors.push(`[privacy] ${rel(file)} 的匿名样例含敏感字段词：${term}`);
    }
  }

  const stale = [
    ["逐项检查（15 项）", "流程图验证仍为 15 项"],
    ["通过 X / 15 项", "流程图报告仍为 15 项"],
    ["总项数：30 |", "数据库报告仍为 30 项"],
    ["总项数：35 |", "接口报告仍为 35 项"],
    ["95-100%", "存在无基准精度承诺"],
    ["95–100%", "存在无基准精度承诺"],
  ];
  const publishedText = walk(FILES, (file) => /\.(md|mdc|txt|drawio)$/.test(file)).map(read).join("\n");
  for (const [pattern, message] of stale) if (publishedText.includes(pattern)) errors.push(`[consistency] ${message}`);
  stats.templates = templates.length;
}

function checkDrawio() {
  const files = walk(SKILLS, (file) => file.endsWith(".drawio"));
  for (const file of files) {
    const content = read(file);
    if (!/<mxfile[\s>]/.test(content) || !/<mxGraphModel[\s>]/.test(content)) {
      errors.push(`[drawio] ${rel(file)} 缺少 mxfile/mxGraphModel`);
      continue;
    }
    const diagrams = [...content.matchAll(/<diagram\b[^>]*>[\s\S]*?<\/diagram>/g)].map((match) => match[0]);
    for (const [index, diagram] of diagrams.entries()) {
      const ids = [...diagram.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
      const unique = new Set(ids);
      if (ids.length !== unique.size) errors.push(`[drawio] ${rel(file)} 第 ${index + 1} 页存在重复 ID`);
      for (const match of diagram.matchAll(/\b(parent|source|target)="([^"]+)"/g)) {
        if (!unique.has(match[2])) errors.push(`[drawio] ${rel(file)} 第 ${index + 1} 页 ${match[1]} 引用不存在：${match[2]}`);
      }
    }
  }
  stats.drawio = files.length;
}

function checkDocxPrivacy() {
  const roots = [path.join(ROOT, "kit-internal"), path.join(ROOT, "spec-gen")];
  const files = roots.flatMap((root) => walk(root, (file) => file.endsWith(".docx")));
  const terms = [
    ["PM", "OM"].join(""),
    ["PMP", "M"].join(""),
    ["PM", "MB"].join(""),
    ["QM", "_PM"].join(""),
    ["hua", "xin"].join(""),
    "\u70df\u53f0",
    "\u534e\u65b0",
    "\u6c5f\u82cf\u91d1\u6052",
    "\u70bc\u94a2",
    "\u8f67\u94a2",
    "\u94a2\u79cd",
    "\u5408\u91d1",
    "\u7089\u6b21",
    "\u7089\u53f7",
  ];

  for (const file of files) {
    try {
      const entries = zipEntries(file);
      if (!entries.has("[Content_Types].xml") || !entries.has("word/document.xml")) {
        errors.push(`[docx] ${rel(file)} 不是完整 DOCX`);
        continue;
      }
      if ([...entries.keys()].some((name) => name.startsWith("word/media/"))) {
        errors.push(`[docx] ${rel(file)} 含未审查的嵌入媒体`);
      }
      if (entries.has("docProps/custom.xml")) errors.push(`[docx] ${rel(file)} 含自定义属性`);

      for (const [name, data] of entries) {
        if (!/\.(xml|rels)$/.test(name)) continue;
        const squashedContent = squash(data.toString("utf8"));
        for (const term of terms) {
          if (containsTerm(squashedContent, term)) errors.push(`[docx] ${rel(file)} 的 ${name} 含禁用词：${term}`);
        }
        if (/w:rsid/.test(content)) errors.push(`[docx] ${rel(file)} 的 ${name} 含修订会话标识`);
        if (/<(?:dc:creator|cp:lastModifiedBy)>[^<]+/.test(content)) errors.push(`[docx] ${rel(file)} 的 ${name} 含作者元数据`);
      }
    } catch (error) {
      errors.push(`[docx] ${rel(file)} 无法检查：${error.message}`);
    }
  }
  stats.docx = files.length;
}

function checkAdapters() {
  const config = json(path.join(SKILLS, "_compat", "editors.json"));
  const active = config.editors.filter((item) => item.enabled);
  const paths = new Set(active.map((item) => item.outputPath));
  if (paths.size !== active.length) errors.push("[adapter] outputPath 重复");
  for (const item of active) {
    if (!exists(path.join(FILES, item.outputPath))) errors.push(`[adapter] 缺少 ${item.outputPath}`);
  }
  for (const legacy of [".cursorrules", ".windsurfrules", ".clinerules"]) {
    const file = path.join(FILES, legacy);
    if (exists(file) && fs.lstatSync(file).isFile()) errors.push(`[adapter] 不应发布旧版单文件 ${legacy}`);
  }
  try {
    execFileSync(process.execPath, [path.join(__dirname, "sync-editors.js"), "--check"], { cwd: ROOT, stdio: "pipe" });
  } catch {
    errors.push("[adapter] 生成配置与源文件漂移，请运行 npm run sync");
  }
  stats.adapters = active.length;
}

function checkSchemas() {
  try {
    const schema = json(path.join(SKILLS, "_design-model.schema.json"));
    if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema") errors.push("[schema] 设计模型必须使用 JSON Schema 2020-12");
    if (!schema.$defs?.field || !schema.$defs?.trace) errors.push("[schema] 设计模型缺少 field/trace 定义");
  } catch (error) {
    errors.push(`[schema] 设计模型无效：${error.message}`);
  }
}

function main() {
  console.log("\n  wl-skills-design doctor\n");
  const manifest = checkManifestAndSkills();
  checkRegistry(manifest);
  checkPrompts(manifest);
  checkIntentChain(manifest);
  checkLocalLinks();
  checkRoutes(manifest);
  checkContentContracts();
  checkDrawio();
  checkDocxPrivacy();
  checkAdapters();
  checkSchemas();

  for (const [name, value] of Object.entries(stats)) console.log(`  · ${name}: ${value}`);
  if (warnings.length) warnings.forEach((item) => console.log(`  ⚠ ${item}`));
  if (errors.length) {
    console.error(`\n  ✖ 发现 ${errors.length} 个问题：`);
    errors.forEach((item) => console.error(`     ${item}`));
    console.error("");
    return 1;
  }
  console.log("\n  ✔ 全部检查通过\n");
  return 0;
}

if (require.main === module) process.exitCode = main();

module.exports = { containsPhrase, detectIntent, main, normalize, route };
