---
name: code-architecture
description: Design or validate implementation-ready module boundaries, frontend/backend layering, dependency direction, contracts, quality gates, and traceability without generating business code. Use for code structure, module decomposition, layered architecture, bounded contexts, package layout, or development-ready architecture design; do not use for ordinary code review or dependency upgrade analysis.
---

# 代码结构设计

## 输入门禁

至少确认模块边界和目标技术栈。缺失业务事实使用 `【待补充：说明】`，不得推断组织、模块码、接口地址或平台能力。

上游设计文档可用但不是必需依赖：

- 有需求说明、原型、数据库/API 设计时读取并保留其稳定 ID。
- 只有已评审需求文档时，从需求建立本次架构事实表并标注来源。
- 不得要求项目必须安装其他 wl-skills 包。

## 工作流

1. 读取 [代码设计规范](../../standards/05-code-design.md) 和 [WL 交付兼容协议](../../guides/delivery-compatibility.md)。
2. 建立模块职责、所有者、输入、输出、数据所有权和禁止依赖清单。
3. 分别定义前端、后端、数据与集成边界；跨边界只通过显式契约通信。
4. 选择内置 `jh4j3-openapi3@1.0` 或显式自定义 profile；偏差必须登记。
5. 使用 [架构设计模板](templates/architecture-design.md) 输出开发就绪设计。
6. 对照 [匿名合成样例](examples/01-architecture-design.md) 做完整性自检。
7. 执行 AC01–AC20；存在 P0 或待确认接口事实时不得标记开发就绪。

## 输出

- 模块与依赖矩阵。
- 前后端分层和目录建议。
- API/数据/权限契约边界。
- 质量门、测试层级和发布证据。
- 风险、偏差、暂挂项和验证结果。

本 Skill 只设计结构，不直接生成业务代码；代码生成由对应项目内的前端或后端工具独立完成。
