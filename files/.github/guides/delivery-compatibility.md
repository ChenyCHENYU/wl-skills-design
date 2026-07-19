# WL 交付兼容协议 v1

## 定位

四个包必须可独立安装和独立工作。兼容协议是内置约定，不是运行时包依赖：

- 没有安装 `wl-skills-design` 时，kit 和 bd 可直接从已评审需求分别建立前端页面契约和后端代码契约。
- 安装了 design 时，可额外使用稳定 ID 追踪，但下游不得把 design 产物作为启动前提。
- kit 与 bd 使用同一 `profileId + protocolVersion` 即可进行机械兼容检查；存在对方 manifest 时再增强为严格握手。
- 自定义接口允许使用自定义 profile，但 method、path、请求、响应、权限和偏差原因必须显式声明，不得静默猜测。

机器快照见 [`wl-delivery-profile.v1.json`](../contracts/wl-delivery-profile.v1.json)。

## 默认 API 约定

默认 profile 为 `jh4j3-openapi3`、协议版本为 `1.0`：

| operation | method | relative path |
|---|---|---|
| page | POST | `queryPage` |
| detail | GET | `getById/{id}` |
| create | POST | `save` |
| update | PUT | `updateById` |
| remove | DELETE | `deleteById/{id}` |

成功码为 `2000`；分页请求使用 `current/size`，分页响应使用 `data.records/data.total`；更新显式携带 `revision`；权限码使用 `{module}:{resource}:{operation}`。

## 可选稳定 ID 映射

| 消费方 | externalId 对应 design-model |
|---|---|
| 前端页面 | `screen.id` |
| 后端实体/聚合根 | `table.id` |
| 前后端字段 | `field.id` |

这些映射全部可选。未使用 design 时，kit/bd 仍必须使用各自契约内的稳定 `contractId`、字段名和 operation name 完成闭环。

## 严格但不僵化

默认 CRUD 必须遵循 profile；业务命令、主从查询、导入导出等扩展操作可增加。确需偏离默认 profile 时必须：

1. 使用新的 profileId 或显式 deviation；
2. 同时声明 method/path/request/response/permission；
3. kit 与 bd 在联调前对同一份 manifest 做严格比较；
4. 未确认项作为阻断项，不生成看似可用的占位业务行为。
