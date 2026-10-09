---
name: wl-skills-design
description: 需求说明书、流程图、原型、数据库与接口设计、设计评审、术语词典、变更影响和文档接入的 WL 设计任务入口；每次相关任务先判定路由及规则覆盖。
---

# WL 设计任务入口

此入口仅帮助宿主发现本包；业务规范以项目 `.github/skills/_manifest.json` 和所选 canonical `SKILL.md` 为准，按需读取，避免复制规则。

多项目工作区先沿目标路径向上找到本包安装清单与项目 AGENTS，切到该项目根再调用工具；不要以聚合工作区根代替 projectRoot，也不要在聚合根安装。不同项目分别保存项目身份，同一用户任务复用 runId。

1. 每次相关任务从目标项目根执行 `wl-skills-design task --input "<完整任务>" --target . --json`。编辑前必须向用户展示返回的 `notice`：实际包名/版本、判定、专项 Skill 或基础约束、规则编号与名称、目标、runId 和未验证项；baseline、gap、not-applicable 也应说明。命令不可用或版本不一致时明确显示失败原因，不能静默跳过。
2. `matched` 或 `baseline` 只代表任务判定；按返回路径读取 canonical Skill 和标准。`ambiguous` 先消除意图歧义，`gap` 明示缺口并保留规则建议，`not-applicable` 表示本包不适用。
3. 遵守 canonical Skill 的写入授权边界。CLI 的计划和文件哈希不能当作模型已读取或实际完成的证据；模型对读取/执行的陈述标为“模型声明”。
4. 实际验证用 `wl-skills-design verify <domain> --run-id <runId> --json`，只报告回执中已执行的机械检查，语义检查及跳过项仍待核验。用 `status --run-id <runId> --json` 读取新鲜度与真实覆盖；用 `doctor --host codex --json` 检查入口可用性。

同一用户任务跨已安装且适用的包复用同一 `--run-id <id>` 或 `WL_TASK_RUN_ID`；本包仍可独立使用，无需安装其他 WL 包。
