#!/usr/bin/env node

"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const FILES_DIR = path.join(ROOT, "files");
const PACKAGE = require(path.join(ROOT, "package.json"));
const { validateDesignModelFile } = require(path.join(ROOT, "lib", "design-model.js"));
const { verifySpecDir, verifyFlowchartFile, verifyDbDir, verifyApiDir } = require(path.join(ROOT, "lib", "verify.js"));
const shared = require(path.join(ROOT, "lib", "shared-assets.js"));
const OWNER = "wl-skills-design";
const EDITORS_FILE = path.join(
  FILES_DIR,
  ".github",
  "skills",
  "_compat",
  "editors.json"
);
const STATE_DIR = ".wl-skills-design";
const STATE_FILE = "state.json";
const EXIT_CONFLICT = 2;
const MAX_BACKUPS = 5;
const LOCK_STALE_MS = 5 * 60 * 1000;

function normalizeRel(value) {
  return value.split(path.sep).join("/");
}

function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function hashFile(file) {
  return hashBuffer(fs.readFileSync(file));
}

function getAllFiles(dir, base = dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? getAllFiles(full, base) : [full];
    });
}

function parseArgs(argv) {
  const result = {
    command: "init",
    dryRun: false,
    force: false,
    json: false,
    editor: null,
    target: null,
    model: null,
    domain: null,
    files: [],
    list: false,
    id: null,
    purge: false,
    help: false,
    version: false,
  };
  const commands = new Set(["init", "update", "status", "doctor", "validate-model", "verify", "restore", "uninstall"]);
  let commandSeen = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (commands.has(arg)) {
      if (commandSeen) throw new Error(`只能指定一个命令：${arg}`);
      result.command = arg;
      commandSeen = true;
    } else if (arg === "--dry-run") result.dryRun = true;
    else if (arg === "--force") result.force = true;
    else if (arg === "--json") result.json = true;
    else if (arg === "--list") result.list = true;
    else if (arg === "--purge") result.purge = true;
    else if (arg === "--help" || arg === "-h") result.help = true;
    else if (arg === "--version" || arg === "-v") result.version = true;
    else if (arg === "--file") {
      const value = argv[++i];
      if (!value || value.startsWith("--")) throw new Error(`${arg} 缺少参数`);
      result.files.push(value);
    } else if (arg === "--editor" || arg === "--target" || arg === "--model" || arg === "--id") {
      const value = argv[++i];
      if (!value || value.startsWith("--")) throw new Error(`${arg} 缺少参数`);
      result[arg.slice(2)] = value;
    } else if (arg.startsWith("--editor=")) result.editor = arg.slice(9);
    else if (arg.startsWith("--target=")) result.target = arg.slice(9);
    else if (arg.startsWith("--model=")) result.model = arg.slice(8);
    else if (arg.startsWith("--id=")) result.id = arg.slice(5);
    else if (arg.startsWith("--file=")) result.files.push(arg.slice(7));
    else if (arg.startsWith("-")) throw new Error(`未知选项：${arg}`);
    else if (result.command === "verify" && !result.domain && /^(spec|flowchart|db|api)$/.test(arg)) result.domain = arg;
    else throw new Error(`未知命令：${arg}`);
  }
  return result;
}

function helpText(editors) {
  const ids = editors.map((item) => item.id).join(" | ");
  return `
wl-skills-design v${PACKAGE.version}

用法：
  wl-skills-design [init|update|status|doctor|validate-model|restore|uninstall] [选项]

命令：
  init       安装技能包；默认使用 agents profile
  update     安全升级；本地改动默认视为冲突
  status     查看受管文件状态
  doctor     检查安装状态与 Skill 清单
  validate-model  只读校验 docs/design-model.json 的结构、稳定 ID 与引用完整性
  verify     机械执行设计产物的验证清单子集：verify spec | flowchart | db | api
  restore    恢复最近一次安装、升级或卸载前状态
  uninstall  卸载受管文件；不会静默删除本地改动

选项：
  --editor <id[,id]>  选择适配器：${ids} | all
  --target <dir>      目标项目目录，默认当前目录
  --model <file>      design-model 路径，默认 docs/design-model.json
  --file <path>       verify：指定待验证文件，可重复；默认扫描 docs/
  --list              restore：列出可用备份
  --id <backupId>     restore：恢复指定备份，默认最近一次
  --purge             uninstall：清理本包快照；保留残留引用和外来文件
  --dry-run           只输出计划，不写文件
  --force             仅更新已有归属的本包内容并备份；卸载仍保留本地改动
  --json              输出机器可读 JSON
  --version, -v       显示版本
  --help, -h          显示帮助

示例：
  npx @agile-team/wl-skills-design init --editor agents
  npx @agile-team/wl-skills-design init --editor cursor --target ./my-project
  npx @agile-team/wl-skills-design update --dry-run
  npx @agile-team/wl-skills-design validate-model --model docs/design-model.json --json
  npx @agile-team/wl-skills-design verify flowchart --file docs/flowchart/REQ-A-01-示例.drawio
  npx @agile-team/wl-skills-design verify spec --target ./my-project
`;
}

function runValidateModel(options, target) {
  const requested = options.model || path.join("docs", "design-model.json");
  const modelFile = path.isAbsolute(requested) ? requested : path.resolve(target, requested);
  const result = validateDesignModelFile(modelFile);
  const output = { ...result, model: normalizeRel(path.relative(target, modelFile)) };
  if (options.json) console.log(JSON.stringify(output, null, 2));
  else {
    console.log(`\n  design-model 校验：${output.model}`);
    for (const issue of result.errors) console.error(`  ✖ ${issue.code} ${issue.location}: ${issue.message}`);
    for (const issue of result.warnings) console.warn(`  ! ${issue.code} ${issue.location}: ${issue.message}`);
    console.log(`\n  ${result.ok ? "✔" : "✖"} errors=${result.summary.errors}, warnings=${result.summary.warnings}\n`);
  }
  return result.ok ? 0 : 1;
}

function walkFiles(dir, predicate, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walkFiles(full, predicate, base) : predicate(full) ? [full] : [];
    });
}

function runVerify(options, target) {
  const domain = options.domain;
  if (!domain) throw new Error("verify 需要域参数：verify spec | flowchart | db | api");
  const reports = [];

  if (domain === "flowchart") {
    const files = options.files.length
      ? options.files.map((item) => (path.isAbsolute(item) ? item : path.resolve(target, item)))
      : walkFiles(path.join(target, "docs"), (file) => file.endsWith(".drawio"));
    if (!files.length) throw new Error("未找到 .drawio 文件；可用 --file 指定");
    for (const file of files) reports.push(verifyFlowchartFile(file));
  } else if (domain === "spec") {
    const explicit = options.files.map((item) => (path.isAbsolute(item) ? item : path.resolve(target, item)));
    const dirs = new Set(explicit.map((item) => path.dirname(item)));
    if (!dirs.size) {
      const specRoot = path.join(target, "docs", "spec");
      for (const file of walkFiles(specRoot, (item) => item.endsWith(".md"))) dirs.add(path.dirname(file));
    }
    const valid = [...dirs].filter((dir) => fs.readdirSync(dir).some((name) => /^(ch1[-_]3|4\.\d+).*\.md$/.test(name)));
    if (!valid.length) throw new Error("未找到需求说明书目录（docs/spec/{project-code}/）；可用 --file 指定");
    for (const dir of valid) reports.push(verifySpecDir(dir));
  } else if (domain === "db" || domain === "api") {
    const explicit = options.files.map((item) => (path.isAbsolute(item) ? item : path.resolve(target, item)));
    const dirs = new Set(explicit.map((item) => path.dirname(item)));
    if (!dirs.size) dirs.add(path.join(target, "docs", domain));
    const valid = [...dirs].filter((dir) => fs.existsSync(dir) && fs.readdirSync(dir).some((name) => /\.md$/.test(name)));
    if (!valid.length) throw new Error(`未找到 ${domain} 设计文档目录（docs/${domain}/）；可用 --file 指定`);
    for (const dir of valid) reports.push(domain === "db" ? verifyDbDir(dir) : verifyApiDir(dir));
  } else {
    throw new Error(`不支持的域：${domain}（当前支持 spec、flowchart、db、api）`);
  }

  const summary = reports.reduce(
    (acc, report) => ({ pass: acc.pass + report.summary.pass, fail: acc.fail + report.summary.fail, skip: acc.skip + report.summary.skip }),
    { pass: 0, fail: 0, skip: 0 }
  );
  const ok = reports.every((report) => report.ok);
  if (options.json) {
    console.log(JSON.stringify({ ok, domain, reports, summary }, null, 2));
  } else {
    for (const report of reports) {
      console.log(`\n  ${report.ok ? "✔" : "✖"} ${domain}：${normalizeRel(path.relative(target, report.subject))}`);
      for (const item of report.checks) {
        if (item.status === "pass") continue;
        const tag = item.status === "fail" ? "✖" : "…";
        console.log(`     ${tag} ${item.rule} ${item.evidence} ${item.message}`.trimEnd());
      }
    }
    console.log(`\n  ${ok ? "✔" : "✖"} 机械检查：通过 ${summary.pass}，失败 ${summary.fail}，暂不支持 ${summary.skip}\n`);
  }
  return ok ? 0 : 1;
}

function readEditors() {
  const config = JSON.parse(fs.readFileSync(EDITORS_FILE, "utf8"));
  return config.editors.filter((item) => item.enabled);
}

function statePath(target) {
  return path.join(target, STATE_DIR, STATE_FILE);
}

function readState(target) {
  const file = statePath(target);
  if (!fs.existsSync(file)) return null;
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`状态文件损坏：${file}（${error.message}）`);
  }
  if (parsed?.schemaVersion !== 1 || parsed?.package !== PACKAGE.name) {
    throw new Error(
      `状态文件不兼容（package=${parsed?.package}，schemaVersion=${parsed?.schemaVersion}）；请先卸载或手工清理 ${STATE_DIR}`
    );
  }
  return parsed;
}

function acquireLock(target) {
  const lockDir = path.join(target, STATE_DIR);
  fs.mkdirSync(lockDir, { recursive: true });
  const lockFile = path.join(lockDir, "lock");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const handle = fs.openSync(lockFile, "wx");
      fs.writeSync(handle, `${process.pid}\n${new Date().toISOString()}\n`);
      fs.closeSync(handle);
      return lockFile;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      const stat = fs.statSync(lockFile);
      if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
        fs.rmSync(lockFile, { force: true });
        continue;
      }
      throw new Error(`另一个 wl-skills-design 进程正在运行（锁文件：${normalizeRel(path.relative(target, lockFile))}）`);
    }
  }
  throw new Error("无法获取锁文件");
}

function releaseLock(lockFile) {
  if (lockFile) fs.rmSync(lockFile, { force: true });
}

function ensureInside(target, rel) {
  return shared.preflight(target, rel);
}

function selectEditors(requested, editors, state, command) {
  const known = new Set(editors.map((item) => item.id));
  let fallback = command === "update" && state?.editors?.length ? state.editors : ["agents"];
  const retired = fallback.filter((item) => !known.has(item));
  if (retired.length) {
    console.warn(`  ! 以下 profile 已在本版本停用并自动移除：${retired.join(", ")}`);
    fallback = fallback.filter((item) => known.has(item));
    if (!fallback.length) fallback = ["agents"];
  }
  const raw = requested ? requested.split(",").map((item) => item.trim()).filter(Boolean) : fallback;
  const selected = raw.includes("all") ? editors.map((item) => item.id) : [...new Set(raw)];
  const unknown = selected.filter((item) => !known.has(item));
  if (unknown.length) throw new Error(`未知编辑器 profile：${unknown.join(", ")}`);
  return selected.sort();
}

function buildSources(selectedEditors, editors) {
  const adapterByPath = new Map(
    editors.map((item) => [normalizeRel(item.outputPath), item.id])
  );
  const selected = new Set(selectedEditors);
  return getAllFiles(FILES_DIR)
    .map((src) => {
      const rel = normalizeRel(path.relative(FILES_DIR, src));
      return { rel, src, hash: hashFile(src) };
    })
    .filter((item) => {
      const adapter = adapterByPath.get(item.rel);
      return !adapter || selected.has(adapter);
    });
}

function buildInstallPlan(command, target, sources, state, force) {
  const previous = new Map((state?.files || []).map((item) => [item.path, item]));
  const wanted = new Map(sources.map((item) => [item.rel, item]));
  const operations = [];
  const conflicts = [];
  const files = [];
  const preserved = [];
  ensureInside(target, `${STATE_DIR}/${STATE_FILE}`);
  ensureInside(target, `${STATE_DIR}/backups/preflight/file`);

  for (const source of sources) {
    const dest = ensureInside(target, source.rel);
    const old = previous.get(source.rel);
    if (shared.SHARED_MARKDOWN.has(source.rel)) {
      const current = fs.existsSync(dest) ? fs.readFileSync(dest, "utf8") : null;
      try {
        const planned = shared.planMarkdown(current, fs.readFileSync(source.src, "utf8"), old ? { ...old, installedHash: old.hash } : null, OWNER, force);
        const record = { path: source.rel, ...planned.record, hash: planned.record.installedHash };
        files.push(record);
        if (current !== planned.content) operations.push({ type: "write", ...source, dest, existed: current !== null,
          currentHash: current === null ? null : hashFile(dest), content: planned.content, recordBefore: old || null, recordAfter: record });
      } catch (error) { conflicts.push({ path: source.rel, reason: error.message }); }
      continue;
    }
    if (!fs.existsSync(dest)) {
      const record = { path: source.rel, hash: source.hash, kind: "file" };
      files.push(record);
      operations.push({ type: "write", ...source, dest, existed: false, currentHash: null, recordBefore: old || null, recordAfter: record });
      continue;
    }
    const stat = fs.lstatSync(dest);
    if (!stat.isFile()) {
      conflicts.push({ path: source.rel, reason: "目标不是普通文件" });
      continue;
    }
    const currentHash = hashFile(dest);
    if (source.rel === ".github/contracts/wl-delivery-profile.v1.json" && currentHash !== source.hash) {
      files.push({ path: source.rel, hash: currentHash, kind: "reference", projectOwned: true });
      continue;
    }
    if (currentHash === source.hash) {
      files.push({ path: source.rel, hash: source.hash, kind: old && old.kind !== "reference" ? "file" : "reference" });
      continue;
    }

    const locallyModified = old && old.hash !== currentHash;
    const unmanagedConflict = !old || old.kind === "reference";
    if (unmanagedConflict || (!force && locallyModified)) {
      conflicts.push({
        path: source.rel,
        reason: locallyModified ? "受管文件有本地改动" : "已有不同内容",
      });
      continue;
    }
    const record = { path: source.rel, hash: source.hash, kind: "file" };
    files.push(record);
    operations.push({ type: "write", ...source, dest, existed: true, currentHash, recordBefore: old, recordAfter: record });
  }

  if (command === "update") {
    for (const old of previous.values()) {
      if (wanted.has(old.path)) continue;
      const dest = ensureInside(target, old.path);
      if (!fs.existsSync(dest)) continue;
      if (old.kind === "reference") { preserved.push(old.path); continue; }
      if (old.kind === "block") {
        const removed = shared.removeMarkdown(fs.readFileSync(dest, "utf8"), { ...old, installedHash: old.hash }, OWNER);
        if (removed.preserved) { preserved.push(old.path); continue; }
        operations.push({ type: removed.content || removed.keepFile ? "write" : "remove", rel: old.path, dest, existed: true,
          currentHash: hashFile(dest), content: removed.content, recordBefore: old, recordAfter: null });
        continue;
      }
      const stat = fs.lstatSync(dest);
      if (!stat.isFile()) {
        conflicts.push({ path: old.path, reason: "待移除目标不是普通文件" });
        continue;
      }
      const currentHash = hashFile(dest);
      if (currentHash !== old.hash) {
        preserved.push(old.path);
        continue;
      }
      operations.push({ type: "remove", rel: old.path, dest, existed: true, currentHash, recordBefore: old, recordAfter: null });
    }
  }
  return { operations, conflicts, files, preserved };
}

function timestamp() {
  return `${new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 17)}-${crypto.randomBytes(4).toString("hex")}`;
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temp, file);
}

function removeEmptyParents(file, stopAt) {
  let current = path.dirname(file);
  const boundary = path.resolve(stopAt);
  while (current.startsWith(boundary) && current !== boundary) {
    if (!fs.existsSync(current) || fs.readdirSync(current).length) break;
    fs.rmdirSync(current);
    current = path.dirname(current);
  }
}

function rollback(entries, target) {
  for (const entry of [...entries].reverse()) {
    const dest = ensureInside(target, entry.path);
    if (entry.existed) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(entry.backup, dest);
    } else if (fs.existsSync(dest)) {
      fs.rmSync(dest, { force: true });
      removeEmptyParents(dest, target);
    }
  }
}

function removeBackupSnapshot(root) {
  const manifestFile = ensureInside(root, "manifest.json");
  if (!fs.existsSync(manifestFile)) return;
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8")); } catch { return; }
  if (manifest.package !== PACKAGE.name || !Array.isArray(manifest.entries)) return;
  for (const entry of manifest.entries) {
    if (!entry.existed || !entry.backupHash) continue;
    const backup = ensureInside(root, entry.backup);
    if (fs.existsSync(backup) && hashFile(backup) === entry.backupHash) {
      fs.unlinkSync(backup);
      removeEmptyParents(backup, root);
    }
  }
  if (fs.readdirSync(root).every((name) => name === "manifest.json")) {
    fs.unlinkSync(manifestFile);
    fs.rmdirSync(root);
  }
}

function trimBackups(target) {
  const root = path.join(target, STATE_DIR, "backups");
  if (!fs.existsSync(root)) return;
  const dirs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();
  for (const name of dirs.slice(MAX_BACKUPS)) {
    removeBackupSnapshot(path.join(root, name));
  }
}

function applyOperations(target, operations, previousState, nextState, dryRun) {
  if (dryRun) return { backupId: null, changed: operations.length };
  const backupId = timestamp();
  const backupRoot = path.join(target, STATE_DIR, "backups", backupId);
  const applied = [];

  try {
    // Revalidate the whole plan before making the first mutation.
    for (const operation of operations) {
      ensureInside(target, operation.rel);
      const actual = fs.existsSync(operation.dest) ? hashFile(operation.dest) : null;
      if (actual !== operation.currentHash) throw new Error(`目标文件在预检后发生变化：${operation.rel}`);
      if (operation.src && hashFile(operation.src) !== operation.hash) throw new Error(`源文件在预检后发生变化：${operation.rel}`);
    }
    for (const operation of operations) {
      const entry = {
        path: operation.rel,
        existed: operation.existed,
        backup: path.join(backupRoot, "files", operation.rel),
        recordBefore: operation.recordBefore,
        recordAfter: operation.recordAfter,
      };
      if (operation.existed) {
        fs.mkdirSync(path.dirname(entry.backup), { recursive: true });
        fs.copyFileSync(operation.dest, entry.backup);
        entry.backupHash = hashFile(entry.backup);
      }
      applied.push(entry);

      if (operation.type === "remove") {
        fs.rmSync(operation.dest, { force: true });
        removeEmptyParents(operation.dest, target);
        continue;
      }

      fs.mkdirSync(path.dirname(operation.dest), { recursive: true });
      const temp = `${operation.dest}.tmp-${process.pid}`;
      if (operation.content !== undefined) fs.writeFileSync(temp, operation.content, "utf8");
      else fs.copyFileSync(operation.src, temp);
      fs.renameSync(temp, operation.dest);
    }

    if (operations.length) {
      writeJsonAtomic(path.join(backupRoot, "manifest.json"), {
        schemaVersion: 1,
        package: PACKAGE.name,
        packageVersion: PACKAGE.version,
        createdAt: new Date().toISOString(),
        previousState,
        entries: applied.map((entry) => ({
          path: entry.path,
          existed: entry.existed,
          backup: normalizeRel(path.relative(backupRoot, entry.backup)),
          recordBefore: entry.recordBefore,
          recordAfter: entry.recordAfter,
          backupHash: entry.backupHash,
        })),
      });
    }
    if (nextState) writeJsonAtomic(statePath(target), nextState);
    else if (fs.existsSync(statePath(target))) fs.rmSync(statePath(target), { force: true });
    trimBackups(target);
    return { backupId: operations.length ? backupId : null, changed: operations.length };
  } catch (error) {
    rollback(applied, target);
    if (previousState) writeJsonAtomic(statePath(target), previousState);
    else if (fs.existsSync(statePath(target))) fs.rmSync(statePath(target), { force: true });
    throw new Error(`事务失败，已回滚：${error.message}`);
  }
}

function buildState(editors, files) {
  return {
    schemaVersion: 1,
    package: PACKAGE.name,
    version: PACKAGE.version,
    installedAt: new Date().toISOString(),
    editors,
    files,
  };
}

function inspectState(target, state) {
  if (!state) return { managed: false, ok: 0, missing: [], modified: [] };
  const result = { managed: true, retained: state.retained === true, version: state.version, editors: state.editors, ok: 0, missing: [], modified: [] };
  for (const item of state.files || []) {
    const file = ensureInside(target, item.path);
    if (!fs.existsSync(file)) result.missing.push(item.path);
    else if (!fs.lstatSync(file).isFile() || (item.kind === "block" || item.scope === "block"
      ? shared.contributionHash(fs.readFileSync(file, "utf8"), { ...item, installedHash: item.hash }, OWNER)
      : hashFile(file)) !== item.hash) result.modified.push(item.path);
    else result.ok += 1;
  }
  return result;
}

function printResult(value, json) {
  if (json) console.log(JSON.stringify(value, null, 2));
  else if (typeof value === "string") console.log(value);
}

function runInstall(options, target, editors) {
  const state = readState(target);
  const selected = selectEditors(options.editor, editors, state, options.command);
  const sources = buildSources(selected, editors);
  const plan = buildInstallPlan(options.command, target, sources, state, options.force);
  if (plan.conflicts.length) {
    const result = { ok: false, command: options.command, conflicts: plan.conflicts };
    if (options.json) printResult(result, true);
    else {
      console.error(`\n  ✖ 发现 ${plan.conflicts.length} 个冲突，未写入任何文件：`);
      plan.conflicts.forEach((item) => console.error(`     - ${item.path}：${item.reason}`));
      console.error("\n  请先合并本地内容；--force 只可更新已有归属的本包贡献，不能覆盖外来文件。\n");
    }
    return EXIT_CONFLICT;
  }
  const nextState = buildState(selected, plan.files);
  const lock = options.dryRun ? null : acquireLock(target);
  let applied;
  try {
    applied = applyOperations(target, plan.operations, state, nextState, options.dryRun);
  } finally {
    releaseLock(lock);
  }
  const result = {
    ok: true,
    command: options.command,
    dryRun: options.dryRun,
    target,
    editors: selected,
    managedFiles: sources.length,
    changedFiles: applied.changed,
    backupId: applied.backupId,
    preserved: plan.preserved,
  };
  if (options.json) printResult(result, true);
  else {
    console.log(`\n  ✔ ${options.dryRun ? "预检通过" : options.command === "init" ? "安装完成" : "升级完成"}`);
    console.log(`  · profile：${selected.join(", ")}`);
    console.log(`  · 受管文件：${sources.length}，${options.dryRun ? "计划变更" : "已变更"}：${applied.changed}`);
    if (applied.backupId) console.log(`  · 备份：${STATE_DIR}/backups/${applied.backupId}`);
    console.log("");
  }
  return 0;
}

function runStatus(options, target, doctor = false) {
  const state = readState(target);
  const status = inspectState(target, state);
  const manifest = path.join(target, ".github", "skills", "_manifest.json");
  const skillIssues = [];
  if (doctor && status.managed) {
    if (!fs.existsSync(manifest)) skillIssues.push("缺少 .github/skills/_manifest.json");
    else {
      try {
        const data = JSON.parse(fs.readFileSync(manifest, "utf8"));
        for (const skill of (data.skills || []).filter((item) => item.status === "released")) {
          if (!fs.existsSync(path.join(target, ".github", "skills", skill.skillPath))) {
            skillIssues.push(`缺少 Skill：${skill.skillPath}`);
          }
        }
      } catch (error) {
        skillIssues.push(`manifest 无效：${error.message}`);
      }
    }
  }
  const result = {
    ...status,
    ok: status.managed && !status.missing.length && !status.modified.length && !skillIssues.length,
    skillIssues,
  };
  if (options.json) printResult(result, true);
  else if (!status.managed) console.log("\n  未发现 wl-skills-design 安装状态。\n");
  else {
    console.log(`\n  wl-skills-design ${doctor ? "doctor" : "status"}`);
    console.log(`  · 已安装版本：${status.version}`);
    console.log(`  · profile：${(status.editors || []).join(", ")}`);
    console.log(`  · 正常：${status.ok}，缺失：${status.missing.length}，本地改动：${status.modified.length}`);
    [...status.missing, ...status.modified, ...skillIssues].forEach((item) => console.log(`     - ${item}`));
    console.log("");
  }
  return result.ok ? 0 : 1;
}

function listBackups(target) {
  const backupRoot = path.join(target, STATE_DIR, "backups");
  if (!fs.existsSync(backupRoot)) return [];
  return fs
    .readdirSync(backupRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();
}

function runRestore(options, target) {
  const backupRoot = path.join(target, STATE_DIR, "backups");
  const backups = listBackups(target);
  if (options.list) {
    const text = backups.length
      ? `\n  可用备份（新 → 旧）：\n${backups.map((item) => `   - ${item}`).join("\n")}\n`
      : "\n  没有可用备份\n";
    printResult(options.json ? { ok: true, backups } : text, options.json);
    return 0;
  }
  if (!backups.length) throw new Error("没有可恢复的备份");
  let backupId;
  if (options.id) {
    if (!backups.includes(options.id)) throw new Error(`备份不存在：${options.id}（可用 --list 查看）`);
    backupId = options.id;
  } else {
    backupId = backups[0];
  }
  const root = path.join(backupRoot, backupId);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
  const currentState = readState(target);
  const operations = [];
  const conflicts = [];
  const currentRecords = new Map((currentState?.files || []).map((item) => [item.path, item]));
  const nextState = manifest.previousState ? JSON.parse(JSON.stringify(manifest.previousState)) : null;
  for (const entry of manifest.entries) {
    const dest = ensureInside(target, entry.path);
    const current = fs.existsSync(dest) ? fs.readFileSync(dest, "utf8") : null;
    const originalBytes = entry.existed ? fs.readFileSync(ensureInside(root, entry.backup)) : null;
    if (entry.backupHash && originalBytes && hashBuffer(originalBytes) !== entry.backupHash) throw new Error(`备份内容已被修改：${entry.path}`);
    const original = originalBytes === null ? null : originalBytes.toString("utf8");
    const before = entry.recordBefore || manifest.previousState?.files?.find((item) => item.path === entry.path) || null;
    const after = entry.recordAfter === undefined ? currentRecords.get(entry.path) : entry.recordAfter;
    try {
      if (shared.SHARED_MARKDOWN.has(entry.path)) {
        const part = shared.block(current || "", OWNER);
        const saved = shared.block(original || "", OWNER);
        if (after?.kind === "block" && (!part || shared.hash(part.text) !== after.hash)) throw new Error("恢复前本包区块已被修改或移除");
        if (part && !after && currentRecords.get(entry.path)?.kind !== "block") throw new Error("恢复不能覆盖无归属区块");
        let content = current || "";
        let keepFile = entry.existed;
        if (part) {
          const owned = after || currentRecords.get(entry.path);
          const removed = shared.removeMarkdown(content, { ...owned, installedHash: owned.hash }, OWNER);
          if (removed.preserved) throw new Error("恢复前本包区块已被修改");
          content = removed.content;
          keepFile ||= removed.keepFile;
        }
        if (saved && before?.kind === "block") {
          // Reinsert only the backed-up contribution; later user/package text stays.
          const prefix = content && !content.endsWith("\n") ? (content.includes("\r\n") ? "\r\n" : "\n") : "";
          content += prefix + saved.text;
          if (nextState) {
            const record = nextState.files.find((item) => item.path === entry.path);
            if (record) record.prefix = prefix;
          }
        } else if (before?.kind === "block" && nextState) {
          // The backup captured a user-removed block. Its remaining text is a
          // reference, not a package contribution to reclaim on the next clean.
          const index = nextState.files.findIndex((item) => item.path === entry.path);
          nextState.files[index] = { path: entry.path, kind: "reference", hash: hashBuffer(Buffer.from(content)) };
        } else if (before && before.kind !== "reference" && before.kind !== "block" && original !== null && hashBuffer(Buffer.from(original)) === before.hash) {
          const planned = shared.planMarkdown(content, original, null, OWNER);
          content = planned.content;
          if (nextState) {
            const index = nextState.files.findIndex((item) => item.path === entry.path);
            nextState.files[index] = { path: entry.path, ...planned.record, hash: planned.record.installedHash };
          }
        }
        const shouldKeep = content.length > 0 || keepFile;
        if (shouldKeep ? current !== content : current !== null) operations.push({ type: shouldKeep ? "write" : "remove", rel: entry.path, dest,
          existed: current !== null, currentHash: current === null ? null : hashFile(dest), content,
          recordBefore: currentRecords.get(entry.path) || null, recordAfter: nextState?.files?.find((item) => item.path === entry.path) || null });
        continue;
      }
      // Legacy whole-file backups cannot overwrite content changed by another owner.
      if (current !== null && (!after || hashFile(dest) !== after.hash)) throw new Error("恢复前文件已改变，保留当前内容");
      operations.push({ type: entry.existed ? "write" : "remove", rel: entry.path, dest, existed: current !== null,
        currentHash: current === null ? null : hashFile(dest), content: originalBytes || "",
        recordBefore: currentRecords.get(entry.path) || null, recordAfter: before });
    } catch (error) { conflicts.push({ path: entry.path, reason: error.message }); }
  }
  if (conflicts.length) {
    printResult({ ok: false, conflicts }, options.json);
    if (!options.json) conflicts.forEach((item) => console.error(`  ✖ ${item.path}: ${item.reason}`));
    return EXIT_CONFLICT;
  }
  if (options.dryRun) {
    printResult({ ok: true, dryRun: true, backupId, files: operations.map((item) => item.rel) }, options.json);
    return 0;
  }
  const lock = acquireLock(target);
  let applied;
  try {
    applied = applyOperations(target, operations, currentState, nextState, false);
    removeBackupSnapshot(root);
  } finally { releaseLock(lock); }
  printResult(options.json ? { ok: true, backupId, safetyBackupId: applied.backupId }
    : `\n  ✔ 已恢复本包贡献 ${backupId}（当前内容已备份：${applied.backupId || "无变更"}）\n`, options.json);
  return 0;
}

function runUninstall(options, target) {
  const state = readState(target);
  if (!state) throw new Error("未发现安装状态，无法安全卸载");
  const operations = [];
  const conflicts = [];
  const preserved = [];
  const retained = [];
  ensureInside(target, `${STATE_DIR}/${STATE_FILE}`);
  ensureInside(target, `${STATE_DIR}/backups/preflight/file`);
  for (const item of state.files || []) {
    const dest = ensureInside(target, item.path);
    if (!fs.existsSync(dest)) continue;
    if (item.kind === "reference") { preserved.push(item.path); retained.push({ ...item, retained: true }); continue; }
    if (item.kind === "block") {
      try {
        const removed = shared.removeMarkdown(fs.readFileSync(dest, "utf8"), { ...item, installedHash: item.hash }, OWNER);
        if (removed.preserved) {
          preserved.push(item.path);
          const part = shared.block(fs.readFileSync(dest, "utf8"), OWNER);
          retained.push({ ...item, kind: "reference", scope: part ? "block" : "file", hash: part ? shared.hash(part.text) : hashFile(dest), retained: true, previousInstalledHash: item.hash });
          continue;
        }
        operations.push({ type: removed.content || removed.keepFile ? "write" : "remove", rel: item.path, dest, existed: true,
          currentHash: hashFile(dest), content: removed.content, recordBefore: item, recordAfter: null });
      } catch (error) { conflicts.push({ path: item.path, reason: error.message }); }
      continue;
    }
    if (!fs.lstatSync(dest).isFile() || hashFile(dest) !== item.hash) {
      preserved.push(item.path);
      retained.push({ ...item, kind: "reference", hash: hashFile(dest), retained: true, previousInstalledHash: item.hash });
    } else operations.push({ type: "remove", rel: item.path, dest, existed: true, currentHash: hashFile(dest), recordBefore: item, recordAfter: null });
  }
  if (conflicts.length) {
    printResult({ ok: false, conflicts }, options.json);
    if (!options.json) {
      console.error("\n  ✖ 卸载已取消，本地改动未删除：");
      conflicts.forEach((item) => console.error(`     - ${item.path}`));
      console.error("");
    }
    return EXIT_CONFLICT;
  }
  const lock = options.dryRun ? null : acquireLock(target);
  let applied;
  try {
    applied = applyOperations(target, operations, state, retained.length ? { ...state, files: retained, retained: true } : null, options.dryRun);
  } finally {
    releaseLock(lock);
  }
  if (options.purge && !options.dryRun) {
    const backups = path.join(target, STATE_DIR, "backups");
    for (const id of listBackups(target)) removeBackupSnapshot(path.join(backups, id));
    if (fs.existsSync(backups) && !fs.readdirSync(backups).length) fs.rmdirSync(backups);
    const stateDir = path.join(target, STATE_DIR);
    if (fs.existsSync(stateDir) && !fs.readdirSync(stateDir).length) fs.rmdirSync(stateDir);
  }
  const purged = options.purge && !options.dryRun && !fs.existsSync(path.join(target, STATE_DIR));
  printResult(
    options.json
      ? { ok: true, dryRun: options.dryRun, removed: applied.changed, backupId: applied.backupId, purged, preserved }
      : `\n  ✔ ${options.dryRun ? "卸载预检通过" : `已卸载 ${applied.changed} 个本包贡献`}${purged ? "，并已清除本包备份与状态目录" : "（本地修改、引用和外来文件保留）"}${preserved.length ? `；保留 ${preserved.length} 项` : ""}\n`,
    options.json
  );
  return 0;
}

function main(argv = process.argv.slice(2)) {
  if (!fs.existsSync(FILES_DIR) || !fs.existsSync(EDITORS_FILE)) {
    throw new Error("包内容不完整，请重新安装");
  }
  const editors = readEditors();
  const options = parseArgs(argv);
  if (options.version) {
    console.log(PACKAGE.version);
    return 0;
  }
  if (options.help) {
    console.log(helpText(editors));
    return 0;
  }
  const target = path.resolve(process.cwd(), options.target || ".");
  if (options.command === "init" || options.command === "update") {
    if (!options.dryRun) fs.mkdirSync(target, { recursive: true });
    return runInstall(options, target, editors);
  }
  if (options.command === "validate-model") return runValidateModel(options, target);
  if (options.command === "verify") return runVerify(options, target);
  if (options.command === "status") return runStatus(options, target, false);
  if (options.command === "doctor") return runStatus(options, target, true);
  if (options.command === "restore") return runRestore(options, target);
  if (options.command === "uninstall") return runUninstall(options, target);
  throw new Error(`未知命令：${options.command}`);
}

if (require.main === module) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(`\n  ✖ ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  buildInstallPlan,
  buildSources,
  inspectState,
  main,
  parseArgs,
};
