---
mode: agent
description: '验证 draw.io 流程图是否符合 wl-skills-design 规范，输出结构化报告'
tools:
  - read_file
---

## 验证流程图（wl-skills-design 规范）

### 第一步：加载规范

读取 `.github/standards/01-flowchart.md`，作为验证基准。

---

### 第二步：读取目标文件

读取用户指定的 `.drawio` 文件（或当前对话中提到的文件路径）。

---

### 第三步：逐项检查（15 项）

对文件内容逐一核查，标记每项结果（✅ PASS / ❌ FAIL / ⚠️ WARNING）：

| 项 | 检查内容 | 检查方式 |
|----|---------|---------|
| 1 | 存在 Tab 1「流程标准定义」图例页 | `<diagram name>` 包含「流程标准定义」 |
| 2 | 外层容器：蓝色（`fillColor=#dae8fc`），标题字号 22px | 检查 `childLayout=stackLayout` 容器 style |
| 3 | 子泳道：灰色（`fillColor=#f5f5f5`），标题字号 18px | 检查直接子 swimlane style 和 value |
| 4 | 每个操作节点是 3 层 GROUP（code / name / dept） | 检查所有 `style="group"` 是否有 3 个子 cell |
| 5 | GROUP 宽度 ≈ 76.82px，总高 ≈ 54px | 检查 `<mxGeometry>` 的 width 和 height |
| 6 | code 层：10px 字体，无自定义 fillColor（白底） | 检查第一子层 style 不含非白 fillColor |
| 7 | name 层（第二子层）：颜色匹配模块色标 | 检查 fillColor 在色标表中 |
| 8 | dept 层（第三子层）：`fillColor=#eeeeee` | 检查最后子层 fillColor |
| 9 | 开始/结束：`shape=mxgraph.flowchart.terminator`，`fillColor=#76608a` | 检查 terminator 节点 style |
| 10 | 所有判定菱形（rhombus）的出线有「是/否」标签 | 检查 rhombus 的边 value 或 edgeLabel |
| 11 | 所有连接线使用 `edgeStyle=orthogonalEdgeStyle` | 检查 edge 类型，无斜线 |
| 12 | 节点无几何重叠（同泳道内 x/y/w/h 不交叉） | 计算同 parent 下节点的 bounding box 是否有交集 |
| 13 | 线下操作节点有 `dashed=1` | 检查 M 类编码节点的 GROUP style |
| 14 | 活动编码格式符合规范（含字母段和数字段） | 正则验证编码层 value 的文本内容 |
| 15 | 模块色标无串色（同流程域用同一色系） | 检查 name 层 fillColor 的一致性 |

---

### 第四步：输出验证报告

按以下格式输出（不省略任何项）：

```
## 验证报告：[文件名]

生成时间：[当前时间]

### 总体结论
[✅ 全部通过 / ❌ 存在问题 / ⚠️ 存在警告]   通过 X / 15 项

---

### ❌ 不合格项（需修复）

- **第 N 项 [检查项名称]**
  - 问题：[具体描述，包含 cell id 或节点名称]
  - 修复方案：[一句话说明如何修复]

---

### ⚠️ 警告项（建议改进）

- **第 N 项 [检查项名称]**
  - 说明：[描述]
  - 建议：[改进方向]

---

### ✅ 通过项

- 第 1 项：图例页存在
- 第 2 项：外层容器色标正确
- ...（逐项列出）
```

---

### 第五步：询问自动修复

如果存在不合格项，询问：

> 是否需要自动修复上述问题？（需要 `replace_string_in_file` 工具权限）

如用户同意，逐项执行修复，每项修复后告知结果。
