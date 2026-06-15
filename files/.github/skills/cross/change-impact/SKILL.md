---
name: cross-change-impact
description: >
  **变更影响分析技能** — 对已有 spec / glossary / DB / API / prototype / review 设计产物做跨文档影响分析，
  输出影响矩阵、补丁任务清单和复验顺序，把设计流程从一次性生成升级为增量协同。
  USE FOR: 字段/状态/接口/页面/流程变更影响分析；已有设计文档增量修改前的补丁计划；
  评审问题转修复任务；开发反馈导致的设计同步判断。
  DO NOT USE FOR: 从零生成单域设计文档（使用对应 create-* Skill）；最终集成评分（使用 cross/design-review）。
tools:
  - read_file
  - create_file
  - replace_string_in_file
---

# 变更影响分析规范（wl-skills-design）

---

## 核心定位

本 Skill 不直接替你“盲改所有文件”，而是先回答三个问题：

1. 这次变更会影响哪些设计产物？
2. 每个影响是否 P0/P1/P2？
3. 应按什么顺序调用哪些 Skill 修复和复验？

---

## 第一步：加载规范

```
.github/standards/09-change-impact.md
```

这是唯一权威来源，包含变更登记、影响传播规则、补丁任务格式和 CI-A/B/C/X 验证清单。

---

## 第二步：确认变更输入

必须拿到以下三项才可继续：

| 必填项 | 示例 |
|--------|------|
| 变更对象 | 字段 `inspectionStatus` / 状态 `CONFIRMED` / 接口 `EQIP001-IF-02` |
| 变更动作 | 新增 / 修改 / 删除 / 重命名 / 拆分 / 合并 |
| 目标描述 | 新增状态 `REJECTED`，退回后允许重新提交 |

缺任一项时，先追问，不得猜测。

---

## 第三步：加载模板与样例

模板：

```
.github/skills/cross/change-impact/templates/change-impact-report.md
```

真实样例：

```
.github/skills/cross/change-impact/examples/01-status-change-impact.md
```

生成结果须对照样例自检，影响域不得少于 spec / glossary / DB / API / prototype / review 六类判断。

---

## 第四步：执行 Sub-Skill

| 任务 | Sub-Skill |
|------|-----------|
| 采集变更与现有设计产物 | `sub/01-change-intake.md` |
| 生成跨域影响矩阵 | `sub/02-impact-matrix.md` |
| 输出补丁任务和复验顺序 | `sub/03-patch-plan.md` |

---

## 闭环工作流

```
[阶段1] generate：形成变更登记 + 影响矩阵 + 补丁计划
      ↓
[阶段2] validate：执行 09-change-impact.md 的 CI-A/B/C/X 检查
      ↓ 有失败项？
[阶段3] repair：补齐缺失影响域、任务路径、责任 Skill、复验入口
      ↓
[阶段4] revalidate：P0/P1 均闭合或有 NA 理由 → ✅ DONE
```

---

## 输出要求

必须输出：

- 变更登记
- 影响矩阵
- P0/P1/P2 补丁任务
- 推荐执行顺序
- 阻断项或暂挂项
- CI 验证报告

禁止只输出泛泛建议。
