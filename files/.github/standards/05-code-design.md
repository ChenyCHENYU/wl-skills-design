# 05 — 代码设计规范

> ✅ v1.0 — 设计开发就绪的模块、分层、依赖和质量门，不生成具体业务代码。

## 一、独立与兼容

1. 每个前端、后端或设计包必须能够仅凭已评审需求独立建立自己的机器契约。
2. 包之间不得形成运行时硬依赖；共享 `profileId + protocolVersion` 形成天然兼容。
3. 上游稳定 ID 是可选增强，不得作为 kit/bd 启动前提。
4. 对方 manifest 存在时必须做严格握手；不存在时必须用内置 profile 自校验。

## 二、模块边界

- 一个业务事实只能有一个数据所有者。
- 模块必须声明职责、输入、输出、数据所有权、对外契约和禁止依赖。
- 禁止循环依赖、跨层调用和跨模块直接访问对方持久层。
- 共享能力只能包含稳定的横切机制，不得成为业务逻辑堆放区。

## 三、分层

### 前端

`route/page → page hook/composable → API service → transport`。页面不得拼接未声明 URL，不得用 mock 或提示消息冒充完成的业务操作。

### 后端

`Controller → Service → Mapper/Repository`。Controller 负责协议和权限，Service 负责事务与业务不变量，Mapper 只负责持久化。

### 数据

实体、创建 DTO、更新 DTO、查询 DTO、VO 分责；租户、软删、审计、并发字段由 profile 明确，不得隐式猜测。

### 集成方案与复杂度

- 先复用当前公共 Service、Feign 客户端、DTO 和已生效接口，明确调用方、数据所有者及完成口径。单进程内复用 Service；跨服务同步动作可用现有 Feign，不因“跨服务”自动增加 HTTP 兜底、outbox、锁或仅转发的公共层。
- 同一数据库不意味着跨进程调用共享本地事务；设计中注明实际事务与提交边界。需要异步投递、恢复或并发机制时，用已确认需求说明为什么需要、谁持续驱动、失败如何恢复，以及如何验证最终效果。
- 必经业务链路不无故默认关闭。已有灰度、维护或降级机制需有明确关闭结果，不能静默跳过后报完成；认证、权限和契约必填约束保留。
- 对采用时间水位、消息领取或回写状态的方案，列出同值跨页、领取后崩溃和回写零行等适用失败场景。未确认的归属、阈值与成功条件标为待确认，不再加一层猜测性校验。

这些是方案评审要求；静态结构检查不能证明它们已在运行中成立。事务语义参考 [Spring 事务说明](https://docs.spring.io/spring-framework/docs/5.3.39/javadoc-api/org/springframework/transaction/annotation/Transactional.html)。

## 四、契约

- 默认 API 采用 [WL 交付兼容协议](../guides/delivery-compatibility.md)。
- 自定义操作必须声明 name、method、path、request、response、permission 和错误语义。
- 破坏性偏差必须显式登记 profile/deviation 并由前后端共同确认。
- `externalId` 可选映射：页面→`screen.id`，后端实体→`table.id`，字段→`field.id`。

## 五、质量闭环

产物状态分为 `draft / skeleton / implementation-ready / verified`。含待确认事实、占位异常、占位交互或未执行关键测试时，不得标记 `verified`。

生成闭环：输入校验 → 生成计划 → 冲突检查 → 应用 → 静态检查 → 构建/编译 → 测试 → 合同 diff → 证据归档。任何写入失败必须回滚或明确报告部分状态。

## 六、AC01–AC20

- AC01 范围和需求基线明确；AC02 模块职责唯一；AC03 数据所有权唯一；AC04 无循环依赖。
- AC05 前端分层明确；AC06 后端分层明确；AC07 DTO/VO/Entity 分责；AC08 跨模块仅走契约。
- AC09 profile/version 明确；AC10 CRUD method/path 一致；AC11 请求/响应一致；AC12 权限一致。
- AC13 租户/软删/审计/并发明确；AC14 自定义操作语义完整；AC15 偏差显式；AC16 稳定 ID 映射正确。
- AC17 单元测试边界明确；AC18 集成/合同测试明确；AC19 构建和发布门明确；AC20 暂挂项均有责任人与阻断状态。
