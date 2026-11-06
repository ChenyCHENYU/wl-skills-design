---
name: wl-skills-design
description: 梳理需求、编写需求说明书、绘制流程图、原型、数据库与接口设计、设计评审、术语词典、变更影响和文档接入。用于目标自身已接入本包的项目；不继承父目录安装，不适用移动端或未接入项目。
---

# WL 设计任务入口

显式调用示例：`$wl-skills-design 请在 <项目绝对路径> 中 <完整任务>，先展示 task 回执，再执行授权范围内的工作，结束展示同 runId 的 status。` 支持原生技能的宿主可按名称调用；其他宿主先读取本文件再执行下方本地命令。模型名称或安装成功不能证明宿主已经加载技能。

首条进度用 `notice.summary`（旧版用 `notice`）说明匹配了哪个技能、是否已运行设计命令、还有什么待检查。运行 CLI 后报告实际执行的命令与检查结果，结束用同一 runId 核对。包版本放在详情，失败说清原因，不能把路由命中说成技能已加载。

此入口仅帮助宿主发现本包；业务规范默认保留在所执行 npm 包内；按 task 返回的实际路径读取所选 canonical `SKILL.md` 和标准，项目已有覆盖优先，不猜测资源位置。

先确认目标项目自身的接入证据（本包安装清单、直接依赖或 `.wl-skills-scope.json` 显式启用），再判定任务。只在目标已接入且平台适用时读取规则；父目录安装、兄弟包、Vue 文件或触发词不能证明接入。未接入的开源项目不套用规则、不建议自动安装；UniApp/小程序/App/PDA/移动 H5 不适用。跨项目目标分别判定，沿最近项目边界停止，不能越过未接入子项目找父清单。工具返回 `scope` 作为静态范围证据，宿主加载仍需实际事件。

动作边界：显示真实回执中的 `action.mode`、`checksAllowed` 和 `ruleRefs`。历史引用与明确禁止的动作不参与技能评分。只解释或只列计划时可以读取相关规范，不能因为命中了生成/修复技能就自动检查或改写业务文件。检查许可仅表示任务动作；业务写入仍遵循用户授权和本包原有流程。非适用项目不加载规范。 只解释或核对适用规则时，使用 CLI `route`/`explain`。有实际后续工作才建立 `task` 记录。

多项目工作区先沿目标路径向上找到本包安装清单与项目 AGENTS，切到该项目根再调用工具；不要以聚合工作区根代替 projectRoot，也不要在聚合根安装。不同项目分别保存项目身份，同一用户任务复用 runId。

1. 每次相关任务从目标项目根执行 `node node_modules/@agile-team/wl-skills-design/bin/wl-skills-design.js task --input "<完整任务>" --target . --json`。编辑前必须向用户展示返回的 `notice`：匹配技能或基础约束、执行状态、待检查项和 runId；baseline、gap、not-applicable 也应说明。命令不可用或版本不一致时明确显示失败原因；本地执行器缺失仅可使用已有同版本缓存：`npx --offline --yes --package @agile-team/wl-skills-design@__WL_SKILLS_DESIGN_VERSION__ wl-skills-design task --input "<任务>" --target . --json`。无缓存报未执行，不联网下载或自动安装依赖；后续命令复用同一执行器。
2. `matched` 或 `baseline` 只代表任务判定；按返回路径读取 canonical Skill 和标准。`ambiguous` 先结合完整用户请求判断：已明确要求的组合步骤可拆成独立 task 并复用 runId；只有影响实现且上下文无法确定的选择才询问。`gap` 明示缺口并保留规则建议，`not-applicable` 表示本包不适用。
3. 遵守 canonical Skill 的写入授权边界。CLI 的计划和文件哈希不能当作模型已读取或实际完成的证据；模型对读取/执行的陈述标为“模型声明”。
4. 实际验证用 `wl-skills-design verify <domain> --run-id <runId> --json`，只报告回执中已执行的机械检查，语义检查及跳过项仍待核验。用 `status --run-id <runId> --json` 读取新鲜度与真实覆盖。静态入口诊断按当前实际宿主选择：ZCode 使用 `doctor-host --host zcode --json`，Codex 使用 `doctor-host --host codex --json`；复用前述同版本执行器，入口存在不代表宿主已经加载。

同一用户任务跨已安装且适用的包复用同一 `--run-id <id>` 或 `WL_TASK_RUN_ID`；本包仍可独立使用，无需安装其他 WL 包。
