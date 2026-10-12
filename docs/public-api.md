# Design 公开 API 与执行边界

本包独立提供设计技能、标准、机械验证和项目资产生命周期。harness 或客户端只消费公开能力并调用稳定执行入口，离开宿主后原 CLI 与同 runId 回执仍完整可用。

## 完整公开面

| 入口 | 兼容性审查对象 | 验证方式与限制 |
|---|---|---|
| `wl-skills-design` CLI | 已有命令、选项、退出码、JSON 结果、文件/目录范围 | CLI 与四域真实样例、合规/违规正反例；保留旧入口 |
| `protocol describe/request` | 协议 v1 信封、动态 Schema、能力与执行器声明、错误语义 | 保留五个原操作，追加 `execute` / `executor-invoke-v1`；宿主不导入私有库 |
| 项目受管资产 | state 所有权、旧版正常 update、profile、备份/恢复/卸载、外来区块保护 | 隔离迁移/冲突/回滚/恢复夹具；不得认领或覆盖用户文件 |
| 10 个 Skill 与9份标准 | 技能标识、安装路径、意图判定、规则编号、[M]/[J] 划分 | 语料与目录一致性、机械结构检查；业务事实缺失保留 Pending |
| 设计模型与文档产物 | JSON Schema、稳定 ID/引用、draw.io 语义/几何、Markdown/DDL/OpenAPI 结构 | 模型、布局及文档回归；语义与最终渲染需额外证据 |

本包没有 npm `main` 库入口，也未把 `lib/verify.js` 等私有模块声明为宿主 API。目录里存在库文件不意味着允许外部依赖其私有函数签名；外部通过已发布 CLI 或公开协议调用。

`validate-model` 使用随包分发的 `_design-model.schema.json` 做完整 JSON Schema 2020-12 结构校验，再保留稳定 ID、引用与 Profile 的原 DM 诊断。类型、枚举、const、未知属性等违约返回 `DM019`；Schema 无法加载/编译返回 `DM020`，不能降级为宽松通过。空集合仍按现有 Schema 允许，并保留 DM102–DM104 警告；这不证明设计语义完整。扩展模型字段需按版本演进公开 Schema，不能依赖旧验证器曾漏检的输入。

## 执行所有权

`lib/executors.json` 发布只读执行器与参数 Schema，`lib/executor-invoke.js` 维护本包领域到原 CLI 的参数映射。共用辅助层负责协议校验、真实 status 准入、路径边界及子进程生命周期；它不定义 Design 的业务规则。宿主不维护 spec/db/api/flowchart 的 CLI 参数副本。

| executorId | 对应 Skill 领域 | 原执行器 |
|---|---|---|
| `verify-spec` | requirements.spec | `verify spec --file <target>` |
| `verify-flowchart` | requirements.flowchart | `verify flowchart --file <target>` |
| `verify-db` | data.database | `verify db --file <target>` |
| `verify-api` | api.restful | `verify api --file <target>` |

每个执行器的 `parameters.targets` 恰好包含一个文件或目录，必须与真实任务计划目标一致。文件检查不扩展到兄弟文件，目录检查按原领域验证器范围执行。布局生成、安装/恢复、业务修复不属于这个只读执行入口。

请求必填 `operation:"execute"`、`projectRoot`、`runId`、`executorId`、`parameters`。稳定 execute 不沿用旧判定请求的 cwd 默认根；缺失项目根直接拒绝。先建立同包同 runId 任务，并遵守真实允许的领域与动作。请求文件宜放在项目外，避免改变目标范围快照。

执行结果保留原 `status`，附 `executorId`、`execution` 与公开 `integration`。业务检查退出 1 时返回真实失败 stdout/回执，但完成调用的信封仍可 `ok:true`。`mechanicalOk` 只说明已执行机械项；`validationStatus=partial`、skip 与语义/渲染未验证必须保留。收到 SIGTERM/SIGINT 立即终止执行器进程树；仅对本次调用中新产生且没有完成回执的真实开始记录，补执行失败、验证未验证的中断终态，checks/checkedFiles 均为空，不伪造业务结果，也不更改本次调用前已有的开始记录。启动失败或输出超过 4 MiB 明确报错。

## 持续演进

同一原检查器新增规则/Skill，由本包更新目录、规范和语料，宿主读取 describe 即可。新增执行器必须同时交付 Schema、副作用/授权声明、原检查器接线与单包验收；不能只加一条能力目录。CLI 旗标变化由本包适配与兼容测试承担。未知 Schema、目录加载错误、不支持的执行器或参数应明确拒绝，不能自动换成根目录扫描。

## 成熟度的实际限制

10 个 Skill 提供可发现的指导流程，四域验证器执行确定的机械子集。流程图布局与验证器共享 XML 属性读取、有限数值/尺寸及每页 `parent` 无环检查，缺失引用、父环或非法几何不属于合法图；跨页复用 ID、`source/target` 业务回路、单引号 XML 属性与科学计数数值继续允许，`edgeLabel` 可省略宽高。布局回归能证明指定活动结构、文字空间与整体几何，不等于所有 draw.io 形状、字体和最终宿主渲染都已验收。未覆盖机械项保持 skip；语义、业务事实、真实编辑器加载/模型读取和最终视觉验收需要各自证据。完整生命周期及旧版迁移是独立于协议的发布门。

规则目录、中文提示名称和验证覆盖从本包标准共用一个解析器读取，支持 F01 等规则及 FC-01 等复合 ID。带 M/J 类别的清单优先于解释表；任务不会因解析遗漏静默丢掉 FC 联查约束。流程图 FC-01–FC-03 继续作为未实现的机械项输出 skip 并保留为 pendingChecks，调用方必须展示这项限制。

进入 1.x 应承诺上述完整公开面的兼容性及明确限制，不能把协议通过、模板存在或测试数量等同于所有设计能力自动执行和完整通过。语义、宿主/模型事件和最终渲染的公开限制本身不阻止 1.x；兼容承诺建立在正式产物普通升级、精确输出/退出码及受管资产回归证据上。

## 1.x 兼容承诺

承诺范围是本文件列出的公开 CLI、协议、模型 Schema、技能/规则身份与受管资产生命周期。以发布包的帮助、describe、分发 Schema 和文档共同确定支持面，不将私有 `lib/*.js` 函数、XML 内部遍历顺序、未声明的参数组合或内部事件存储文件当作外部 API。本包没有 npm `main`/`exports` JavaScript 库入口；消费者应调用 CLI 或公开协议。

- **CLI 与结果**：保留已经支持的命令、选项、合法输入形式、默认目标语义、退出码与机器可读字段类型。原判定请求的 cwd 默认根和 execute 的必填 projectRoot 是各自现有契约。原 CLI 的 `--json` 输出及 protocol 信封保持可解析；新增可选输出字段可以兼容扩展，删除/改名/改类型、把业务失败当成功或改变 `ok` 含义需要破坏性版本声明。
- **完整验证语义**：保留 `mechanicalOk`、`partial`、skip、unverified、stale 以及真实 checkedFiles/回执的区别。补齐检查可以发现原来未检测的真实问题，需发布变更说明与规则身份/版本；不能把未执行项改为通过，不能将同一规则 ID 改成无关规则。已合法的模型输入若因新增 required、收紧类型/枚举/const/长度而被拒绝，是公开契约的破坏性变化；拒绝原 Schema 已禁止而旧实现漏检的输入属于校验缺陷修复。
- **模型与扩展**：`design-model` 的 schemaVersion、稳定 ID、引用和 Profile 协议版本是公开格式。Schema 目前各对象使用 `additionalProperties:false`，没有任意未知字段的隐式扩展槽；使用现有 `profiles` 已声明字段，或先按版本扩展公开 Schema。增加 Schema 接受面与解析支持可按兼容扩展发布；新模型格式必须有版本边界与迁移说明，不能继续用 schemaVersion=1 偷换原格式。默认分发 Schema 与原 CLI 必须保持同义。
- **受管资产与升级**：安装路径、包命名 gateway、Skill/标准标识和 state 所有权格式属于生命周期兼容面。变更路径或 state schemaVersion 必须提供受控迁移或明确不兼容边界；未知状态不能被重新认领为本包所有。正常 update/restore/uninstall 始终依据真实所有权和字节哈希保护用户、其他包及自定义 Profile 内容；`--force` 不扩大文件所有权。保留旧版本真实产物的普通升级与混合版本验收，不通过强制覆盖来宣称兼容。
- **协议与宿主**：协议版本、executor-invoke feature 和参数 Schema 分别演进；未声明的执行器、未知参数、目录加载错误及失效计划应明确拒绝。内部 CLI 旗标变化由本包映射承担，宿主不复制业务参数表。包升级可以使旧计划/证据过期，须保留可识别的 stale/版本漂移回执并要求重新计划，不能静默继续执行。

后续 1.x 版本继续保留原 CLI 与单包完整生命周期，不要求兄弟包、Harness 或模型 API 凭据。未实现的 FC 联查/OpenAPI YAML 子项、设计语义、真实编辑器/模型事件、最终字体渲染与尚无真实 Windows 验证的取消边界保持公开说明；这些限制不能被包装成全部设计能力已自动验证。
