---
name: cross-change-impact
description: 对字段、状态、接口、页面或流程变更做只读跨文档影响分析，输出影响矩阵、P0–P2 补丁任务和复验顺序。用于变更影响、影响分析、增量设计、同步文档判断和评审问题拆解；不要用于分析代码依赖、软件包升级或未经授权批量修改设计文件。
---

# 变更影响分析

本 Skill 先分析再执行，默认不修改任何设计文件。

## 必要输入

必须确认变更对象、变更动作和目标描述。模块编码与文档路径可后补；缺少三项必要输入中的任意一项时，只追问该项。

## 执行流程

1. 读取唯一规则源：[变更影响标准](../../standards/09-change-impact.md)。
2. 按顺序执行：
   - [变更登记](./sub/01-change-intake.md)
   - [影响矩阵](./sub/02-impact-matrix.md)
   - [补丁计划](./sub/03-patch-plan.md)
3. 从 [匿名空白模板](./templates/change-impact-report.md) 开始，需要质量对照时读取 [匿名合成样例](./examples/01-status-change-impact.md)。
4. 对 spec、glossary、DB、API、prototype、review 六个域逐一给出“影响/不影响/待确认”及证据。
5. 执行 CI-A/B/C/X 共 20 项检查，输出 P0/P1/P2 任务和依赖顺序。

## 交付约束

- 默认在对话中返回分析；仅当用户明确要求保存时，才写入 `docs/change-impact/CHANGE_IMPACT_{对象}_{日期}.md`。
- 每个补丁任务包含目标文件、责任 Skill、前置依赖、完成条件和复验入口。
- 分析与验证只读；实际修改必须由用户另行授权并调用对应领域 Skill。
- 最终说明受影响域、阻断项、推荐顺序和保存状态；只有实际保存后才给出报告路径。
