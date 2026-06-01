# 接口设计 Skill — 使用说明（USAGE）

> 面向人读。AI 调度以 `SKILL.md` 为准。

## 这个 Skill 做什么

把需求说明书（spec）里的功能，转成一套可联调的接口设计：接口清单 → 每个接口（触发条件 / 请求报文 / 应答报文 / JSON 示例），覆盖系统集成报文与 HTTP/RESTful 两类，强制编码唯一、统一响应包装、错误码、安全设计，并与 spec 功能 + DB 字段做联动校验，最后跑 38 项验证闭环出报告。

## 触发方式

在对话里说：

- 「帮我设计 {模块名} 的接口」
- 「根据需求说明书生成订单下达推送接口」
- 「审查这份接口设计是否符合规范」

## 产出物

```
docs/api/
├── 00-api-overview.md       ← 接口清单 + 错误码清单 + 安全说明
├── 01-{模块名}.md            ← 模块接口（逐接口 4 段）
└── reports/
    └── IF_REVIEW_{模块}_{日期}.md
```

## 核心保证

| 保证 | 来源 |
|------|------|
| 接口编码递增唯一（杜绝重复）| `standards/04-api-design.md §二` + IF-A02 |
| 统一响应包装 `{code,msg,data,traceId}` | `§4.3` + IF-B05 |
| 错误码规范 + 安全 + 幂等 | `§五/§六/§七` |
| 字段英文名与 DB 一致 | `§九` + IF-X03 |
| 38 项验证 + 自动修复 | `§十`~`§十二` |

## 配套文件

- 规范：`.github/standards/04-api-design.md`
- 生成：`.github/prompts/create-if-design.prompt.md`
- 验证：`.github/prompts/validate-if-design.prompt.md`
