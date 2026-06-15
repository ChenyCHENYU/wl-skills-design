# 变更影响分析 Skill 使用说明

## 适合场景

- “把点检状态新增一个退回状态，会影响哪些文档？”
- “接口新增字段，需要同步哪些 spec/DB/原型内容？”
- “开发反馈字段名要改，帮我出补丁计划”
- “评审发现 DB 和 API 字段不一致，分析修复路径”

## 推荐输入

```text
变更对象：点检状态 inspectionStatus
变更动作：新增状态
目标描述：新增 REJECTED=已退回，退回后允许重新提交
涉及模块：设备点检 EQIP001
已有文档：docs/spec/equipment/4.1-inspection.md、docs/db/01-inspection.md、docs/api/01-inspection.md、docs/prototype/01-inspection-list.html
```

## 输出内容

- 变更登记
- spec / glossary / DB / API / prototype / review 影响矩阵
- P0/P1/P2 补丁任务清单
- 推荐执行顺序
- CI-A/B/C/X 验证报告

## 与其他 Skill 的关系

本 Skill 负责“分析和排程”，不替代单域 Skill：

- 改 spec：继续使用 `requirements/spec`
- 改 DB：继续使用 `data/database`
- 改 API：继续使用 `api/restful`
- 改原型：继续使用 `requirements/prototype`
- 最终评分：继续使用 `cross/design-review`
