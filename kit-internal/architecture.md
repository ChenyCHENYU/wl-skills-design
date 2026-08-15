# 架构决策记录

## ADR-017 · 四域机械验证闭环与 lint 门禁

**日期**：2026-08
**状态**：已采纳

### 背景

0.10.0 只实现 spec/flowchart 两域机械验证，db/api 的 [M] 项仍由 Agent 代执行——生产验证前必须补齐，否则数据库与接口产物无法机器自证；同时仓库缺少 lint 门禁，check.js 中已出现一个未定义变量 bug（`content`）未被任何门禁拦截。

### 决策

1. **verify db**：解析 DB 清单/数据字典（10 列头）/索引清单/DDL（CREATE TABLE 逐列与索引），机械执行 A01–A08（命名、后缀语义、保留字、索引前缀）、B02/B06（主键唯一、系统字段口径一致）、C02/C03（索引清单、业务唯一覆盖）、D01–D04（四节、ER↔清单、10 列、COMMENT）、E01/E02（清单/字典/DDL 三方表集合与逐字段类型长度一致、跨表字段口径统一）、X05（联动矩阵表覆盖）。
2. **verify api**：解析接口四节结构/触发条件表/字段表/JSON 示例/错误码表，机械执行 A01–A03（编码与 operationId 唯一、URI 风格、URL↔Method 一致）、B02/B03/B04/B06/B07/B10（四节齐全、7 列字段表+稳定 ID、契约类型小写逻辑类型、示例可解析、必填枚举、RFC 3339 日期时间）、D01–D05（总览清单 10 列、接口↔清单↔错误码三方闭合）；B01/D08 显式 skip。
3. **demo 升级为四域金样本**：表名补标准后缀（eqm_inspection_main/_dtl，索引名联动，24 处引用 6 文件协同修改）、API 字段表升级 7 列契约类型、补 operationId、总览升级 10 列清单与带 HTTP 状态的错误码清单——修改本身即被 verify db/api 的 E01/D02 联动检查复核。
4. **lint 门禁**：ESLint 9 flat config（recommended + node globals），`npm run lint` 并入 verify 链；首跑即修复 1 个真 bug（docx 检查未定义变量）与 2 处死代码。
5. 规划项收敛：OpenAPI 深度解析列为独立规划项；英文规范与 Pages 展示暂缓（不影响生产验证精度，另行排期）。

### 权衡

- 表名后缀语义判定基于 DB 清单「表类型」列，类型列缺失时该项退化为仅查命名格式；后缀语义的完整判定仍依赖 [J] 项。
- 契约类型白名单为封闭集合（string/integer/number/boolean/array/object + 限定修饰），新增类型需同步 `API_TYPE_PATTERN` 与标准 §4.2。

## ADR-016 · 双轨验证、文档接入与开源治理

**日期**：2026-08
**状态**：已采纳

### 背景

自证闭环缺口：验证清单此前全部由 LLM 判断，包无法机械证明自己生成的产物合格；接入缺口：他人提供的半成品文档没有标准入口；开源缺口：UNLICENSED + 无治理文件 + kit-internal 含未匿名材料，不具备开源条件。

### 决策

1. **[M]/[J] 双轨标记**：四份标准验证清单逐项标注执行方式；spec/flowchart 的 [M] 项由 `wl-skills-design verify` 确定性执行（20 项 spec 机械检查 + 23 项 flowchart 机械检查），Agent 只判 [J] 项，结果按同一规则编号合并。规则编号成为机器与 LLM 的分界契约。
2. **verify 命令族**：`verify spec --target` / `verify flowchart --file`，输出 pass/fail/skip + 证据位置；未实现的 [M] 项显式 skip，不伪装通过。金样本回归进入测试（包内匿名样例与 demo 必须 verify 全绿）。
3. **doc-intake Skill**：采集归位（编码锚点 + 未归类区）→ 差距分析（机械先行 + 漂移检测：字典值漂移 P0、名称近似待确认）→ 补全计划（复用 09 标准 P0/P1/P2 补丁格式）→ 授权补结构、事实只登记。路由 priority 85，语料 37 条。
4. **demo 升级为活样例**：demo spec 补齐 4.1.6 权限矩阵、4.2-data-report、七列活动表、五列 IPO（GB 风格），保持 verify 全绿；流程图样例修正编码体系（CAIG-A-01-E-01）与判定分支标签，index.md 的双格式说明按标准收敛。
5. **开源治理**：Apache-2.0 + NOTICE；根目录 CONTRIBUTING/SECURITY/CODE_OF_CONDUCT + CODEOWNERS + issue/PR 模板；publish workflow 使用 OIDC provenance；删除 kit-internal 未匿名流程图并移除 doctor 豁免；.gitignore 移除误导性 package-lock 条目；README 双语。
6. **意图与路由**：review 规则新增 评估/审查/走查，maintain 新增 整理；api 负向新增 翻译；新增歧义并列用例（"评估一下这份设计文档" → ask-one-question）。

### 权衡

- 机械验证采用启发式解析（非完整 Markdown/XML AST），误报以证据位置呈现供人工裁决；金样本回归防止验证器自身漂移。
- db/api 的 [M] 项暂由 Agent 代执行，图例如实声明；CLI 扩展时 [M] 集与实现逐步对齐。
- 未匿名文件已从工作区删除，但 git 历史仍含该 blob；正式对外宣布开源前需评估历史重写或将仓库可见性策略一并处理。

## ADR-015 · 炼钢级颗粒度基线与发布载荷真实冒烟

**日期**：2026-08
**状态**：已采纳

### 背景

用一套已交付的复杂模块设计文档（需求/数据库/接口三分册、约 200 页级、含 30+ 画面与 50+ 表）做逆向验证：其需求侧「活动说明 7 个执行类活动」与后端 7 个命令端点一一对应；画面编码成为前端 pageId、路由与菜单锚点；表与字段进入 Flyway DDL；字典值进入前端词典。同时发现源文档存在字典值漂移（DB 分册与代码/前端不一致）与表名拼写漂移，恰好是 D4 联动检查（V13/V15）能拦截的问题。

该验证确认：本包规范结构与真实交付颗粒度兼容，但需求说明书标准缺少「命令按钮处理逻辑」的步骤级要素基线，导致同等场景下生成的 IPO 容易停留在概括层。

### 决策

1. **GB 颗粒度基线**：`06-spec-doc.md` §5.1 按钮级覆盖（一行一按钮、命令按钮↔E 活动一一对应）+ §5.2 GB1–GB8（数据对象/字典稳定值/前置校验/审计履历/联动外同步/异常文案/展示规则/步骤可测）。43 项验证清单数量不变，GB 作为创作期基线由 SKILL 与 sub 引用。
2. **功能编码子域码**：`[模块码][子域码][NNN]` 可选格式，支撑 10+ 功能模块的二级菜单编码。
3. **隐私匹配归一化**：doctor 对内容与词表先做去分隔符归一化再比对，堵住 `PP-OM` 式分隔符绕过；命中并清理了 `03-database.md` 的历史绕过写法，评审样例编码全部换为 `DEMO-OM`。
4. **路由加固**：`manifest.priority` 作为同分决胜实际参与排序；`detectIntent` 增加 审查/走查 同义词；语料扩至 31 条，含 40:40 并列触发 ask-one-question 的歧义用例与纯负例。
5. **意图链一致性门禁**：doctor 断言调度正文意图链与 `manifest.routingPolicy.intentPriority` 完全一致（修复过漏写 `maintain` 的漂移）；Prompt 数量改由 manifest 派生。
6. **CLI 安全加固**：写盘原子化（去删除窗口）、`--wl-skills-design/lock` 防并发（5 分钟过期自动清理）、`restore` 覆盖前生成安全快照（restore 可撤销）、`restore --list/--id`、`uninstall --purge`、状态文件 package/schemaVersion 校验、停用 profile 自动降级告警。
7. **design-model 校验器与 Schema 对齐**：新增 DM014–DM018（必填字段、未定义字段、nameEn/operationId 命名、source.path），逐码测试覆盖 DM001–DM018 与警告码。
8. **真实载荷冒烟**：`package-smoke.js` 改为 `npm pack` 产出真实 tarball → 断言载荷白名单/黑名单 → 全新目录 `npm install` → 运行安装后 CLI 完成 init/doctor/validate-model/uninstall/restore 闭环。

### 权衡

- GB 基线提高书写成本，但它是「文档能直接驱动开发」的分界线；无法满足时标 Pending 而非降级为空话。
- 归一化匹配可能引入极少数误报，按词表白名单逐项人工裁决，不回退到原始匹配。

## ADR-014 · 原生 Skill、确定性路由与安全发布基线

**日期**：2026-07
**状态**：已采纳，取代此前冲突决策

### 背景

旧版本存在分类目录导致 Skill 名称发现不稳定、触发词包含匹配易误路由、validate 默认改文件、CLI 部分复制、旧编辑器路径、样例可能暴露业务背景等问题。规范还把某些技术选型当作无条件必选，容易产生误报。

### 决策

1. **原生目录**：已发布 Skill 统一位于 `.github/skills/<skill-name>/SKILL.md`，目录名等于 frontmatter `name`。
2. **渐进加载**：SKILL 只保留核心流程和相对资源入口；长说明移至 `.github/guides/skills/`。
3. **路由 v2**：按短语边界、intent、上下文、负向词、优先级和最小分差评分；低置信度只问一个澄清问题。
4. **只读边界**：validate、review、impact 默认只读；repair 必须明确授权；创建流程只能修正本轮新产物。
5. **设计画像**：数据库与接口先声明方言、租户、删除、审计、ID、并发、认证、响应、分页、版本、幂等和错误模型；未声明时询问或暂挂。
6. **安全 CLI**：安装前全量预检；写入使用事务回滚；状态记录文件哈希；更新保护本地修改；强制覆盖先备份；支持 dry-run、restore 和 safe uninstall。
7. **编辑器现行路径**：只生成九个显式 profile，删除 Cursor/Windsurf/Cline 旧版单文件。
8. **隐私基线**：模板零业务值，样例使用匿名合成标识；doctor 扫描客户标识、专有模块码、行业词和旧表述。
9. **单一设计模型**：可选 `docs/design-model.json` 使用 JSON Schema 2020-12，以稳定 ID 连接术语、字段、功能、流程、页面、表、接口与追溯关系。
10. **发布门禁**：Node 20/22/24、Windows/Linux、doctor、路由回归、CLI 测试、安装烟测、依赖审计和 npm 打包预检。

### 权衡

- 原生目录和短 SKILL 提高发现稳定性，但人读说明需要从 guides 进入。
- 确定性路由牺牲少量自由匹配，换取可回归、可解释的行为。
- 安全更新多了状态与备份目录，但避免静默覆盖用户文件。
- 设计画像要求更多前置信息，但显著降低技术栈误判。

## 当前组件关系

```text
package.json
├── bin/wl-skills-design.js         安全安装与更新 CLI（含 verify 命令）
├── lib/
│   ├── design-model.js             design-model 校验器
│   └── verify.js                   spec/flowchart 机械验证器
├── files/
│   ├── .github/skills/             原生 Skills（含 doc-intake）、manifest、路由回归、设计模型
│   ├── .github/standards/          工具无关规范（[M]/[J] 双轨标记）
│   ├── .github/prompts/            显式操作入口
│   └── editor adapters             九个可选 profile
├── scripts/
│   ├── check.js                    doctor
│   ├── sync-editors.js             适配器生成与漂移检查
│   └── package-smoke.js            npm 载荷安装烟测
└── tests/                          CLI、路由、结构、机械验证与发布回归
```

路由链路：

```text
用户请求
  → 短语规范化与 intent 识别
  → exact / context / negative 评分
  → 阈值与分差判断
  → 选中一个 Skill 或提出一个澄清问题
  → 读取规范、模板、匿名样例
  → 创建或只读验证
```

CLI 状态链路：

```text
init/update
  → 解析 editor profile
  → 全量冲突预检
  → 备份将覆盖文件
  → 临时文件 + 原子替换
  → 失败回滚
  → 写入 .wl-skills-design/state.json
```

## 历史决策状态

| ADR | 主题 | 当前状态 |
|-----|------|----------|
| 001 / 013 | registry 与 manifest | manifest v2 为执行源，registry 仅人读 |
| 002 | 规范与工具分离 | 保留 |
| 003 | 多编辑器适配 | 升级为九个显式 profile |
| 004 / 005 | npm 的 `files/` 分层 | 保留 `files/` 分层 |
| 006–011 | 单域闭环与跨域联动 | 规则保留，默认修复行为已取消 |
| 012 | templates / examples 双层资料 | 保留，并增加匿名化门禁 |

若历史记录与 ADR-014 冲突，以 ADR-014 和当前自动化检查为准。
