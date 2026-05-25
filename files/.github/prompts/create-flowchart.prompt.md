---
mode: agent
description: '按照 wl-skills-design 规范，引导式创建 draw.io 流程图'
tools:
  - read_file
  - create_file
---

## 创建流程图（wl-skills-design 规范）

### 第一步：加载规范与模板

读取以下两个文件，作为后续所有操作的依据：

1. `.github/standards/01-flowchart.md` — 完整规范
2. `.github/skills/requirements/flowchart/templates/skeleton.drawio` — 骨架模板（XML 起点）

---

### 第二步：收集流程信息

向用户确认以下信息（未提供的才询问，已提供的直接使用）：

| 序号 | 信息项 | 示例 |
|------|--------|------|
| 1 | **流程名称** | 废钢加工生产管理流程 |
| 2 | **流程编码** | FGPM-A-01 |
| 3 | **所属模块**（用于选色标） | 生产管理 |
| 4 | **泳道列表**（部门顺序） | 生产调度、切割车间、成品下线 |
| 5 | **活动节点列表**（每个节点：编码、名称、岗位、类型、所属泳道） | 见下 |
| 6 | **判定节点**（可选：判定文字、是分支走向、否分支走向） | — |
| 7 | **输出文件路径** | 【01】流程图参考/xxx.drawio |

**节点类型说明：**
- `E` = 系统在线操作（金恒平台）
- `C` = 异质系统操作
- `M` = 人工/线下作业（虚线边框）
- `SUB` = 子流程引用（shape=process）

---

### 第三步：生成 draw.io XML

严格按照规范中的模板逐节生成：

1. **文件头**：`<mxfile>` 包含 2 个 `<diagram>`
2. **Tab 1**：直接复用 skeleton.drawio 中的图例页（`<diagram id="tab-legend">`）
3. **Tab 2**：
   - 外层容器：蓝色 swimlane，标题 22px，`childLayout=stackLayout`，`startSize=30`
   - 子泳道：灰色 swimlane，标题 18px，`startSize=25`，不写 x（由 stackLayout 管理），各泳道宽之和 = 外层宽
   - 每个活动节点：严格 3 层 GROUP（code 层 12px 高 / name 层 30px 高 / dept 层 12px 高），总高 54px，宽 76.82px
   - 开始/结束：`shape=mxgraph.flowchart.terminator`，紫色（`#76608a`）
   - 判定：菱形（`rhombus`），黄绿色（`#cdeb8b`），出线必须有标签
   - 连接线：`edgeStyle=orthogonalEdgeStyle`，**source 指向 name 层**（`n[x]-name`），**target 指向 code 层**（`n[x]-code`）；跨泳道时 **parent 必须为外层主容器 id**，不是子泳道 id
   - 活动编码格式：`[系统代码]-[类型]-[序号]`

**ID 命名规则**：`n[序号]-g`（GROUP）、`n[序号]-code`、`n[序号]-name`、`n[序号]-dept`，edge 用 `e-[源]-[目标]`

---

### 第四步：写入文件

将完整 XML 写入用户指定的输出路径。

---

### 第五步：输出摘要

```
✅ 流程图已生成

文件：[输出路径]
流程：[流程名称]（[流程编码]）
泳道：[泳道1] / [泳道2] / ...
节点：共 [N] 个活动节点，[M] 个判定节点
连接：共 [K] 条连接线

建议：运行 validate-flowchart prompt 对生成结果进行规范验证。
```
