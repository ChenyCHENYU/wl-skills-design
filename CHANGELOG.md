# CHANGELOG

所有显著变更将记录在本文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [0.7.1] — 2026-07-15（原生 Skill、安全路由与隐私加固）

### 新增

- manifest v2 确定性路由：短语边界、intent、上下文、负向词、阈值与最小分差，并提供 21 条路由回归语料。
- JSON Schema 2020-12 设计模型，以稳定 ID 连接术语、字段、功能、流程、页面、表、接口和追溯关系。
- OpenAPI 3.1 模板、九类编辑器 profile、CLI 状态哈希、dry-run、restore、安全卸载和打包安装烟测。

### 变更

- 八个已发布 Skill 改为原生平铺目录与最小 frontmatter；长说明迁移到 `.github/guides/skills/`。
- validate、review、impact 默认只读；repair 需要明确授权，创建流程只可修正本轮新产物。
- 数据库与接口规范改为画像驱动，不再隐式假设方言、系统字段、响应包装、分页、认证、幂等或并发策略；接口契约采用 OpenAPI 3.1 / JSON Schema 逻辑类型、RFC 3339 时间和原生 JSON 语义。
- 所有发布样例改为匿名合成标识，移除组织、地点、行业背景、专有模块码和系统缩写；模板增加纯度门禁。
- 删除无法证明为纯合成来源的旧 DOCX、流程图、原型和分析附件；二进制隐私检查覆盖元数据、修订标识、嵌入媒体和自定义属性。
- Cursor、Windsurf、Cline 使用当前目录式规则路径，不再生成旧版单文件。

### 修复与安全

- CLI 改为全量预检、事务写入、失败回滚、覆盖前备份与本地改动保护，避免半安装或静默覆盖。
- doctor 新增 Skill 命名、frontmatter、相对链接、路由、隐私、模板、draw.io、适配器和设计模型检查。
- CI 覆盖 Windows/Linux 与 Node 20/22/24；移除存在审计问题的未使用提交流程依赖，当前依赖审计为 0 个已知漏洞。

### 文档

- README、使用指南、架构、贡献说明、Skill 清单和发布流程同步更新。

---

## [0.7.0] — 2026-06（变更影响分析：从生成器升级为设计协同引擎）

### 新增
- **变更影响分析 Skill（`cross-change-impact/`）**：对字段/状态/接口/页面/流程等增量变更做跨文档影响分析，输出 `CHANGE_IMPACT` 报告
  - 新增规范 `standards/09-change-impact.md`：定义变更登记、影响传播规则、P0/P1/P2 等级、补丁任务格式、CI-A/B/C/X 20 项验证清单
  - 新增 3 个 sub-skill：`01-change-intake`（变更采集）/ `02-impact-matrix`（影响矩阵）/ `03-patch-plan`（补丁计划）
  - 新增模板 `templates/change-impact-report.md`
  - 新增匿名合成样例 `examples/01-status-change-impact.md`：设备点检新增退回状态，演示 spec/glossary/DB/API/prototype/review 六域联动
  - 新增 prompt：`analyze-change-impact` / `validate-change-impact`
- 新增 ADR-014：把变更影响分析作为“设计协同引擎”的第一层能力，先分析影响，再排补丁，再复验

### 变更
- `_manifest.json` / `_registry.md` / `standards/index.md` / `copilot-instructions.md` / `cross/README.md`：注册变更影响分析 ✅ v1.0、standards 09 ✅
- README：能力数、目录树、工作流和调度示例同步更新，新增“变更影响 → 补丁计划 → 复验”的增量协同路径
- `package.json`：version 0.6.1 → 0.7.0；description 规范数 8→9，补充变更影响分析能力
- 同步重建 10 个编辑器配置文件（v0.6.1 → v0.7.0）

---

## [0.6.1] — 2026-06（机器可读路由 + 闭环门禁增强）

### 新增
- 新增 `.github/skills/_manifest.json`：作为 AI Skill 的机器可读执行路由，显式声明 Skill 状态、规范路径、prompt、精确触发词、语义触发、必要上下文、输出物和闭环阶段
- 新增 ADR-013：记录 `_manifest.json` 取代 `_registry.md` 成为执行源，`_registry.md` 降级为人读索引
- `scripts/check.js` 增强 manifest/闭环检查：已发布 Skill 必须具备 `USAGE.md`、`templates/`、`examples/`、规范文件、prompt、触发词、必要上下文、输出定义和完整生成-验证-修复-复验闭环
- 新增测试：覆盖 manifest 执行要素，以及 `init` 默认保护已有文件

### 变更
- `copilot-instructions.md` 路由规则改为先读 `_manifest.json`，按 exact / semantic / context 评分；低置信度先询问，非 released 状态禁止读取 `SKILL.md`
- CLI `init` 默认不再覆盖目标项目已有且不同的文件；`update` / `--force` 覆盖前仍自动备份 `.bak.<时间戳>`
- CLI `--help` 改为动态统计规范数、Skill 数、prompt 数和编辑器数，减少文档漂移
- 维护文档同步更新：触发词维护改为先改 `_manifest.json`，再同步 `_registry.md`
- `package.json`：version 0.6.0 → 0.6.1；`prepare` 在无 `.git` 场景不再输出 husky 噪音

---

## [0.6.0] — 2026-06（每个 Skill 双层资料：模板 + 样例，且随包发布）

### 新增
- **匿名合成样例随包发布 + 全域覆盖**（ADR-012）：每个 Skill 目录新增 `examples/`，存放基于匿名合成场景的「匿名合成样例（质量标杆）」，`npx` 安装后在目标项目内可直接打开，AI 生成时**对照自检且必须做得不低于它**
  - 流程图：`examples/01-purchase-approval.drawio`（采购审批全规范流程）+ `examples/README.md`
  - 需求说明书：`examples/00-doc-outline` / `01-flow-desc` / `02-function-ipo` / `03-flow-screen-map` / `04-api` 共 5 份
  - **原型（新增样例）**：`examples/01-page-annotation.md` 匿名任务列表 D3 完整标注
  - 数据库：`examples/01-data-dictionary.md` 订单主表+明细表（7 系统字段 + 索引 + 三方联动）
  - 接口：`examples/01-restful.md` 订单状态变更 + `examples/02-integration.md` 订单下达推送
  - **集成评审（新增样例）**：`examples/01-review-report.md` 订单模块第 1 轮评审（P0 一票否决 + 暂挂排除分母演示）
  - **术语词典（新增样例）**：`examples/01-glossary.md` 订单+计划域完整词典（四类词条 + 联动矩阵）
  - 每个样例结尾固定附「**自检：本样例为何达标**」清单，把质量标杆显式化为可逐条对照的检查点
- 新增 ADR-012（每个 Skill 双层资料：templates 空白模板 + examples 匿名合成样例，两层都随包发布）

### 变更
- **templates 归零职责**：把此前混入项目业务数据的模板改写为纯 `{占位符}` 空白骨架——`data-dictionary.md` / `table-definition.md` / `restful-def.md` / `integration-def.md` / `interface-list.md`。自此 `templates/` 永远是空白起点，`examples/` 永远是质量标杆，职责零歧义
- **各 SKILL.md 第三步双指**：同时标注「空白模板（templates）」与「匿名合成样例（examples，质量标杆，须不低于它）」
- **修复发布期断链**：此前 `files/` 内多处文档（`06-spec-doc.md §十二`、spec `USAGE.md`、`create-spec-section.prompt.md`、`sub/03-function-ipo.md`）引用 `kit-internal/examples/`——该路径在目标项目里不存在。现全部改指随包发布的 `examples/`（doctor 的 SKILL 引用检查 18 → 23 项且全过）
- **README 重写**：新增「核心设计理念」「双层资料：模板 + 样例」「一次 AI 调度长什么样」等章节，目录层级与架构讲解更清晰
- `kit-internal/`：`README.md` / `CONTRIBUTING.md`（新增双层资料约定）/ `skills/README.md`（补原型 + 各域样例计数）同步更新
- `package.json`：version 0.5.0 → 0.6.0；同步重建 10 个编辑器配置

### 移除
- **删除 `kit-internal/examples/`**：样例已迁入各 Skill 的 `examples/`（随包发布），避免「两份样例」认知混乱，样例此后只此一处

---

## [0.5.0] — 2026-06（新增原型设计 Skill + spec-gen 瘦身）

### 新增
- **原型设计标注 Skill（`requirements-prototype/`）**：把 spec 功能设计转成结构化原型标注，达到「开发就绪（D3）」深度，可被 `prototype-scan`（wl-skills-kit）直接消费生成代码
  - 规范 `standards/02-prototype.md` 从 stub 升级为完整规范：8 种交互模式 + 决策树、每页 7 项必标内容、三级深度（D1/D2/D3）、与 spec 的字段对齐规则、特定行业行业特化（页面模式映射/高频字典/批次合并批次拆分等特殊交互）、**23 项验证清单（PT-A/B/C/X 四组）** + 闭环修复协议
  - 薄 SKILL + 2 sub（`01-page-layout` 定模式骨架 / `02-field-annotation` 字段标注核心）+ 1 template（`page-annotation` 7 项必标）
  - 2 个 prompt：`create-prototype` / `validate-prototype`
  - **页面编码复用 spec 功能编码**（不另起编码体系），PT-X X05 校验原型「关联 IPO」编码 ∈ spec 4.x.4
- 新增 ADR-010（原型规范定位为标注深度标准而非视觉规范）、ADR-011（spec-gen 废弃项目特定脚本）

### 变更
- `_registry.md` / `standards/index.md` / `copilot-instructions.md`：原型设计 🔲 → ✅ v1.0、standards 02 ✅
- `package.json`：version 0.4.2 → 0.5.0，description 补「原型标注」技能
- 同步重建 10 个编辑器配置（v0.4.2 → v0.5.0）
- `kit-internal/skills/README.md`：原型从规划中移至已发布；补充增量设计/版本追踪/错误恢复的后续规划

### 移除
- **spec-gen 瘦身**：删除 `generate_spec_doc.py`（示例项目特定硬编码，不可复用）与 `create_skeleton.py`（一次性骨架提取工具，已完成使命）；保留通用的 `draw_flow.py`（流程图双轨生成器）。设计文档生成的正确路径是 Skill 体系（`create-spec-section`），不再维护项目特定的 Python 生成器

---

## [0.4.2] — 2026-06（工程小项勘误）

### 修复
- **husky v9 弃用警告**：`.husky/commit-msg` 移除已弃用的 `#!/usr/bin/env sh` + `. "$(dirname ...)/_/husky.sh"` 两行（husky v9+ 不再需要，v10 将直接失败），仅保留 commitlint 调用
- **README 错别字**：修正流程图示例中的错别字

### 待决策（未改）
- `package.json` `license: UNLICENSED` 与 `publishConfig.access: public` 的语义矛盾仍待团队拍板（开源 MIT / 保持内部受限），本版未改动发布行为

---

## [0.4.1] — 2026-06（数据库/接口规范最佳实践补强）

### 修复
- **`revNo` / `version` 命名打架（真 bug）**：03 §二 新增可选系统字段 **S8 `version`（乐观锁，并发控制）**，与 §六 `revNo`（业务履历版本号）明确区分职责；db 样例中的 `version` 字段由"规范未定义"变为合规

### 新增（03 数据库）
- §五·补 **字段类型与工程约定**：逻辑类型→物理类型映射表（MySQL/PG/Oracle/达梦）、长度精度字符集约定（金额 `decimal(18,2)` 等全库口径统一）、冗余字段标注 `[冗余:来源表.字段]`、外键策略（默认逻辑外键不建物理 FK）
- 验证清单新增 **DB-E 组（4 项）**，总数 30 → **34 项**

### 新增（04 接口）
- §3.4 **分页/排序/过滤**统一约定：参数 `pageNum`/`pageSize`/`sort`，分页响应 `{records,total,pageNum,pageSize,pages}`
- §4.5 **字段传输格式**统一约定：日期 `yyyy-MM-dd`、金额字符串（防 JS 精度丢失）、枚举传存储值、布尔 0/1
- §4.6 **批量接口报文**结构（部分成功 `successCount`/`failCount`/`failures`），对齐 spec §7.4
- **统一响应 `code` 定为字符串，成功固定 `"2000"`**（消除原 `"0"` 与字符串错误码混用的矛盾）
- 验证清单 IF-B 组新增 B09/B10/B11，总数 35 → **38 项**

### 变更
- 全包同步 30→34 / 35→38 计数：SKILL/USAGE/sub/prompt/07 评审/README/kit-internal，重建 10 个编辑器配置
- 修正 07 §一 D3 数据源章节引用 `§八` → `§十`（接口验证清单实际在 §十）

---

## [0.4.0] — 2026-06（新增术语/字段词典 Skill，字段对齐中央锚点 + 工程化收尾）

### 新增
- **术语/字段词典 Skill（`cross-glossary/`）**：为全链路建立统一语言（Ubiquitous Language）中央词典——把同一业务概念在 spec/DB/接口的**中文名↔英文名↔类型↔枚举↔模块码**钉成单一映射，作为字段对齐的**中央锚点**，让字段对不齐从「评审时发现」提前到「设计时杜绝」
  - 规范 `standards/08-glossary.md`：四类词条（业务术语/字段/枚举/编码注册）、字段词条 9 列单一映射格式、与 spec/DB/接口联动 G1~G5、对既有 DB-X/IF-X/D4 校验的**锚点化增强**（两两互比 O(N²) → 与词典比对 O(N)）、**18 项验证清单（GL-A/B/C/X 四组）**+ 闭环修复协议
  - 3 个 sub-skill：`01-build-glossary`（编码注册+业务术语）/ `02-field-entry`（字段+枚举，核心）/ `03-glossary-review`（三方 ⊆ 词典校验+联动矩阵+报告）
  - 1 个模板：`glossary`（四类词条骨架）
  - 2 个 prompt：`create-glossary` / `validate-glossary`
- 新增 ADR-009（术语词典作为字段对齐中央锚点、cross 类、锚点化既有校验、向后兼容）
- **`tests/` 单元测试套件**（零依赖，`node:test`）：`npm test` 覆盖 CLI（--version/未知选项与命令退出码/--help/init/--dry-run/update 备份）与构建脚本（sync --check 无漂移、doctor 通过、编辑器数与 `editors.json` 启用数一致、registry 正则解析 ✅ Skill）——补齐「防漂移机制本身无测试」的命门
- CI 工作流新增「单元测试」步骤（doctor 之后、安装冒烟测试之前）

### 变更
- `_registry.md` / `standards/index.md` / `copilot-instructions.md` / `cross/README.md`：新增术语字段词典 ✅ v1.0、standards 08 ✅
- `07-design-review.md §十一`：补充与 08 词典的关系（D4 字段/枚举一致性以「三方 ⊆ 词典」为基准，词典缺失时回退两两互比）
- `package.json`：description 规范数 7→8、补术语词典技能；版本 0.3.0 → 0.4.0
- CLI `--help` / README：规范数 7→8、技能覆盖表新增术语词典行、prompt 数 9→11、目录树补全 glossary skill 与 2 个 prompt
- `kit-internal/skills/README.md`：术语词典从🔴规划中移至已发布
- 同步重建 10 个编辑器配置文件（v0.3.0 → v0.4.0）
- **去除过时的「特殊字符路径」绕行说明**：仓库已迁纯 ASCII 路径，README / `_compat/README.md` / `CONTRIBUTING.md` / `kit-internal/README.md` 删除「复制到临时目录运行/发布」的临时方案；`kit-internal/README.md` 发布流程改为 `npm version` + `npm publish`（鉴权走 `npm login` / CI token，不再在仓库写 `.npmrc`）；ADR-008 标注限制已解除
- **脚本去硬编码**：`check.js` 的「编辑器配置漂移检查：N 个配置」与 `sync-editors.js --check` 的成功提示改为从 `editors.json` 动态取启用数，消除下一个潜在漂移点
- **CLI `update` 备份改为带时间戳**：`.bak` → `.bak.<时间戳>`，避免连续 update 冲掉上一次的本地改动备份；`.gitignore` 排除 `*.bak` / `*.bak.*`
- **编辑器头部描述对齐**：`headers/cursor-mdc.txt` / `headers/trae.txt` 的 description 由「流程图/原型/数据库/接口/代码设计」（含未发布能力）统一为「N 条设计规范 + Skill 自动调度」，并重新 `sync` 同步产物
- README 维护指南：`vim` 手改示例改为「编辑 + `npm run check`」闭环，明确 9（重建）vs 10（校验）编辑器配置的来历

### 修复
- `bin/wl-skills-design.js` 头部注释 `CLI v${PKG.version}` 的伪模板插值（实际不替换）改为去除版本占位

---

## [0.3.0] — 2026-05（工程化加固：同步脚本 + 一致性自检 + 文档勘误）

### 新增
- **`scripts/sync-editors.js` 多编辑器同步器**：从 `copilot-instructions.md` + `_compat/` 自动重建 9 个编辑器配置，版本号从 `package.json` 注入——`npm run sync` 取代「手改 10 处版本号 + 人肉拷正文」，根除配置漂移；`--check` 模式只校验不写入
- **`scripts/check.js` 一致性自检（doctor）**：`npm run check` 校验 ① `_registry.md` 标 ✅ 的 Skill 其 `SKILL.md` 存在 ② `standards/index.md` 引用的规范文件存在 ③ 各 `SKILL.md` 引用的 standards/sub/templates 路径存在 ④ 编辑器配置无漂移
- **发布前闸门 `prepublishOnly`**：`sync --check && check`，配置漂移或引用断裂直接阻断 `npm publish`
- **CI 工作流**（`.github/workflows/ci.yml`）：PR / push 跑漂移校验 + doctor + init 安装冒烟测试
- 新增 ADR-008（同步与自检脚本化决策）

### 变更
- **CLI `update` 覆盖前自动备份**：对含本地改动的文件先写 `.bak` 再覆盖，避免无声冲掉用户自定义内容
- 版本号统一从 `package.json` 注入，10 个编辑器配置版本号 v0.2.1 → v0.3.0
- `_compat/README.md` / `CONTRIBUTING.md`：手动同步流程改为脚本化（`npm run sync` / `npm run check`），并标注特殊字符路径需临时目录运行
- `kit-internal/skills/README.md` 规划清单新增：术语/字段词典（🔴 高，作为字段对齐中央锚点）、测试用例/验收标准、NFR 规范、数据埋点设计
- `.npmignore` 排除 `scripts/`（维护者构建工具，不发布）

### 修复
- **CLI `--help` 文本严重过时**：「5 条规范 / 仅流程图可用」→ 实际「7 条规范 / 5 个 Skill 已发布」
- **README 错别字**：仔表盘 → 仪表盘、P0 阶断清单 → P0 阻断清单、需求设计朴限 → 需求设计环节
- `headers/kiro.txt` description「5 条设计规范」→「7 条设计规范」

---



### 新增
- **spec 验证落盘报告**：`validate-spec-section.prompt.md` 验证完成后落盘 `docs/spec/reports/SPEC_REVIEW_{模块}_{日期}.md`，与 `DB_REVIEW_*` / `IF_REVIEW_*` 三者对齐——补齐「设计集成评审」采集 D1 需求维度的数据源（此前 D1 只能现场重验）
- **db / api 匿名合成样例**：`kit-internal/examples/db/01-data-dictionary-example.md`（10 列数据字典 + 7 系统字段 + 索引 + 三方联动）、`kit-internal/examples/api/01-restful-example.md`（RESTful 定义 + 统一包装 + spec/DB 联动），补足 few-shot 参考
- kit-internal README 新增**发布到 npm** 流程（特殊字符路径需复制到临时目录发布）

### 变更
- `_registry.md`：补充「规划中 Skill 其 SKILL.md 未创建，命中触发词时不读取、直接提示不可用」防护说明
- `design-review/sub/01-collect.md`、`standards/07-design-review.md`：D1 数据源明确为 `SPEC_REVIEW_*.md`（43 项）
- `CONTRIBUTING.md`：新增 Skill 类别补充 `cross/`（跨域聚合类）；规范编号示例 06→08
- `package.json`：description 规范数 6→7、补全五大技能；版本 0.2.0 → 0.2.1
- 同步重建 9 个编辑器配置文件版本号

### 移除
- 删除历史遗留的项目业务文档目录（不属于通用工具包）
- 解除 `spec-gen/output/assets/PLAN-A-01.drawio` git 追踪（项目生成物）
- `.gitignore` 补全 `*.drawio` / `__pycache__/` / `docs/` 排除规则

### 修复
- `copilot-instructions.md` 及 9 个编辑器配置版本号 v1.0.0 → 与 npm 包对齐
- README：examples 树补 db/api，去除项目特定（示例组织）注释

---

## [0.2.0] — 2026-05（新增设计集成评审 Skill，三份产物聚合评分闭环）

### 新增
- **设计集成评审 Skill（`cross-design-review/`）**：把需求设计（spec）、数据库设计（DB）、接口设计（IF）三份产物聚合成一份带评分的评审报告——**第二层报告**，消费各产物 validate 结论再叠加跨文档联动与综合评分
  - 规范 `standards/07-design-review.md`：评分模型（维度得分 = 通过/(总−暂挂)，4 等级 🟢🟡🟠🔴）、**P0 一票否决闸门**、问题分级 P0/P1/P2/P3、**D4 跨文档三角联动 18 项**（spec→DB / spec→IF / IF→DB / 命名口径 / 可追溯）、追溯矩阵、报告六部分结构、评审执行清单 RV 12 项、复评协议、报告模板
  - 3 个 sub-skill：`01-collect`（采集三维度结论）/ `02-cross-check`（三角联动 + 追溯矩阵，核心）/ `03-score-report`（评分 + 分级 + 出报告）
  - 1 个模板：`review-report`（仪表盘 + P0 清单 + 追溯矩阵 + 修复任务）
  - 1 个 prompt：`design-review`
- **追溯矩阵**：spec 功能编码 → 接口 → 落库表 正向闭环视图，一眼定位断点（✅ 闭环 / ❌ 断点 / ⚠️ 暂挂）
- 新增 ADR-007（架构决策：集成评审作为第二层报告、跨域 cross/ 类、复用而非重算、P0 一票否决）

### 变更
- `_registry.md` / `standards/index.md` / `copilot-instructions.md`：新增设计集成评审 ✅ v1.0、standards 07 ✅
- 新增 `skills/cross/README.md`（跨域集成类 Skill 说明）
- 同步重建 9 个编辑器配置文件
- 修正 README 文档漂移：规范数 6→7、技能覆盖表新增集成评审行、目录树补全 DB/IF/cross skill 与 9 个 prompt、ADR 计数更新
- `guides/usage.md`：补全数据库/接口/评审/说明书的触发示例（移除过时「规划中」标记）

---

## [0.1.0] — 2026-05（新增数据库设计 + 接口设计两大 Skill，全链路闭环）

### 新增
- **数据库设计 Skill（`data-database-design/`）**：从需求说明书 IPO 表推导数据库设计，输出 ER 图 / DB 清单 / 数据字典（10 列标准表）/ DDL 全套产物
  - 规范 `standards/03-database.md`：命名约定、**7 个强制系统字段**、主键与索引、文档 4 节结构、变更履历设计、与 spec 字段联动、**30 项验证清单（DB-A/B/C/D/X 五组）**+ 闭环修复协议
  - 4 个 sub-skill：`01-erd`（实体推导）/ `02-table-design`（字段+系统字段+索引，核心）/ `03-ddl`（建表脚本）/ `04-db-review`（验证+自动修复+报告）
  - 3 个模板：`db-skeleton` / `data-dictionary`（10 列）/ `table-definition`
  - 2 个 prompt：`create-db-design` / `validate-db-design`
- **接口设计 Skill（`api-interface-design/`）**：从需求说明书功能编码推导接口清单，覆盖系统集成报文 + HTTP/RESTful 两类
  - 规范 `standards/04-api-design.md`：接口分类与命名、HTTP/RESTful 规范、请求/应答报文结构、触发条件五要素、**统一响应包装 `{code,msg,data,traceId}`**、错误码、安全设计、幂等与重试、与 spec/DB 联动、**35 项验证清单（IF-A/B/C/D/X 五组）**+ 闭环修复协议
  - 4 个 sub-skill：`01-interface-list`（清单推导+覆盖检查）/ `02-integration`（集成报文，核心）/ `03-restful`（RESTful）/ `04-if-review`（验证+自动修复+报告）
  - 4 个模板：`if-skeleton` / `interface-list` / `integration-def` / `restful-def`
  - 2 个 prompt：`create-if-design` / `validate-if-design`
- **spec → DB → 接口三角联动验证**：DB-X 校验 spec IPO 字段 ⊆ DB 字段；IF-X 校验 spec 功能编码 → 接口覆盖、接口字段英文名 ⊆ DB 字段英文名；跨文件缺对端时标「跨文件暂挂」

### 设计基线（来自匿名合成场景文档）
- 数据字典严格沿用 10 列：序号/字段英文名/字段中文名/主外键/是否索引/类型/长度/空否/缺省/备注
- 接口报文沿用 6 列主档/明细档 + 触发条件六行表
- 在既有格式基线上叠加最佳实践：系统字段、索引章节、命名前缀、统一响应、错误码、安全/幂等、接口编码唯一递增

### 变更
- `_registry.md` / `standards/index.md` / `copilot-instructions.md` / `data/README.md` / `api/README.md`：数据库设计、接口设计状态 🔲 规划中 → ✅ 可用
- 同步重建 9 个编辑器配置文件（CLAUDE.md / .cursorrules / .clinerules / .windsurfrules / AGENTS.md 等）
- 新增 ADR-006（架构决策：复用 spec 闭环 + 既有文档格式基线）

---

## [0.0.9] — 2026-05（一致性补丁：流程五要素 + 活动编码格式对齐）

### 修复
- **`create-spec-section.prompt.md` 默认落盘路径修正**：与 spec §十.2/§十.3 单一权威保持一致
- **流程说明五要素格式对齐**：`examples/spec/01-flow-desc-example.md` 与 `sub/02-module-flow.md` 统一为 `【触发条件】【主要角色】【核心路径】【关键判断】【流程产出】`
- **活动编码格式统一**：`sub/02-module-flow.md` 对齐 `[流程编码]-[E/C/M]-[NN]` 标准格式

---

## [0.0.8] — 2026-05（全面闭环修复：43 项单一权威 + 表列对齐 + 编码统一）

### 修复
- **验证清单彻底单一权威化（M1）**：`validate-spec-section.prompt.md` 整体重写——不再自定义检查清单，全部指向 `06-spec-doc.md §十一（43 项）`，消除双源脱节根因；X 组集合比对算法与暂挂处理走 §十三+§十四，P0~P3 修复优先级对齐 §十四 第三阶段
- **验证总项数从 42 修正为 43**：逐组实际清点（A5+B6+C4+D4+E11+F3+G2+H2+X6）并全文同步；`create-spec` prompt / `SKILL.md` / `06-spec-doc.md` §十一标题、§十三、§十四 全部改为 43
- **Sub-Skill 生成表列数对齐规范（M4）**：
  - `sub/01-overview.md`：岗位定义表 3 列→5 列（增序号/岗位职责/在本系统中的角色），专有名称表 2 列→4 列（增序号/类别）
  - `sub/04-data-report.md`：外部输入表补「取数条件」列、数据输出表「触发条件」改为「推送时机」并补「用途说明」列、报表清单 5 列→8 列（增主要使用角色/数据刷新策略/导出支持）
  - `templates/doc-skeleton.md`：占位表列数同步
- **活动编码格式统一（M5）**：`01-flowchart.md §七` 从旧 `FGPM-E-01` 格式重写为指向 spec §十.2/§十.3 单一权威（`[流程编码]-[E/C/M]-[NN]`），示例改为 `BASE-A-02-E-01`；`06-spec-doc.md §十.3` 补 C/M 类型说明及 FC-01 互引要求；验证清单 C02、flowchart SKILL 快速参考均同步
- **06-spec §六.2 流程说明格式（A1）**：从旧叙事段落（"第一步…第二步…"）改为五要素结构（`【触发条件】【主要角色】【核心路径】【关键判断】【流程产出】`），与 `sub/02-module-flow.md` 保持一致
- **Sub-Skill 落盘路径统一（A2）**：02/03 均写入同一 `docs/spec/{项目代号}/4.{序号}-{子模块名}.md`，04 写入 `4.N-data-report.md`，消除多文件分散与五文件结构冲突；各 Sub-Skill 内旧 validate 调用的"X 类 N 项"硬编码改为引用适用检查组名
- **`sub/01-overview.md` 删除冗余信息确认表（A7）**：删除与推断/确认双表重叠的「章节\|必须知道的信息」旧表，保留精简版
- **`sub/03-function-ipo.md` BASE001 示例补「重置」按钮（A6）**：列表页由 4 行→5 行，与标准列表页模板一致
- **`sub/02-module-flow.md` 图例格式统一（B4）**：从自定义表格改为与 spec §六.2 一致的固定 list 格式

### 新增
- **H03（条件项）**：`06-spec-doc.md §十一 H 组` 新增行级数据权限（Row-level Security）验证条目，标注「仅当系统存在行级权限需求时计入」，不影响强制总数 43

---

## [0.0.7] — 2026-05（详说规范全面重写，覆盖 Word 模板 + IPO 代码设计标准）

### 重写
- **`standards/06-spec-doc.md` 全面重写 v2.0**（从约 400 行扩展到 870 行）
  - 新增 **§零 Word 文档模板固定结构**：页眉公司标识带、页脚3行元数据带、第一封面（信息表）、第二封面（审批签字表）、修订记录页、目录页，全部含固定字段+变量字段说明
  - 升级 **功能设计详规（§七）**：画面逻辑写法添加控件类型表；字段描述模板（外键关联/枚举下拉/数字/日期/文本/只读带出）；四段式写法要求明确正反按子段寻找；状态机表格模板；主从表结构模板
  - 升级 **流程说明规范（§六）**：流程说明固定段落结构（触发条件+关键环节+业务产出）；活动说明表新增输入/输出列
  - 升级 **验证清单**：从 18 项扩展到 32 项，新增固定页面完整性（5项）+组织架构章节质量（4项）+流程说明质量（3项）
  - 每个节末新增 **“代码设计视角”**：说明该节产出如何作为 AI 代码设计输入

---

## [0.0.6] — 2026-05（文档拆分蓝图 + SKILL.md 结构化策略）

### 新增
- **`templates/doc-skeleton.md`**：完整文档「拆分蓝图」文件，明确规定一份说明书由 5 个文件组成（`ch1-3.md` / `4.x-{name}.md` × N / `4.N-data-report.md`），每文件的内容边界、生成职责、命名规则、7步生成操作流程、速查表
- **`SKILL.md` 重写**：删除内联骨架模板，改为强制首读 `templates/doc-skeleton.md`，明确每个 Sub-Skill 对应写入哪个目标文件（流程节和 IPO 节写入同一子模块文件），新增「写入文件」列
- **匿名验证样例**：通用任务功能完整 IPO 表（列表页 + 新增页，含状态机和提交逻辑）

### 修复
- 匿名 IPO 样例 A10 自动修复：取消按钮处理逻辑去除「返回」字眼

---

## [0.0.5] — 2026-05（全类型 Skill 验证闭环完整覆盖）

### 新增
- **D 类检查（6 项）**：概述章节（1～3章）结构验证（组织架构图占位 / 岗位表格 / 本语表 / 功能层级表）
- **E 类检查（5 项）**：数据需求表+报表设计验证（编码对应 / 查询条件表+输出字段表 / 报表样例占位）
- `sub/01-overview.md` 补充落盘路径说明及 validate 引用
- `sub/04-data-report.md` 补充落盘路径说明及 validate 引用
- `validate-spec-section.prompt.md` 章节类型识别表更新，报告模板补充 D/E 类，修复优先级升级

---

## [0.0.4] — 2026-05（需求设计说明书 Skill + 闭环升级）

### 新增
- **需求设计说明书 Skill 全套**（`requirements-spec-doc/`）
  - 权威规范：`standards/06-spec-doc.md`（8章，18项验证清单，IPO表四段式格式规范）
  - 主入口：`SKILL.md` + `USAGE.md`
  - 4 个 Sub-Skill：总体设计 / 流程说明体系 / 功能 IPO 表（核心）/ 数据报表
  - VS Code Prompt：`create-spec-section.prompt.md`（含文件落盘）
  - VS Code Prompt：`validate-spec-section.prompt.md`（A类12项+B类8项+C类5项，自动修复）
  - 匿名合成样例：`kit-internal/examples/spec/`，4个文件（如菜项目 199 条目大纲、BASE001 完整 IPO、流程画面对照表）
- **IPO 表 Sub-Skill 补充场景模板**：多 Tab 页 / 状态机功能 / 主从表功能

### 调整
- `_registry.md` 添加需求设计说明书触发词（9 个关键词）
- `standards/index.md` 添加 06 条目
- `kit-internal/skills/README.md` 添加 spec skill 行
- `README.md` 技能覆盖表 / 仓库结构图全面同步

---

## [0.0.2] — 2025-05（Patch 优化）

### 修复
- 连线规范关键错误：source 应指向 **name 层**（非 code 层），target 指向 code 层；跨泳道 parent 必须是外层主容器 id
- `standards/01-flowchart.md` 示例中 `source="n1-dept"` 改为 `source="n1-name"`（dept 层在最底部，非退出点）
- `create-flowchart.prompt.md` 错误描述"source/target 指向 code 层"
- `package.json` description 包含错误版本号 `v1.0.0`

### 新增
- CLI `--version` / `-v` 标志：`npx @agile-team/wl-skills-design --version`
- `validate-flowchart.prompt.md` 添加 `replace_string_in_file` 工具，验证后自动执行修复（真正闭环）
- `package.json` 补全 `homepage`、`bugs` 字段及 `scripts.cz`
- `.gitignore` 补充 `*.tgz` 和 `package-lock.json`
- `SKILL.md` 连线规范表新增 source/target 层级和跨泳道 parent 规则说明

### 调整
- `editors.json` 版本号从错误的 `1.0.0` 修正为 `0.0.1`

---

## [0.0.1] — 2025-05（首次发布）

### 新增
- 流程图设计 Skill（draw.io 泳道图规范）
  - 完整规范文件：`.github/standards/01-flowchart.md`（15 章节，画布/泳道/节点/色标/连线/编码/验证）
  - AI 触发文件：`.github/skills/requirements-flowchart/SKILL.md`
  - 骨架模板：`.github/skills/requirements-flowchart/templates/skeleton.drawio`
  - VS Code 创建提示词：`.github/prompts/create-flowchart.prompt.md`
  - VS Code 验证提示词：`.github/prompts/validate-flowchart.prompt.md`
- 多编辑器适配层（`_compat/`）支持 10 种编辑器
- Skill 触发词路由（`_registry.md`）单一数据源架构
- 规范门控索引（`standards/index.md`）
- 规划中规范占位文件（02～05）
- 各编辑器根配置文件（CLAUDE.md, .cursorrules, .windsurfrules 等）
- 维护者文档（`kit-internal/`）：ADR、CONTRIBUTING、Skill 维护清单
