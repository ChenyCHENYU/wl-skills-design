"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const SHARED_MARKDOWN = new Set([
  "AGENTS.md", "CLAUDE.md", ".github/copilot-instructions.md",
  ".github/skills/_registry.md", ".github/skills/_pipeline.md",
  ".github/standards/index.md", ".github/guides/architecture.md", ".github/guides/usage.md",
]);

function hash(value) {
  return crypto.createHash("sha256").update(String(value).replace(/\r\n/g, "\n")).digest("hex");
}

function preflight(root, rel) {
  const base = path.resolve(root);
  const file = path.resolve(base, rel);
  if (!rel || path.isAbsolute(rel) || file === base || !file.startsWith(base + path.sep)) throw new Error(`非法目标路径：${rel}`);
  let current = base;
  const parts = path.relative(base, file).split(path.sep);
  for (let index = 0; index <= parts.length; index += 1) {
    if (fs.existsSync(current) || (() => { try { fs.lstatSync(current); return true; } catch { return false; } })()) {
      const stat = fs.lstatSync(current);
      if (stat.isSymbolicLink()) throw new Error(`目标包含符号链接：${rel}`);
      if (index === parts.length ? !stat.isFile() : !stat.isDirectory()) throw new Error(`目标路径类型不正确：${rel}`);
    }
    if (index < parts.length) current = path.join(current, parts[index]);
  }
  return file;
}

function block(text, owner) {
  const begin = `<!-- ${owner}:begin -->`;
  const end = `<!-- ${owner}:end -->`;
  const starts = [...text.matchAll(new RegExp(begin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))];
  const ends = [...text.matchAll(new RegExp(end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))];
  if (!starts.length && !ends.length) return null;
  if (starts.length !== 1 || ends.length !== 1 || ends[0].index < starts[0].index) throw new Error(`受管区块标记损坏：${owner}`);
  const start = starts[0].index;
  let finish = ends[0].index + end.length;
  if ((start && text[start - 1] !== "\n") || (text[finish] && !/^[\r\n]/.test(text[finish]))) throw new Error(`受管区块标记必须独占一行：${owner}`);
  if (text.slice(finish, finish + 2) === "\r\n") finish += 2;
  else if (text[finish] === "\n") finish += 1;
  return { start, end: finish, text: text.slice(start, finish) };
}

function renderBlock(source, owner, eol = "\n") {
  return `<!-- ${owner}:begin -->\n${source.replace(/\r\n/g, "\n").replace(/\n*$/, "\n")}<!-- ${owner}:end -->\n`.replace(/\n/g, eol);
}

function planMarkdown(current, source, old, owner, force = false) {
  const part = block(current || "", owner);
  const eol = current?.includes("\r\n") ? "\r\n" : "\n";
  const value = renderBlock(source, owner, eol);
  const record = { kind: "block", installedHash: hash(value), sourceHash: hash(source), prefix: old?.prefix || "",
    createdFile: current === null || (old?.kind === "block" && old.createdFile === true) };
  if (part) {
    if (!old || old.kind === "reference") {
      if (hash(part.text) === hash(value)) return { content: current, record: { kind: "reference", installedHash: hash(part.text), scope: "block" } };
      throw new Error("已有区块不属于本包安装记录");
    }
    if (hash(part.text) !== old.installedHash && !force) throw new Error("本包受管区块有本地改动");
    return { content: current.slice(0, part.start) + value + current.slice(part.end), record };
  }
  if (old?.kind === "block" && !force) throw new Error("本包受管区块已被本地移除");
  const legacyHash = current === null ? null : crypto.createHash("sha256").update(current).digest("hex");
  if (current !== null && old && old.kind !== "reference" && old.kind !== "block" && [hash(current), legacyHash].includes(old.installedHash)) {
    return { content: value, record: { ...record, prefix: "" } };
  }
  if (current !== null && hash(current) === hash(source)) return { content: current, record: { kind: "reference", scope: "file", installedHash: hash(current) } };
  const prefix = current && !current.endsWith("\n") ? eol : "";
  return { content: (current || "") + prefix + value, record: { ...record, prefix } };
}

function removeMarkdown(current, old, owner) {
  if (old.kind === "reference") return { content: current, preserved: true };
  const part = block(current, owner);
  if (old.kind !== "block") return { content: current, preserved: true };
  if (!part || hash(part.text) !== old.installedHash) return { content: current, preserved: true };
  let start = part.start;
  if (old.prefix && current.slice(start - old.prefix.length, start) === old.prefix) start -= old.prefix.length;
  return { content: current.slice(0, start) + current.slice(part.end), preserved: false, keepFile: old.createdFile !== true };
}

function contributionHash(current, old, owner) {
  if (old.kind === "block" || (old.kind === "reference" && old.scope === "block")) return hash(block(current, owner)?.text || "");
  return hash(current);
}

module.exports = { SHARED_MARKDOWN, block, contributionHash, hash, planMarkdown, preflight, removeMarkdown };
