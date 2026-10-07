---
name: wl-skills-design
description: 需求说明书、流程图、原型、数据库与接口设计、设计评审、术语词典、变更影响和文档接入的 WL 设计任务入口；每次相关任务先判定路由及规则覆盖。
---

# WL 设计任务入口

此入口仅帮助宿主发现本包；业务规范以项目 `.github/skills/_manifest.json` 和所选 canonical `SKILL.md` 为准，按需读取，避免复制规则。

1. 每次任务先执行 `wl-skills-design task --input "<完整任务>" --target . --json`，记录实际返回的 `runId`、判定、候选、适用规则与未验证项。
2. `matched` 或 `baseline` 只代表任务判定；按返回路径读取 canonical Skill 和标准。`ambiguous` 先消除意图歧义，`gap` 明示缺口并保留规则建议，`not-applicable` 表示本包不适用。
3. 遵守 canonical Skill 的写入授权边界。CLI 的计划和文件哈希不能当作模型已读取或实际完成的证据；模型对读取/执行的陈述标为“模型声明”。
4. 实际验证用 `wl-skills-design verify <domain> --run-id <runId> --json`，只报告回执中已执行的机械检查，语义检查及跳过项仍待核验。用 `status --run-id <runId> --json` 读取新鲜度与真实覆盖；用 `doctor --host codex --json` 检查入口可用性。

同一用户任务跨已安装且适用的包复用同一 `--run-id <id>` 或 `WL_TASK_RUN_ID`；本包仍可独立使用，无需安装其他 WL 包。
