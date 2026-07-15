# Skill 维护清单

## 已发布

| Skill | 版本 | 主要规范 | 验证口径 |
|-------|------|----------|----------|
| `requirements-flowchart` | 1.1 | `01-flowchart.md` | 20 项 |
| `requirements-prototype` | 1.1 | `02-prototype.md` | 23 项 |
| `requirements-spec-doc` | 1.1 | `06-spec-doc.md` | 43 项 |
| `data-database-design` | 1.1 | `03-database.md` | 34 项 |
| `api-interface-design` | 1.1 | `04-api-design.md` | 38 项 |
| `cross-design-review` | 1.1 | `07-design-review.md` | D4 18 项 / RV 12 项 |
| `cross-glossary` | 1.1 | `08-glossary.md` | 18 项 |
| `cross-change-impact` | 1.1 | `09-change-impact.md` | 20 项 |

所有已发布 Skill 均采用平铺原生目录、最小 frontmatter、相对资源链接、空白模板与匿名合成样例。人读说明位于 `files/.github/guides/skills/`。

## 规划中

| Skill | 优先级 | 说明 |
|-------|--------|------|
| `code-architecture` | 中 | 代码分层、领域模型和依赖方向；仅在规范与回归集完整后发布 |
| 测试用例与验收标准 | 中 | 从 IPO、状态机和异常流推导 Given-When-Then |
| 非功能需求 | 中 | 性能、容量、可用性、安全和数据保留画像 |
| 数据指标与埋点 | 低 | 从功能与状态变化推导事件、维度和指标口径 |

规划项不得以不完整 Skill 目录占位；只在 `_manifest.json` 的 `planned` 区登记。

## 发布质量条件

- Skill 目录名与 `name` 一致，正文少于 500 行。
- manifest、registry、prompt 和路由回归一致。
- 模板无业务值，样例无敏感信息。
- validate/review/impact 默认只读。
- 缺设计画像时不强加 MySQL、统一响应、分页或并发默认值。
- `npm run verify`、审计、打包预检全部通过。
