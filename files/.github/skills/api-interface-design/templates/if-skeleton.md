# 接口分册骨架

```text
docs/api/
├── 00-api-overview.md
├── 01-{module}.md
├── openapi.yaml            # contract=OpenAPI 3.1/both 时
└── reports/                # 仅用户要求保存报告时
```

## `00-api-overview.md`

```markdown
## 接口 profile
{contract/protocol/auth/response/error/pagination/version/idempotency/dateTime/decimal/batch}

## 接口清单
| API 稳定 ID | 编码/operationId | 名称 | 类型/协议 | 提供方→消费方 | 功能 ID | 字段 ID | 数据落点 |

## 错误模型
{HTTP 状态、稳定错误标识、字段问题和追踪策略}

## 安全与演进
{认证、授权、隐私、日志、速率、版本、弃用}
```

## 每个接口

```markdown
### {API-ID} {接口名称}
1. 元信息与触发
2. 请求 schema
3. 成功响应 schema
4. 错误响应
5. 匿名合成示例
6. 安全、可靠性与兼容性
7. spec/词典/DB/原型追溯
```

不得创建任意命名文件；Markdown 与 OpenAPI 重复信息必须保持一致。
