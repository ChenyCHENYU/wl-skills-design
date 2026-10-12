"use strict";

// 只调整布局；业务文字、ID、source/target 与分支标签保持原值。
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { SaxesParser } = require("./vendor/saxes/saxes.js");

function parseXml(xml) {
  const document = { name: "#document", children: [] };
  const stack = [document];
  const parser = new SaxesParser();
  parser.on("error", (error) => { throw error; });
  parser.on("doctype", () => { throw new Error("流程图不支持 DTD 或外部实体"); });
  parser.on("opentag", (tag) => {
    const node = { name: tag.name, attrs: { ...tag.attributes }, children: [] };
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  });
  parser.on("closetag", () => stack.pop());
  parser.on("text", (value) => { if (value.trim()) stack[stack.length - 1].children.push({ text: value }); });
  parser.on("cdata", (value) => stack[stack.length - 1].children.push({ text: value }));
  parser.on("comment", (value) => stack[stack.length - 1].children.push({ comment: value }));
  parser.on("processinginstruction", (value) => stack[stack.length - 1].children.push({ pi: value }));
  parser.write(xml).close();
  return document;
}

function escape(value) { return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\n/g, "&#xa;").replace(/\r/g, "&#xd;").replace(/\t/g, "&#x9;"); }
function serialize(node, depth = 0) {
  const pad = "  ".repeat(depth);
  if (node.text !== undefined) return `${pad}${escape(node.text)}`;
  if (node.comment !== undefined) return `${pad}<!--${node.comment}-->`;
  if (node.pi) return `${pad}<?${node.pi.target} ${node.pi.body}?>`;
  if (node.name === "#document") return `${node.children.map((item) => serialize(item)).join("\n")}\n`;
  const attrs = Object.entries(node.attrs).map(([key, value]) => ` ${key}="${escape(value)}"`).join("");
  return node.children.length ? `${pad}<${node.name}${attrs}>\n${node.children.map((item) => serialize(item, depth + 1)).join("\n")}\n${pad}</${node.name}>` : `${pad}<${node.name}${attrs}/>`;
}

function descendants(node, name) { return node.children.flatMap((child) => (child.name === name ? [child] : []).concat(child.children ? descendants(child, name) : [])); }
function geometry(cell) { return cell.children.find((node) => node.name === "mxGeometry"); }
function geometryValues(attrs) {
  return Object.fromEntries(["x", "y", "width", "height"].filter((key) => attrs[key] !== undefined).map((key) => [key, Number(attrs[key])]));
}
function geometryProblem(values, requireDimensions = false) {
  if (Object.values(values).some((value) => !Number.isFinite(value))) return "坐标与尺寸必须是有限数值";
  if (values.width < 0 || values.height < 0) return "宽高不能为负数";
  if (requireDimensions && !(values.width > 0 && values.height > 0)) return "普通顶点必须有正宽高（edgeLabel 除外）";
  return null;
}
function rect(cell) {
  const attrs = geometry(cell)?.attrs || {};
  const result = { x: 0, y: 0, width: 0, height: 0, ...geometryValues(attrs) };
  const problem = geometryProblem(result);
  if (problem) throw new Error(`非法几何：${cell.attrs.id}，${problem}`);
  return result;
}
function setRect(cell, values) {
  const node = geometry(cell);
  if (!node) throw new Error(`缺少 mxGeometry：${cell.attrs.id}`);
  for (const [key, value] of Object.entries(values)) node.attrs[key] = String(Math.round(value * 100) / 100);
}
function setStyle(cell, values) {
  const entries = (cell.attrs.style || "").split(";").filter(Boolean);
  cell.attrs.style = `${entries.filter((item) => !Object.keys(values).some((key) => item.startsWith(`${key}=`))).concat(Object.entries(values).map(([key, value]) => `${key}=${value}`)).join(";")};`;
}
function plainText(value) {
  return String(value || "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<br\s*\/?\s*>|<\/(?:p|div)>/gi, "\n").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => String.fromCodePoint(parseInt(code.startsWith("x") ? code.slice(1) : code, code.startsWith("x") ? 16 : 10))).replace(/&amp;/g, "&").trim();
}
function measure(text, size) { return [...text].reduce((sum, char) => sum + (char.codePointAt(0) > 255 ? size : /[MW@%]/.test(char) ? size : /[A-Z]/.test(char) ? size * 0.76 : size * 0.62), 0); }
function rowHeight(text, width, size, minimum) {
  const lines = plainText(text).split("\n");
  // 保守估算；渲染复核仍必需，机械估算不能宣称浏览器已检查。
  const count = lines.reduce((sum, line) => sum + Math.max(1, Math.ceil(measure(line, size) / Math.max(1, width - 20))), 0);
  return Math.max(minimum, Math.ceil((count * Math.ceil(size * 1.45) + 10) / 10) * 10);
}
function activitySize(values, existingWidth = 0) {
  const [code, title, role] = values.map(plainText);
  const widest = (text, size) => Math.max(0, ...text.split("\n").map((line) => measure(line, size)));
  const tokenWidth = (text, size) => Math.max(0, ...(text.match(/[!-~]+/g) || []).map((token) => measure(token, size)));
  const width = Math.ceil(Math.max(132, existingWidth, widest(code, 10) + 20, Math.min(260, widest(title, 14) + 20), Math.min(260, widest(role, 10) + 20), tokenWidth(title, 14) + 20, tokenWidth(role, 10) + 20) / 10) * 10;
  const heights = [rowHeight(code, width, 10, 20), rowHeight(title, width, 14, 40), rowHeight(role, width, 10, 20)];
  return { width, heights, height: heights.reduce((a, b) => a + b, 0) };
}
function overlaps(a, b, gap = 0) { return a.x < b.x + b.width + gap && a.x + a.width + gap > b.x && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y; }

function activityGroup(group, layers) {
  if (/(?:^|;)wlActivity=1(?:;|$)/.test(group.attrs.style || "")) return true;
  const roles = [/-code$/, /-(?:name|title)$/, /-(?:dept|role)$/];
  if (roles.every((role) => layers.some((cell) => role.test(cell.attrs.id || "")))) return true;
  return layers.some((cell) => /^[A-Z][A-Z0-9]*-A-\d{2}-[ECM](?:-\d{2})?$/.test(plainText(cell.attrs.value)));
}

function activityLayers(group, layers) {
  if (layers.length !== 3 || !activityGroup(group, layers)) return false;
  // 兼容现有三行活动；普通三节点组合不能仅凭数量被改造成编码/名称/岗位。
  if (layers.some((cell) => /(?:^|;)(?:shape=|ellipse|rhombus|group|swimlane)/.test(cell.attrs.style || ""))) return false;
  const rows = layers.map(rect);
  return rows.every((row) => row.width > 0 && row.height > 0 && row.x === rows[0].x && row.width === rows[0].width)
    && rows[0].y === 0 && rows[1].y > rows[0].y && rows[2].y > rows[1].y;
}

// parent 是每页的包含关系，不是流程连线；只检查父环，合法 source/target 回路不受影响。
// 使用迭代遍历，深层分组不会因递归检查耗尽调用栈；页间允许复用 ID。
function parentCycleCells(cells) {
  const pages = new Map();
  for (const cell of cells) {
    if (!cell.id) continue;
    const page = cell.page ?? 0;
    if (!pages.has(page)) pages.set(page, new Map());
    pages.get(page).set(cell.id, cell);
  }
  const cyclic = [];
  for (const byId of pages.values()) {
    const finished = new Set();
    for (const cell of byId.values()) {
      const chain = [];
      const positions = new Map();
      let current = cell;
      while (current && !finished.has(current.id)) {
        if (positions.has(current.id)) {
          for (const item of chain.slice(positions.get(current.id))) cyclic.push(item);
          break;
        }
        positions.set(current.id, chain.length);
        chain.push(current);
        current = byId.get(current.parent);
      }
      for (const item of chain) finished.add(item.id);
    }
  }
  return cyclic;
}

function layoutXml(xml) {
  const document = parseXml(xml);
  const pages = descendants(document, "diagram");
  if (!pages.length) throw new Error("需要包含 diagram 页的未压缩 draw.io XML");
  const changes = [];
  for (const [pageIndex, page] of pages.entries()) {
    if (!descendants(page, "mxGraphModel").length || page.children.some((item) => item.text?.trim())) throw new Error("压缩流程图请先在 draw.io 导出未压缩 XML；不静默改写");
    const cells = descendants(page, "mxCell");
    const byId = new Map();
    for (const cell of cells) {
      if (!cell.attrs.id) continue; // draw.io 允许匿名 edgeLabel，不能把它当成重复 ID。
      if (byId.has(cell.attrs.id)) throw new Error(`页内重复 ID：${cell.attrs.id}`);
      byId.set(cell.attrs.id, cell);
    }
    for (const cell of cells) for (const key of ["parent", "source", "target"]) if (cell.attrs[key] && !byId.has(cell.attrs[key])) throw new Error(`引用不存在：${cell.attrs.id}.${key}`);
    const cyclicParents = parentCycleCells(cells.map((cell) => ({ id: cell.attrs.id, parent: cell.attrs.parent })));
    if (cyclicParents.length) throw new Error(`parent 包含关系成环：${cyclicParents.map((cell) => cell.id).join("、")}`);
    for (const cell of cells) {
      const problem = geometryProblem(geometryValues(geometry(cell)?.attrs || {}), cell.attrs.vertex === "1" && !/(?:^|;)edgeLabel(?:;|$)/.test(cell.attrs.style || ""));
      if (problem) throw new Error(`非法几何：${cell.attrs.id || "匿名节点"}，${problem}`);
    }
    const children = (id) => cells.filter((item) => item.attrs.parent === id && item.attrs.vertex === "1");
    const moved = new Set();
    const markMoved = (node) => {
      if (moved.has(node.attrs.id)) return;
      moved.add(node.attrs.id);
      children(node.attrs.id).forEach(markMoved);
    };
    const groups = cells.filter((cell) => cell.attrs.vertex === "1" && /(?:^|;)group(?:;|$)/.test(cell.attrs.style || ""));
    for (const group of groups) {
      const layers = children(group.attrs.id).sort((a, b) => rect(a).y - rect(b).y);
      if (!activityLayers(group, layers)) continue;
      const before = rect(group);
      const size = activitySize(layers.map((cell) => cell.attrs.value || ""), before.width);
      setRect(group, { width: size.width, height: size.height });
      let y = 0;
      for (const [index, layer] of layers.entries()) {
        setRect(layer, { x: 0, y, width: size.width, height: size.heights[index] });
        // 内嵌旧 HTML font-size 同步，避免覆盖新样式。
        const fontSize = index === 1 ? 14 : 10;
        layer.attrs.value = (layer.attrs.value || "").replace(/font-size:\s*\d+(?:\.\d+)?px/gi, `font-size: ${fontSize}px`);
        setStyle(layer, { fontSize, whiteSpace: "wrap", overflow: "visible", spacing: 5 });
        y += size.heights[index];
      }
      if (before.width !== size.width || before.height !== size.height) { markMoved(group); changes.push({ page: pageIndex, id: group.attrs.id, kind: "activity-size", before, after: rect(group) }); }
    }
    const lanes = cells.filter((cell) => /(?:^|;)swimlane(?:;|$)/.test(cell.attrs.style || "") && children(cell.attrs.id).every((item) => !/swimlane/.test(item.attrs.style || "")));
    for (const lane of lanes) {
      const nodes = children(lane.attrs.id).sort((a, b) => rect(a).y - rect(b).y || rect(a).x - rect(b).x);
      const placed = [];
      for (const node of nodes) {
        const before = rect(node); const next = { ...before, x: Math.max(20, before.x), y: Math.max(45, before.y) };
        for (;;) {
          const hits = placed.filter((item) => overlaps(next, item, 24));
          if (!hits.length) break;
          next.y = Math.max(...hits.map((item) => item.y + item.height + 24));
        }
        setRect(node, { x: next.x, y: next.y }); placed.push(next);
        if (before.x !== next.x || before.y !== next.y) { markMoved(node); changes.push({ page: pageIndex, id: node.attrs.id, kind: "node-position", before, after: next }); }
      }
      const before = rect(lane);
      setRect(lane, { width: Math.max(200, before.width, ...placed.map((item) => item.x + item.width + 24)), height: Math.max(before.height, ...placed.map((item) => item.y + item.height + 30)) });
    }
    // 同一外层泳道的列宽求和、高度取最大值；后续列重新定位。
    for (const outer of cells.filter((cell) => /swimlane/.test(cell.attrs.style || ""))) {
      const columns = children(outer.attrs.id).filter((cell) => /swimlane/.test(cell.attrs.style || ""));
      if (!columns.length) continue;
      let x = 0; const y = Math.max(30, ...columns.map((cell) => rect(cell).y));
      const height = Math.max(...columns.map((cell) => rect(cell).height));
      for (const column of columns) {
        const before = rect(column);
        if (before.x !== x || before.y !== y) children(column.attrs.id).forEach(markMoved);
        setRect(column, { x, y, height }); x += rect(column).width;
      }
      setRect(outer, { width: x, height: y + height });
    }
    for (const edge of cells.filter((cell) => cell.attrs.edge === "1" && (moved.has(cell.attrs.source) || moved.has(cell.attrs.target)))) {
      const geo = geometry(edge);
      if (geo) geo.children = geo.children.filter((node) => !(node.name === "Array" && node.attrs.as === "points"));
      changes.push({ page: pageIndex, id: edge.attrs.id, kind: "reroute-affected-edge" });
    }
    const bounds = cells.filter((cell) => cell.attrs.vertex === "1" && cell.attrs.parent === "1").map(rect);
    for (const model of descendants(page, "mxGraphModel")) {
      model.attrs.pageWidth = String(Math.ceil(Math.max(827, ...bounds.map((item) => item.x + item.width + 40))));
      model.attrs.pageHeight = String(Math.ceil(Math.max(1169, ...bounds.map((item) => item.y + item.height + 40))));
    }
  }
  const output = serialize(document);
  parseXml(output);
  return { xml: output, changes, renderStatus: "unverified", semanticStatus: "unverified" };
}

function insideRoot(root, requested) {
  const full = path.resolve(root, requested);
  const relative = path.relative(root, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("流程图路径越出 projectRoot");
  let ancestor = full;
  while (!fs.existsSync(ancestor)) ancestor = path.dirname(ancestor);
  const resolved = path.relative(root, fs.realpathSync(ancestor));
  if (resolved.startsWith("..") || path.isAbsolute(resolved)) throw new Error("流程图路径经符号链接越出 projectRoot");
  return full;
}
function layoutFile(root, input, output, dryRun = false) {
  root = fs.realpathSync(root);
  const source = insideRoot(root, input);
  const target = insideRoot(root, output || input.replace(/\.drawio$/i, "") + ".layout.drawio");
  if (target === source || fs.existsSync(target)) throw new Error("输出必须是新文件；保留原图，复核后再替换");
  const result = layoutXml(fs.readFileSync(source, "utf8"));
  if (!dryRun) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const temporary = `${target}.${crypto.randomUUID()}.tmp`;
    try { fs.writeFileSync(temporary, result.xml, { flag: "wx" }); fs.linkSync(temporary, target); }
    finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  }
  return { source: path.relative(root, source), output: path.relative(root, target), changes: result.changes, dryRun, renderStatus: result.renderStatus, semanticStatus: result.semanticStatus };
}
module.exports = { parseXml, serialize, descendants, geometryValues, geometryProblem, plainText, measure, rowHeight, activitySize, activityGroup, activityLayers, parentCycleCells, layoutXml, layoutFile };
