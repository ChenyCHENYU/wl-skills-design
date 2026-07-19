# 匿名任务管理模块代码结构设计（合成样例）

## 范围

需求基线为 `REQ-TASK-001`，使用 `jh4j3-openapi3@1.0`。本样例仅展示结构，不包含真实组织或项目数据。

## 模块职责

| 模块 | 职责 | 数据所有权 | 对外契约 | 禁止依赖 |
|---|---|---|---|---|
| task-web | 查询、编辑和状态操作页面 | 无 | task-api | 数据库 Mapper |
| task-service | 任务 CRUD 与状态规则 | TASK_TABLE | `/task/task/queryPage` 等 | 前端组件 |

## 分层

- 前端：route page → page hook → API service → transport。
- 后端：Controller → Service → Mapper；租户、软删和 revision 在 Service/SQL 门控。
- 跨模块只依赖版本化 API 契约，不读取对方源码目录。

## 质量门

- 前端：契约校验、lint、typecheck、unit、build。
- 后端：契约校验、javac/Maven、单元、集成、质量 profile。
- 联调：method/path/request/response/permission/revision 全量 diff。

## 自检

- 模块职责和数据所有权唯一。
- 依赖方向无环。
- profile、扩展操作和偏差均显式。
- 各包独立运行；对方 manifest 仅用于增强验证。
- 无待确认占位，因此可进入代码契约编制。
