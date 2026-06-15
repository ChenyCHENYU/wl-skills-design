---
mode: agent
description: '分析设计变更对 spec / glossary / DB / API / prototype / review 的跨文档影响，输出补丁计划'
tools:
  - read_file
  - create_file
---

## 变更影响分析（wl-skills-design）

### 第一步：加载执行规则

读取：

1. `.github/skills/_manifest.json`
2. `.github/standards/09-change-impact.md`
3. `.github/skills/cross/change-impact/SKILL.md`
4. `.github/skills/cross/change-impact/templates/change-impact-report.md`
5. `.github/skills/cross/change-impact/examples/01-status-change-impact.md`

### 第二步：确认变更输入

必须确认：

| 必填项 | 说明 |
|--------|------|
| 变更对象 | 字段 / 状态 / 接口 / 页面 / 表 / 流程 / 词条 |
| 变更动作 | 新增 / 修改 / 删除 / 重命名 / 拆分 / 合并 |
| 目标描述 | 变更后的明确目标 |

缺任一项时先追问，不得继续生成。

### 第三步：读取已有设计产物

如果用户提供路径，按需读取：

- spec
- glossary
- DB
- API
- prototype
- review

未提供路径时仍可输出影响矩阵，但对应域标“暂挂”，并给出补齐建议。

### 第四步：生成影响矩阵

按六个域逐项判断：

```
spec / glossary / DB / API / prototype / review
```

每个域必须给出：

- 影响等级：P0 / P1 / P2 / NA
- 判断原因
- 需改文件
- 责任 Skill
- 复验入口

### 第五步：生成补丁任务清单

按 P0 → P1 → P2 排序。

每个任务必须包含：

- 文件路径
- 责任 Skill id
- 前置依赖
- 可验证完成标准

### 第六步：输出并自检

套用 `change-impact-report.md` 模板输出。

最后附 CI 验证报告：

- CI-A 输入完整性
- CI-B 影响覆盖
- CI-C 补丁可执行
- CI-X 跨文档一致性

有 A01/A02/A03 失败时状态为“阻断”；有 P0/P1 未形成任务时状态为“需修复”。
