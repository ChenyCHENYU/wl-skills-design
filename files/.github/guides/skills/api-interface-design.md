# 接口设计 Skill — 人读指南

> 面向人读。AI 调度以 `SKILL.md` 为准。

## 这个 Skill 做什么

把需求说明书（spec）里的功能转成可联调的接口设计：先声明契约、认证、响应、分页、版本、幂等与错误模型画像，再输出接口清单、报文、示例和可选 OpenAPI 3.1，并与 spec 功能和 DB 字段做联动校验。验证默认只读，共 38 项。

## 触发方式

在对话里说：

- 「帮我设计 {模块名} 的接口」
- 「根据需求说明书生成申请状态事件接口」
- 「审查这份接口设计是否符合规范」

## 产出物

```
docs/api/
├── 00-api-overview.md       ← 接口清单 + 错误码清单 + 安全说明
├── 01-{模块名}.md            ← 模块接口
├── openapi.yaml             ← contract=OpenAPI 3.1/both 时
└── reports/
    └── IF_REVIEW_{模块}_{日期}.md  ← 仅用户要求保存时
```

## 核心保证

| 保证 | 来源 |
|------|------|
| 接口编码递增唯一（杜绝重复）| `standards/04-api-design.md §二` + IF-A02 |
| 响应、错误与分页符合已声明接口画像 | `§一/§三/§五` + IF-B05/B09 |
| 错误码、安全与幂等符合接口画像 | `§五/§六/§七` |
| 持久化字段稳定 ID 能映射到词典和 DB，例外有证据 | `§九` + IF-X03 |
| 38 项只读验证（`verify api` 执行 [M] 项）；明确授权后修复并复验 | `§十`~`§十二` |

## 配套文件

- 规范：`.github/standards/04-api-design.md`
- 生成：`.github/prompts/create-if-design.prompt.md`
- 验证：`.github/prompts/validate-if-design.prompt.md`
