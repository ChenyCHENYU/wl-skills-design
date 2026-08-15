---
name: requirements-spec-doc
description: 生成或检查需求设计说明书章节，覆盖总体设计、业务流程、功能 IPO、内部接口、权限、数据需求和报表，并维护功能、流程、页面、字段之间的追溯。用于需求说明书、功能设计、IPO 表、流程说明和画面逻辑；不要用于 OpenAPI、数据库 DDL 或流程图 XML。
---

# 需求设计说明书

## 模式与文件边界

- `create`：生成指定章节并验证本轮产物。
- `validate`：只读执行 43 项检查。
- `review`：与 `validate` 相同，只读给出评审结论，不默认保存报告。
- `repair`：用户明确授权后修改既有说明书。

只允许写入模板定义的五类文件，不得创建 `PLAN007-ipo.md`、`flow-xxx.md` 等任意命名文件。先读取 [文档骨架](./templates/doc-skeleton.md) 确认目标位置。

## 执行流程

1. 读取唯一规则源：[需求说明书标准](../../standards/06-spec-doc.md)。
2. 按章节选择资源：
   - [总体设计](./sub/01-overview.md)
   - [模块流程与内部接口](./sub/02-module-flow.md)
   - [功能 IPO](./sub/03-function-ipo.md)
   - [数据需求与报表](./sub/04-data-report.md)
3. 仅在需要结构对照时读取 `examples/` 下的匿名合成样例；命令按钮处理逻辑达不到步骤级要素时，对照 [IPO 颗粒度样例](./examples/05-ipo-granularity.md) 补齐。
4. 命令按钮的 Process 必须满足标准 §5.1 按钮级覆盖和 §5.2 GB 颗粒度基线；执行类活动与命令按钮一一对应。
5. 保持流程编码、活动编码、功能编码、页面、权限岗位和字段集合可追溯。
6. 记录 `deliveryFormat`：Markdown 阶段为 `markdown-source`，装配并渲染后的 Word 为 `final-word`。
7. 执行标准第十一章 43 项验证：先运行 `wl-skills-design verify spec` 获取 [M] 项机械结论（CLI 不可用时由 Agent 代执行），再逐项判定 [J] 项，合并为同一编号的报告。`markdown-source` 的 P01–P05 标记 Pending，不得判失败；缺业务事实使用 `【待补充：说明】` 并标记 Pending。

## 交付约束

- 流程部分和 IPO 部分写入同一子模块文件。
- 验证报告给出规则 ID、文件位置和差异集合，不能只写“已检查”。
- 验证模式不修改既有文件；创建模式只修复本轮新内容。
- 最终说明 Skill、章节路径、43 项结果和跨文档差异。
