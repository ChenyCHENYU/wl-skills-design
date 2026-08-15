"use strict";

const fs = require("node:fs");
const path = require("node:path");

function readText(file) {
  return fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
}

function result(domain, subject, checks) {
  const pass = checks.filter((item) => item.status === "pass").length;
  const fail = checks.filter((item) => item.status === "fail").length;
  const skip = checks.filter((item) => item.status === "skip").length;
  return { domain, subject, ok: fail === 0, checks, summary: { pass, fail, skip, total: checks.length } };
}

function check(rule, status, evidence, message) {
  return { rule, mechanical: true, status, evidence, message };
}

function pass(rule, evidence) {
  return check(rule, "pass", evidence, "");
}

function fail(rule, evidence, message) {
  return check(rule, "fail", evidence, message);
}

function skip(rule, message) {
  return check(rule, "skip", "", message);
}

/* ------------------------------ Markdown 解析 ------------------------------ */

function parseMarkdown(file) {
  const lines = readText(file).split(/\r?\n/);
  const headings = [];
  for (const [index, line] of lines.entries()) {
    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (match) headings.push({ level: match[1].length, text: match[2].trim(), line: index + 1 });
  }
  return { file, lines, headings };
}

function headingTextsContain(headings, keyword) {
  return headings.some((item) => item.text.includes(keyword));
}

function tableRows(lines) {
  const tables = [];
  let current = null;
  for (const [index, line] of lines.entries()) {
    if (/^\s*\|/.test(line)) {
      const cells = line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((item) => item.trim());
      if (/^[\s|:-]+$/.test(line)) continue;
      if (!current) current = { startLine: index + 1, rows: [] };
      current.rows.push({ line: index + 1, cells });
    } else if (current) {
      tables.push(current);
      current = null;
    }
  }
  if (current) tables.push(current);
  return tables;
}

function tableColumns(table) {
  return table.rows[0]?.cells.length || 0;
}

/* ------------------------------ spec 验证 ------------------------------ */

const ACTIVITY_CODE = /([A-Z][A-Z0-9]{1,5})-A-(\d{2})-([ECM])-(\d{2})/g;
const FLOW_CODE = /\b([A-Z][A-Z0-9]{1,5})-A-(\d{2})\b/g;

function collectCodes(text) {
  const activities = new Map();
  const flows = new Set();
  let match;
  ACTIVITY_CODE.lastIndex = 0;
  while ((match = ACTIVITY_CODE.exec(text))) {
    flows.add(`${match[1]}-A-${match[2]}`);
    const key = `${match[1]}-A-${match[2]}-${match[3]}`;
    if (!activities.has(key)) activities.set(key, new Set());
    activities.get(key).add(Number(match[4]));
  }
  return { activities, flows };
}

function verifySpecDir(dir) {
  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.md$/.test(entry.name))
    .map((entry) => path.join(dir, entry.name))
    .sort();
  const docs = files.map(parseMarkdown);
  const checks = [];
  const rel = (item) => `${path.basename(dir)}/${path.basename(item.file)}:${item.line ?? 1}`;
  const scopeOf = (doc, heading) => {
    const next = doc.headings.find((item) => item.line > heading.line && item.level <= heading.level);
    return doc.lines.slice(heading.line, next ? next.line - 1 : undefined).join("\n");
  };

  const ch13 = docs.find((item) => /ch1[-_]3\.md$/.test(item.file));
  const submodules = docs.filter((item) => /^4\.\d+.*\.md$/.test(path.basename(item.file)) && !/data-report/.test(path.basename(item.file)));
  const dataReport = docs.find((item) => /data-report/.test(path.basename(item.file)));

  if (!ch13) {
    checks.push(fail("S01", `${path.basename(dir)}/`, "缺少 ch1-3.md"));
  } else {
    const has = ["系统目标", "组织", "总体设计"].filter((kw) => headingTextsContain(ch13.headings, kw));
    if (has.length === 3) checks.push(pass("S01", rel({ file: ch13.file, line: 1 })));
    else checks.push(fail("S01", rel({ file: ch13.file, line: 1 }), `ch1-3 缺少章节：${["系统目标", "组织", "总体设计"].filter((kw) => !has.includes(kw)).join("、")}`));
  }

  if (ch13) {
    const goalHeading = ch13.headings.find((item) => item.text.includes("系统目标") && item.level <= 3);
    if (!goalHeading) {
      checks.push(skip("S02", "未找到系统目标章节"));
    } else {
      const scope = scopeOf(ch13, goalHeading);
      const goalLines = scope
        .split(/\r?\n/)
        .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+[.、]\s+/, "").trim())
        .filter((line) => line && !/^【此处插入/.test(line));
      const clean = goalLines.map((item) => item.replace(/[*`【】]/g, ""));
      const badCount = clean.length < 3 || clean.length > 5;
      const badLength = clean.filter((item) => item.length < 20 || item.length > 60);
      if (badCount || badLength.length) {
        const reasons = [];
        if (badCount) reasons.push(`目标条数 ${clean.length}（要求 3～5）`);
        if (badLength.length) reasons.push(`${badLength.length} 条不在 20～60 字`);
        checks.push(fail("S02", `${path.basename(ch13.file)}:${goalHeading.line}`, reasons.join("；")));
      } else {
        checks.push(pass("S02", `${path.basename(ch13.file)}:${goalHeading.line}`));
      }
    }
  }

  if (!submodules.length) {
    checks.push(fail("S03", `${path.basename(dir)}/`, "未找到 4.x-*.md 子模块文件"));
  }
  const SUBMODULE_SECTIONS = ["系统流程清单", "系统流程说明", "画面对照", "功能设计", "内部接口", "权限"];
  for (const doc of submodules) {
    const missing = SUBMODULE_SECTIONS.filter((kw) => !headingTextsContain(doc.headings, kw));
    if (missing.length) checks.push(fail("S03", rel({ file: doc.file, line: 1 }), `${path.basename(doc.file)} 缺小节：${missing.join("、")}`));
  }
  if (submodules.length && checks.filter((item) => item.rule === "S03" && item.status === "fail").length === 0) {
    checks.push(pass("S03", `${path.basename(dir)}/`));
  }

  if (!dataReport) {
    checks.push(fail("S04", `${path.basename(dir)}/`, "缺少 4.N-data-report.md"));
  } else {
    const missing = ["数据需求", "报表"].filter((kw) => !headingTextsContain(dataReport.headings, kw));
    if (missing.length) checks.push(fail("S04", rel({ file: dataReport.file, line: 1 }), `缺少章节：${missing.join("、")}`));
    else checks.push(pass("S04", rel({ file: dataReport.file, line: 1 })));
  }

  let s05Fail = 0;
  let s05Count = 0;
  for (const doc of docs) {
    for (const [index, line] of doc.lines.entries()) {
      if (line.includes("此处插入")) {
        s05Count += 1;
        if (!/【此处插入[^】]*】/.test(line)) {
          s05Fail += 1;
          if (s05Fail <= 3) checks.push(fail("S05", `${path.basename(doc.file)}:${index + 1}`, "图片占位必须使用【此处插入 …】完整格式"));
        }
      }
    }
  }
  checks.push(s05Fail ? fail("S05", "", `${s05Fail} 处占位格式非法`) : pass("S05", `共 ${s05Count} 处占位`));

  const allText = docs.map((doc) => doc.lines.join("\n")).join("\n");
  const { activities, flows } = collectCodes(allText);
  const flowList = new Set();
  FLOW_CODE.lastIndex = 0;
  for (const doc of docs) {
    for (const table of tableRows(doc.lines)) {
      const header = table.rows[0]?.cells.join("|") || "";
      if (/流程清单/.test(header) || header.includes("流程编码")) {
        const text = table.rows.slice(1).map((row) => row.cells.join("|")).join("\n");
        let m;
        FLOW_CODE.lastIndex = 0;
        while ((m = FLOW_CODE.exec(text))) flowList.add(`${m[1]}-A-${m[2]}`);
      }
    }
  }

  const badFlows = [...flows].filter((code) => !/^[A-Z][A-Z0-9]{1,5}-A-\d{2}$/.test(code));
  checks.push(badFlows.length ? fail("C01", "", `流程编码格式非法：${badFlows.slice(0, 3).join("、")}`) : pass("C01", `共 ${flows.size} 个流程编码`));

  const continuity = [];
  for (const [prefix, seq] of activities.entries()) {
    const sorted = [...seq].sort((a, b) => a - b);
    for (let index = 0; index < sorted.length; index += 1) {
      if (sorted[index] !== index + 1) {
        continuity.push(`${prefix}-${index + 1}`);
        break;
      }
    }
  }
  checks.push(continuity.length ? fail("C02", "", `活动编码不连续：${continuity.slice(0, 3).join("、")}`) : pass("C02", `${activities.size} 组活动编码连续`));

  const functionCodes = [];
  for (const doc of docs) {
    for (const heading of doc.headings) {
      const match = heading.text.match(/【([A-Z0-9]+)】/);
      if (match) functionCodes.push({ code: match[1], file: doc.file, line: heading.line });
    }
  }
  const badFunctions = functionCodes.filter((item) => !/^[A-Z]{2,6}([A-Z]{2,4})?\d{3}$/.test(item.code));
  checks.push(badFunctions.length ? fail("C03", `${path.basename(badFunctions[0].file)}:${badFunctions[0].line}`, `功能编码格式非法：${badFunctions.map((item) => item.code).slice(0, 3).join("、")}`) : pass("C03", `共 ${functionCodes.length} 个功能编码`));

  const allCodes = [...flows, ...[...activities.keys()].map((key) => key.replace(/-([ECM])$/, (m) => m)), ...functionCodes.map((item) => item.code)];
  const dup = [...new Set(allCodes.filter((code, index) => allCodes.indexOf(code) !== index))];
  checks.push(dup.length ? fail("C04", "", `编码重复：${dup.slice(0, 3).join("、")}`) : pass("C04", "无重复编码"));

  const checkTableShape = (rule, keyword, columns, extraKeyword) => {
    let seen = 0;
    let bad = null;
    for (const doc of docs) {
      for (const table of tableRows(doc.lines)) {
        const header = table.rows[0]?.cells.join("|") || "";
        if (header.includes(keyword) && (!extraKeyword || header.includes(extraKeyword))) {
          seen += 1;
          if (tableColumns(table) !== columns && !bad) {
            bad = { file: doc.file, line: table.startLine, actual: tableColumns(table) };
          }
        }
      }
    }
    if (!seen) return skip(rule, `未找到含「${keyword}」的表`);
    if (bad) return fail(rule, `${path.basename(bad.file)}:${bad.line}`, `列数为 ${bad.actual}（要求 ${columns}）`);
    return pass(rule, `${seen} 张表列数正确`);
  };
  checks.push(checkTableShape("D01", "角色名称", 5));
  checks.push(checkTableShape("D03", "术语", 4));
  checks.push(checkTableShape("F02", "活动编码", 7, "执行角色"));
  checks.push(checkTableShape("I04", "处理逻辑（Process）", 5));

  let i05Bad = 0;
  for (const doc of docs) {
    for (const table of tableRows(doc.lines)) {
      const header = table.rows[0]?.cells.join("|") || "";
      if (!header.includes("处理逻辑（Process）")) continue;
      for (const row of table.rows.slice(1)) {
        if (row.cells.filter((cell) => cell === "").length) {
          i05Bad += 1;
          if (i05Bad <= 3) checks.push(fail("I05", `${path.basename(doc.file)}:${row.line}`, "IPO 行存在空单元格（无输入应填 /）"));
        }
      }
    }
  }
  checks.push(i05Bad ? fail("I05", "", `${i05Bad} 行含空单元格`) : pass("I05", "IPO 无空单元格"));

  let i01Bad = null;
  let i01Seen = 0;
  for (const doc of docs) {
    for (const heading of doc.headings) {
      if (!/【[A-Z0-9]+】/.test(heading.text) || heading.level > 5) continue;
      i01Seen += 1;
      const scope = scopeOf(doc, heading);
      const hasScreen = /画面逻辑|画面交互/.test(scope);
      const hasIpo = scope.includes("处理逻辑（IPO）");
      if (!hasScreen || !hasIpo) {
        i01Bad = { file: doc.file, line: heading.line, text: heading.text };
        break;
      }
    }
  }
  if (!i01Seen) checks.push(skip("I01", "未找到功能设计小节"));
  else checks.push(i01Bad ? fail("I01", `${path.basename(i01Bad.file)}:${i01Bad.line}`, `${i01Bad.text} 缺画面逻辑或 IPO 小节`) : pass("I01", `${i01Seen} 个功能结构完整`));

  for (const doc of submodules) {
    const flowSection = doc.headings.find((item) => item.text.includes("系统流程说明"));
    if (!flowSection) {
      checks.push(fail("F01", rel({ file: doc.file, line: 1 }), `${path.basename(doc.file)} 缺系统流程说明小节`));
      continue;
    }
    const scope = doc.lines.slice(flowSection.line).join("\n");
    const designHeading = doc.headings.find((item) => item.text.includes("画面对照"));
    const bounded = designHeading ? doc.lines.slice(flowSection.line, designHeading.line - 1).join("\n") : scope;
    const missing = [];
    if (!/【此处插入|流程图|drawio/.test(bounded)) missing.push("流程图占位");
    if (!bounded.includes("活动说明") && !/活动编码/.test(bounded)) missing.push("活动说明");
    if (missing.length) checks.push(fail("F01", `${path.basename(doc.file)}:${flowSection.line}`, missing.join("、")));
  }
  if (submodules.length && !checks.some((item) => item.rule === "F01" && item.status === "fail")) {
    checks.push(pass("F01", "流程说明结构完整"));
  }

  const flowListCodes = [...flowList];
  const orphanActivities = [...flows].filter((code) => flowListCodes.length && !flowList.has(code));
  const uncoveredFlows = flowListCodes.filter((code) => !flows.has(code));
  if (!flowListCodes.length) checks.push(skip("X01", "未找到流程清单表"));
  else if (orphanActivities.length || uncoveredFlows.length) {
    const parts = [];
    if (orphanActivities.length) parts.push(`活动引用了未登记流程：${orphanActivities.slice(0, 3).join("、")}`);
    if (uncoveredFlows.length) parts.push(`流程清单无活动：${uncoveredFlows.slice(0, 3).join("、")}`);
    checks.push(fail("X01", "", parts.join("；")));
  } else checks.push(pass("X01", `流程清单与活动双向一致（${flowListCodes.length} 条流程）`));

  let f03Fail = null;
  let x02Fail = null;
  let x03Fail = null;
  for (const doc of submodules) {
    const mapHeading = doc.headings.find((item) => item.text.includes("画面对照"));
    const designHeading = doc.headings.find((item) => item.text.includes("功能设计"));
    if (!mapHeading || !designHeading) continue;
    const mapScope = doc.lines.slice(mapHeading.line - 1, designHeading.line - 1).join("\n");
    const fileText = doc.lines.join("\n");
    const fileActivityCodes = new Set();
    ACTIVITY_CODE.lastIndex = 0;
    let m;
    while ((m = ACTIVITY_CODE.exec(fileText))) fileActivityCodes.add(`${m[1]}-A-${m[2]}-${m[3]}-${m[4]}`);
    const mapCodes = new Set();
    ACTIVITY_CODE.lastIndex = 0;
    while ((m = ACTIVITY_CODE.exec(mapScope))) mapCodes.add(`${m[1]}-A-${m[2]}-${m[3]}-${m[4]}`);
    for (const code of fileActivityCodes) {
      if (!mapCodes.has(code)) f03Fail = f03Fail || { file: doc.file, key: code };
    }
    for (const code of mapCodes) {
      if (!fileActivityCodes.has(code)) x02Fail = x02Fail || { file: doc.file, code };
    }
    const fnInMap = [...mapScope.matchAll(/【([A-Z0-9]+)】|\b([A-Z]{2,6}(?:[A-Z]{2,4})?\d{3})\b/g)].map((mm) => mm[1] || mm[2]);
    for (const heading of doc.headings) {
      const mm = heading.text.match(/【([A-Z0-9]+)】/);
      if (mm && !fnInMap.includes(mm[1])) x03Fail = x03Fail || { file: doc.file, code: mm[1] };
    }
  }
  checks.push(f03Fail ? fail("F03", `${path.basename(f03Fail.file)}:1`, `活动 ${f03Fail.key} 未出现在画面对照表`) : pass("F03", "对照表覆盖全部活动"));
  checks.push(x02Fail ? fail("X02", `${path.basename(x02Fail.file)}:1`, `对照表活动 ${x02Fail.code} 无活动说明`) : pass("X02", "对照表与活动说明双向一致"));
  checks.push(x03Fail ? fail("X03", `${path.basename(x03Fail.file)}:1`, `功能 ${x03Fail.code} 未出现在对照表`) : pass("X03", "功能与对照表一致"));

  return result("spec", dir, checks);
}

/* ------------------------------ flowchart 验证 ------------------------------ */

function decodeValue(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function parseDrawio(file) {
  const content = readText(file);
  const pages = [...content.matchAll(/<diagram\b([^>]*)>([\s\S]*?)<\/diagram>/g)].map((match, index) => ({
    index,
    name: (match[1].match(/name="([^"]*)"/) || [])[1] || `第${index + 1}页`,
    body: match[2],
  }));
  const cells = [];
  const cellPattern = /<mxCell\b([^>]*?)(?:\/>|>([\s\S]*?)<\/mxCell>)/g;
  for (const page of pages) {
    let match;
    cellPattern.lastIndex = 0;
    while ((match = cellPattern.exec(page.body))) {
      const attrs = match[1];
      const inner = match[2] || "";
      const attr = (name) => {
        const am = attrs.match(new RegExp(`\\b${name}="([^"]*)"`));
        return am ? am[1] : undefined;
      };
      const geometry = inner.match(/<mxGeometry\b([^>]*)\/?>(?:<\/mxGeometry>)?/);
      const geo = {};
      if (geometry) {
        for (const key of ["x", "y", "width", "height"]) {
          const gm = geometry[1].match(new RegExp(`\\b${key}="([\\d.-]+)"`));
          if (gm) geo[key] = Number(gm[1]);
        }
      }
      cells.push({
        page: page.index,
        id: attr("id"),
        value: decodeValue(attr("value") || ""),
        rawValue: attr("value") || "",
        style: attr("style") || "",
        parent: attr("parent"),
        source: attr("source"),
        target: attr("target"),
        vertex: /\bvertex="1"/.test(attrs),
        edge: /\bedge="1"/.test(attrs),
        geometry: geo,
      });
    }
  }
  return { content, pages, cells };
}

function verifyFlowchartFile(file) {
  const { pages, cells } = parseDrawio(file);
  const checks = [];
  const name = path.basename(file);
  const pageNames = pages.map((page) => page.name);

  checks.push(
    /mxfile|mxGraphModel/.test(readText(file)) ? pass("结构", name) : fail("结构", name, "缺少 mxfile/mxGraphModel")
  );

  const legendOk = pages.length >= 2 && (pageNames[0].includes("标准") || pageNames[0].includes("图例") || pages[0].body.includes("流程标准定义"));
  checks.push(legendOk ? pass("F01", `第 1 页：${pageNames[0]}`) : fail("F01", name, pages.length < 2 ? "少于 2 页（Tab1 应为图例页）" : "第 1 页不是流程标准定义图例页"));

  const flowPages = pages.slice(1);
  if (!flowPages.length) {
    for (const rule of ["F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12", "F13", "F14", "FC-04", "FC-05"]) {
      checks.push(skip(rule, "没有实际流程页"));
    }
    return result("flowchart", file, checks);
  }
  const flowCells = cells.filter((cell) => cell.page >= 1);
  const pageBody = flowPages.map((page) => page.body).join("\n");

  checks.push(pageBody.includes("#dae8fc") ? pass("F02", "外层泳道 #dae8fc") : fail("F02", name, "未找到外层蓝色泳道 #dae8fc"));
  checks.push(pageBody.includes("#f5f5f5") ? pass("F03", "子泳道 #f5f5f5") : fail("F03", name, "未找到灰色子泳道 #f5f5f5"));

  const byId = new Map(flowCells.map((cell) => [cell.id, cell]));
  const groups = flowCells.filter((cell) => cell.style.includes("group") && cell.vertex);
  const childrenOf = new Map();
  for (const cell of flowCells) {
    if (!cell.parent) continue;
    if (!childrenOf.has(cell.parent)) childrenOf.set(cell.parent, []);
    childrenOf.get(cell.parent).push(cell);
  }
  const badGroups = groups.filter((group) => (childrenOf.get(group.id) || []).filter((child) => child.vertex).length !== 3);
  checks.push(groups.length && !badGroups.length ? pass("F04", `${groups.length} 个 GROUP 均为 3 层`) : fail("F04", name, groups.length ? `${badGroups.length} 个 GROUP 子节点数 ≠ 3` : "未找到 GROUP 节点"));

  const badSize = groups.filter((group) => Math.abs((group.geometry.width || 0) - 76.82) > 0.05 || (group.geometry.height || 0) !== 54);
  checks.push(groups.length && !badSize.length ? pass("F05", "GROUP 76.82×54") : fail("F05", name, `${badSize.length} 个 GROUP 尺寸不符 76.82×54`));

  const layerCells = { code: [], name: [], dept: [] };
  for (const group of groups) {
    for (const child of (childrenOf.get(group.id) || []).filter((item) => item.vertex)) {
      const y = child.geometry.y ?? 0;
      if (y === 0) layerCells.code.push(child);
      else if (y === 12) layerCells.name.push(child);
      else if (y === 42) layerCells.dept.push(child);
    }
  }
  const badCode = layerCells.code.filter((cell) => !/font-size:\s*10px|fontSize=10/.test(`${cell.style} ${cell.rawValue}`) || cell.style.includes("fillColor"));
  checks.push(layerCells.code.length && !badCode.length ? pass("F06", `${layerCells.code.length} 个编码层 10px 白底`) : fail("F06", name, `${badCode.length} 个编码层样式不符（10px、无 fillColor）`));
  const badName = layerCells.name.filter((cell) => !/font-size:\s*14px|fontSize=14/.test(`${cell.style} ${cell.rawValue}`));
  checks.push(layerCells.name.length && !badName.length ? pass("F07", `${layerCells.name.length} 个名称层 14px`) : fail("F07", name, `${badName.length} 个名称层缺少 14px 字体`));
  const badDept = layerCells.dept.filter((cell) => !cell.style.includes("#eeeeee"));
  checks.push(layerCells.dept.length && !badDept.length ? pass("F08", `${layerCells.dept.length} 个岗位层 #eeeeee`) : fail("F08", name, `${badDept.length} 个岗位层缺 #eeeeee`));

  const terminal = flowCells.filter((cell) => cell.style.includes("#76608a"));
  checks.push(terminal.length >= 2 ? pass("F09", `${terminal.length} 个起止节点`) : fail("F09", name, `紫色起止节点 #76608a 少于 2 个（实际 ${terminal.length}）`));

  const rhombus = flowCells.filter((cell) => cell.style.includes("rhombus"));
  const edges = flowCells.filter((cell) => cell.edge);
  const unlabeledDiamond = rhombus.filter((diamond) => !edges.some((edge) => edge.source === diamond.id && edge.value));
  checks.push(!rhombus.length || !unlabeledDiamond.length ? pass("F10", rhombus.length ? `${rhombus.length} 个判定均有分支标签` : "无判定节点") : fail("F10", name, `${unlabeledDiamond.length} 个判定缺少分支标签`));

  const badEdges = edges.filter((edge) => !edge.style.includes("orthogonalEdgeStyle"));
  checks.push(edges.length && !badEdges.length ? pass("F11", `${edges.length} 条连线直角折线`) : fail("F11", name, `${badEdges.length} 条连线未使用 orthogonalEdgeStyle`));

  const dupIds = flowCells.filter((cell) => cell.id && flowCells.filter((other) => other.id === cell.id).length > 1);
  checks.push(!dupIds.length ? pass("引用", "节点 ID 唯一") : fail("引用", name, `重复节点 ID：${dupIds[0].id}`));
  const brokenRefs = flowCells.filter((cell) => [cell.parent, cell.source, cell.target].some((ref) => ref && ref !== "1" && !byId.has(ref)));
  checks.push(!brokenRefs.length ? pass("引用", "parent/source/target 引用完整") : fail("引用", name, `引用不存在节点：${brokenRefs[0].parent || brokenRefs[0].source || brokenRefs[0].target}`));

  const laneOf = (cell) => {
    let current = cell.parent && byId.get(cell.parent);
    let guard = 0;
    while (current && guard < 20) {
      if (current.style.includes("swimlane")) return current.id;
      current = current.parent && byId.get(current.parent);
      guard += 1;
    }
    return "1";
  };
  const rects = flowCells.filter((cell) => cell.vertex && cell.geometry.width && byId.has(cell.parent));
  let overlaps = 0;
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      const a = rects[i];
      const b = rects[j];
      if (laneOf(a) !== laneOf(b)) continue;
      let pa = a.parent;
      while (pa && pa !== "1") {
        if (pa === b.id) break;
        pa = byId.get(pa)?.parent;
      }
      let pb = b.parent;
      while (pb && pb !== "1") {
        if (pb === a.id) break;
        pb = byId.get(pb)?.parent;
      }
      if (pa === b.id || pb === a.id) continue;
      const ra = a.geometry;
      const rb = b.geometry;
      const overlap = ra.x < rb.x + rb.width - 2 && ra.x + ra.width > rb.x + 2 && ra.y < rb.y + rb.height - 2 && ra.y + ra.height > rb.y + 2;
      if (overlap) overlaps += 1;
    }
  }
  checks.push(!overlaps ? pass("F12", "无几何重叠") : fail("F12", name, `${overlaps} 对节点几何重叠`));

  const offlineBad = flowCells.filter((cell) => cell.value.includes("线下") && cell.vertex && !cell.style.includes("dashed=1"));
  checks.push(!offlineBad.length ? pass("F13", "线下节点均为虚线") : fail("F13", name, `${offlineBad.length} 个线下节点未用 dashed=1`));

  const activityCodes = [];
  const badFormat = [];
  let placeholders = 0;
  const isPlaceholder = (value) => /^(XXXX|TBD|\[|待)/i.test(value) || /TBD/i.test(value);
  for (const cell of layerCells.code) {
    if (!cell.value) continue;
    if (isPlaceholder(cell.value)) {
      placeholders += 1;
      continue;
    }
    if (/^[A-Z][A-Z0-9]*-A-\d{2}-[ECM]-\d{2}$/.test(cell.value)) activityCodes.push(cell.value);
    else badFormat.push(cell.value);
  }
  checks.push(!badFormat.length ? pass("F14", `${activityCodes.length} 个活动编码格式正确${placeholders ? `，${placeholders} 个占位待回填` : ""}`) : fail("F14", name, `编码格式非法：${badFormat.slice(0, 3).join("、")}`));
  checks.push(skip("F15", "模块色标匹配需语义判断"));

  const prefixes = new Set(activityCodes.map((code) => code.replace(/-[ECM]-\d{2}$/, "")));
  const badPrefix = [...prefixes].filter((prefix) => !/^[A-Z][A-Z0-9]{1,5}-A-\d{2}$/.test(prefix));
  checks.push(!prefixes.size || !badPrefix.length ? pass("FC-04", [...prefixes].slice(0, 3).join("、")) : fail("FC-04", name, `流程编码格式非法：${badPrefix.join("、")}`));

  const gaps = [];
  for (const prefix of prefixes) {
    const seq = new Set(activityCodes.filter((code) => code.startsWith(`${prefix}-`)).map((code) => Number(code.slice(-2))));
    const sorted = [...seq].sort((a, b) => a - b);
    for (let index = 0; index < sorted.length; index += 1) {
      if (sorted[index] !== index + 1) {
        gaps.push(`${prefix}…${index + 1}`);
        break;
      }
    }
  }
  checks.push(!gaps.length ? pass("FC-05", "活动编码连续") : fail("FC-05", name, `活动编码跳号：${gaps.slice(0, 3).join("、")}`));

  checks.push(skip("FC-01", "需与 spec 活动说明表联查，当前版本未实现"));
  checks.push(skip("FC-02", "需与 spec 岗位定义表联查，当前版本未实现"));
  checks.push(skip("FC-03", "需与 spec 画面对照表联查，当前版本未实现"));

  return result("flowchart", file, checks);
}

module.exports = { verifySpecDir, verifyFlowchartFile, collectCodes, parseDrawio };
