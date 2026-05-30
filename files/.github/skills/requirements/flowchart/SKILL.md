---
name: requirements-flowchart
description: >
  **流程图绘制规范技能** — 在 draw.io 中按照团队标准绘制业务流程图。
  USE FOR: 创建任何业务流程图、系统流程图、泳道图；生成符合团队视觉规范的 .drawio XML；
  需要色标、节点结构、编码规范时。
  DO NOT USE FOR: 非流程类的架构图、UML 类图等。
tools:
  - create_file
  - read_file
  - replace_string_in_file
---

# draw.io 流程图绘制规范（wl-skills-design 薄包装）

## 使用方式

**第一步（必须）**：读取完整规范文件
```
.github/standards/01-flowchart.md
```
该文件是唯一权威规范来源，包含：画布设置、泳道结构、三层节点模板、色标体系、连接线规范、编码格式、验证清单（15 项）等。

**第二步**：读取骨架模板作为 XML 起点
```
.github/skills/requirements/flowchart/templates/skeleton.drawio
```

---

## 快速参考（完整规范见 standards.md）

### 关键色标

| 最常用模块 | fillColor | strokeColor |
|-----------|-----------|-------------|
| 生产/物流 | `#dae8fc` | `#6c8ebf` |
| 质量管理 | `#cdeb8b` | `#36393d` |
| 采购管理 | `#f8cecc` | `#b85450` |
| 开始/结束 | `#76608a` | `#432D57` |

### 节点尺寸

| 层 | 高度 | 字号 | 颜色 |
|----|------|------|------|
| ① 编码层 | 12px | 10px | 白底 |
| ② 名称层 | 30px | 14px | 模块色 |
| ③ 岗位层 | 12px | 10px | `#eeeeee` |
| **GROUP 总计** | **54px** | — | 宽 76.82px |

### 编码格式
```
[系统代码]-[类型]-[序号]   例：FGPM-E-01
E=金恒平台  C=异质系统  M=人工作业
```

---

## 操作入口

| 任务 | 使用方式 |
|------|---------|
| 创建新流程图 | 使用 `.github/prompts/create-flowchart.prompt.md` |
| 验证已有流程图 | 使用 `.github/prompts/validate-flowchart.prompt.md` |
| 查阅完整规范 | 读取 `.github/standards/01-flowchart.md` |

---

## ⚠️ 闭环工作流（必须遵循）

> 所有流程图生成/修改必须遵循「绘制 → 验证 → 修复 → 复验」循环，**不允许跳过验证直接交付**。

```
[阶段1] 绘制（按规范生成 XML）
      ↓
[阶段2] 验证（执行20项检查清单）
      ↓ 有失败项？
[阶段3] 修复（按01-flowchart.md §十七修复协议）
      ↓
[阶段4] 复验（全20项通过）→ ✅ DONE
```

### 执行规则

| 规则 | 说明 |
|------|------|
| **验证范围** | 执行 `standards/01-flowchart.md §十五` 全 **20 项**检查（含跨文档 5 项）|
| **修复优先级** | 跨文档一致性（16-20）→ GROUP 结构（4-8）→ 编码格式（14）→ 其他 |
| **与 spec 联动** | 若对应 spec 文档已存在，第 16-20 项（跨文档）为必检；spec 未生成时标记为「暂挂-Pending」|

### 与需求设计说明书（spec）联动检查

流程图绘制完成后，若对应的需求设计说明书已存在，**必须额外执行以下联动检查**（对应验证清单 16-20 项）：

| 检查项 | 流程图端 | spec 文档端 | 一致性要求 |
|-------|---------|------------|---------|
| FC-01 | XML 活动节点编码层文字 | 4.x.2 活动说明表「活动编码」列 | 完全相同，双向无遗漏 |
| FC-02 | swimlane `value` 属性（泳道名）| 2.2 岗位定义表「岗位名称」列 | 字面完全匹配 |
| FC-03 | 非虚线系统活动节点数量 | 4.x.3 对照表非「线下操作」行数 | 数量相等 |
| FC-04 | 流程编码（流程总标题括号内）| 4.x.1 流程清单「流程编码」列 | 格式 `[MODULE]-A-[NN]` |
| FC-05 | 活动 E-NN 编码序列 | — | 同流程内从 E-01 连续递增 |

> **冲突处理原则**：以 spec 文档为准。若 spec 未生成，流程图使用占位符 `[TBD-E-01]`，待 spec 完成后回填编码并重新执行第 16-20 项验证。

## 文件与画布基础设置（原规范，已迁移至 standards.md）

```xml
<mxGraphModel
  dx="1665" dy="849"
  grid="1" gridSize="10" guides="1"
  tooltips="1" connect="1" arrows="1" fold="1"
  page="1" pageScale="1"
  pageWidth="1169" pageHeight="827"   <!-- 横版 A4；竖版则 827×1169 -->
  math="0" shadow="0">
```

- **单位**：所有尺寸单位为像素，网格 10px。
- **页面方向**：流程横向发展时用横版（1169×827），纵向流程用竖版（827×1169）。
- **多 Tab**：Tab 1 固定为「流程标准定义」图例页，Tab 2 起为实际流程。

---

## 二、整体结构：泳道容器（Swimlane）

### 2.1 外层主容器（流程总标题）

```xml
<mxCell value="&lt;p style=&quot;line-height: 130%;&quot;&gt;&lt;font style=&quot;font-size: 22px;&quot;&gt;[流程名称]（[流程编码]）&lt;/font&gt;&lt;/p&gt;"
  style="swimlane;html=1;childLayout=stackLayout;resizeParent=1;resizeParentMax=0;
         startSize=30;
         gradientColor=#7ea6e0;fillColor=#dae8fc;strokeColor=#6c8ebf;
         fontSize=15;spacing=2;"
  vertex="1" parent="1">
  <mxGeometry x="..." y="..." width="[总宽]" height="[总高]" as="geometry" />
</mxCell>
```

| 属性 | 值 |
|------|-----|
| 填充色 | `#dae8fc`（浅蓝） |
| 渐变色 | `#7ea6e0` |
| 边框色 | `#6c8ebf` |
| 标题高 | `startSize=30` |
| 标题字号 | 22px，`line-height: 130%` |

### 2.2 内层子泳道（部门/功能域）

```xml
<mxCell value="&lt;span style=&quot;font-size: 18px;&quot;&gt;[部门名称]&lt;/span&gt;"
  style="swimlane;html=1;startSize=25;
         fillColor=#f5f5f5;strokeColor=#666666;gradientColor=#b3b3b3;"
  vertex="1" parent="[主容器id]">
  <mxGeometry y="30" width="[子宽]" height="[总高-30]" as="geometry" />
</mxCell>
```

| 属性 | 值 |
|------|-----|
| 填充色 | `#f5f5f5`（浅灰） |
| 渐变色 | `#b3b3b3` |
| 边框色 | `#666666` |
| 标题高 | `startSize=25` |
| 标题字号 | 18px |
| 竖向起始 | `y="30"`（主容器标题高度） |

> **子泳道宽度**：每个子泳道宽度根据内容决定，一般 200–450px；同一流程各子泳道高度保持一致。

---

## 三、活动节点（操作节点）结构

每个操作节点均为 **3 层垂直 GROUP**，从上到下：

```
┌──────────────────────────────┐  ← ① 活动编码（12px 高，白底）
│         XXXX-X-XX            │
├──────────────────────────────┤  ← ② 活动内容（30px 高，模块色填充）
│         活动名称             │
├──────────────────────────────┤  ← ③ 操作岗位（12px 高，灰底）
│          岗位名称            │
└──────────────────────────────┘
```

**标准宽度**：76.82px（group 整体），**总高**：54px

### 3.1 XML 模板

```xml
<!-- GROUP 容器 -->
<mxCell id="[id]-g" value="" style="group" connectable="0" vertex="1" parent="[泳道id]">
  <mxGeometry x="[x]" y="[y]" width="76.82" height="54" as="geometry" />
</mxCell>

<!-- ① 活动编码 -->
<mxCell id="[id]-a" value="&lt;font style=&quot;font-size: 10px;&quot;&gt;[活动编码]&lt;/font&gt;"
  style="rounded=0;whiteSpace=wrap;html=1;"
  vertex="1" parent="[id]-g">
  <mxGeometry width="76.82" height="12" as="geometry" />
</mxCell>

<!-- ② 活动内容（矩形节点示例，颜色按模块替换） -->
<mxCell id="[id]-b" value="&lt;span style=&quot;font-size: 14px;&quot;&gt;[活动名称]&lt;/span&gt;"
  style="rounded=0;whiteSpace=wrap;html=1;
         fillColor=[模块填充色];strokeColor=[模块边框色];gradientColor=[模块渐变色];
         align=center;verticalAlign=middle;fontFamily=Helvetica;fontSize=12;"
  vertex="1" parent="[id]-g">
  <mxGeometry y="12" width="76.82" height="30" as="geometry" />
</mxCell>

<!-- ③ 操作岗位 -->
<mxCell id="[id]-c" value="&lt;span style=&quot;font-size: 10px;&quot;&gt;[岗位]&lt;/span&gt;"
  style="rounded=0;whiteSpace=wrap;html=1;fontSize=15;
         fillColor=#eeeeee;strokeColor=#36393d;verticalAlign=middle;"
  vertex="1" parent="[id]-g">
  <mxGeometry y="42" width="76.82" height="12" as="geometry" />
</mxCell>
```

> **线下操作**：GROUP 整体加 `dashed=1;dashPattern=8 8;`，三层子元素也各自加 `dashed=1;`。

---

## 四、模块色标体系

| 模块 | fillColor | strokeColor | gradientColor | fontColor |
|------|-----------|-------------|---------------|-----------|
| 生产管理 / 物流管理 | `#dae8fc` | `#6c8ebf` | `#7ea6e0` | default |
| 质量管理 | `#cdeb8b` | `#36393d` | — | default |
| 销售管理 / 营销 | `#ffcc99` | `#36393d` | — | default |
| 采购管理 | `#f8cecc` | `#b85450` | — | default |
| 成本管理 | `#ffe6cc` | `#d79b00` | — | default |
| 计量管理 | `#f5f5f5` | `#666666` | — | `#333333` |
| 安防管理 | `#e1d5e7` | `#9673a6` | — | default |
| 安全管理 | `#ffff88` | `#36393d` | — | default |
| IT 开发 / 数据平台 | `#fad9d5` | `#ae4132` | — | default |
| 设备管理 | `#b0e3e6` | `#0e8088` | — | default |
| 能源管理 | `#fff2cc` | `#d6b656` | — | default |
| 环保管理 | `#d5e8d4` | `#82b366` | — | default |
| 炼钢智能化 | `#1ba1e2` | `#006EAF` | — | `#ffffff` |
| 轧钢智能化 | `#60a917` | `#2D7600` | — | `#ffffff` |
| BIP 异质系统 | `#e6d0de` | `#996185` | `#d5739d` | default |
| 子流程/模型（通用绿） | `#d5e8d4` | `#82b366` | `#97d077` | default |

> **废钢闭环管理**：沿用各参与模块的色标，不单独配色。

---

## 五、节点形状字典

| 场景 | shape 属性 | 说明 |
|------|-----------|------|
| 系统操作（在线） | `rounded=0`（矩形） | 最常用，色填充 |
| 子流程 / 调用其他流程 | `shape=process;backgroundOutline=1` | 两侧有竖线的矩形 |
| 系统表单 / 多文档数据 | `shape=mxgraph.flowchart.multi-document` | 波浪多页图形 |
| 单份单据 / 报告 | `shape=document` | 单波浪文档 |
| 逻辑判定 / 决策 | `rhombus` | 菱形，`fillColor=#cdeb8b;strokeColor=#36393d` |
| 开始 / 结束节点 | `shape=mxgraph.flowchart.terminator;strokeWidth=2` | 圆角矩形，`fillColor=#76608a;strokeColor=#432D57;fontColor=#ffffff` |
| 移动端操作图标 | `shape=mxgraph.office.devices.cell_phone_android_standalone;fillColor=#505050;strokeColor=none` | 纯图标，加底部文字标签 |
| 警示 / 提醒图标 | `shape=mxgraph.office.concepts.whats_new;fillColor=#505050;strokeColor=none` | 纯图标 |
| 检核点图标 | SVG image 节点（见下方模板） | 蓝色勾选图标 |
| 子流程边界框 | `rounded=1;dashed=1;dashPattern=8 8;fillColor=[模块色];strokeColor=[模块边框]` | 圆角虚线矩形，圈住相关节点 |

### 5.1 开始 / 结束节点模板

```xml
<mxCell value="开始"
  style="strokeWidth=2;html=1;shape=mxgraph.flowchart.terminator;
         whiteSpace=wrap;fillColor=#76608a;strokeColor=#432D57;fontColor=#ffffff;"
  vertex="1" parent="[泳道id]">
  <mxGeometry x="[x]" y="[y]" width="61" height="20" as="geometry" />
</mxCell>
```

---

## 六、连接线规范

### 6.1 标准流程线（主流程推进）

```xml
<mxCell style="edgeStyle=orthogonalEdgeStyle;rounded=0;
               orthogonalLoop=1;jettySize=auto;html=1;
               exitX=0.5;exitY=1;exitDx=0;exitDy=0;
               entryX=0.5;entryY=0;entryDx=0;entryDy=0;"
  edge="1"
  source="[源节点-name层id]"     <!-- ← exit from name层（可视节点体底部/侧面） -->
  target="[目标节点-code层id]"   <!-- ← entry to code层（整个GROUP顶部） -->
  parent="[同泳道时=泳道id；跨泳道时=外层主容器id]">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

> ⚠️ **关键规则（来自真实参考文件验证）**  
> - **source** 必须指向 **name 层**（`[id]-name`），从 name 层底部/侧面退出  
> - **target** 必须指向 **code 层**（`[id]-code`），从 code 层顶部/侧面进入  
> - **跨泳道连接**：`parent` 必须设为**外层主容器 id**，不是子泳道 id

| 规则 | 说明 |
|------|------|
| 只用直角折线 | `edgeStyle=orthogonalEdgeStyle` |
| 不用圆角 | `rounded=0` |
| 优先上→下 | exitY=1 → entryY=0 |
| 水平流 | exitX=1 → entryX=0 |
| source 层级 | **name 层**（节点可视体，`[id]-name`） |
| target 层级 | **code 层**（GROUP 顶部，`[id]-code`） |
| 跨泳道 parent | **外层主容器 id**，非子泳道 id ⚠️ |

### 6.2 跨泳道数据/信号粗箭头

```xml
<mxCell style="edgeStyle=orthogonalEdgeStyle;rounded=0;
               orthogonalLoop=1;jettySize=auto;html=1;
               shape=flexArrow;"
  edge="1" parent="[父容器id]">
  <mxGeometry relative="1" as="geometry">
    <mxPoint x="[x1]" y="[y1]" as="sourcePoint" />
    <mxPoint x="[x2]" y="[y2]" as="targetPoint" />
  </mxGeometry>
</mxCell>
```

> 用于强调系统边界之间的大批量数据传递。

### 6.3 数据标注线（说明数据流向）

```xml
<mxCell style="endArrow=classic;html=1;rounded=0;" edge="1" parent="1">
  <mxGeometry relative="1" as="geometry">
    <mxPoint ... as="sourcePoint" />
    <mxPoint ... as="targetPoint" />
  </mxGeometry>
</mxCell>
<!-- 标签跟随 -->
<mxCell value="[数据名称]" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];"
  connectable="0" vertex="1" parent="[线条id]">
  <mxGeometry x="-0.3" relative="1" as="geometry"><mxPoint as="offset" /></mxGeometry>
</mxCell>
```

### 6.4 判定分支标签

在菱形节点出发的线条上，**必须标注判定结果**，如「是」「否」、「通过」「拒绝」等：

```xml
<mxCell value="是" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];"
  connectable="0" vertex="1" parent="[连接线id]">
  <mxGeometry x="-0.2" y="-1" relative="1" as="geometry"><mxPoint as="offset" /></mxGeometry>
</mxCell>
```

---

## 七、活动编码规范

### 格式结构

```
[系统代码] - [流程编号] - [操作类型] - [活动编号]
  (2字母)    (2位数字)    (1字母)      (2位数字)
```

### 示例

| 部分 | 值 | 含义 |
|------|----|------|
| 系统代码 | `MP` | 生产管理（Manufacturing Process） |
| 流程编号 | `01` | 该系统第1个流程 |
| 操作类型 | `E` | 金恒平台操作（E=Electronic Platform） |
| 活动编号 | `01` | 该流程第1个活动 |
| **完整编码** | `MP-01-E-01` | — |

### 操作类型标识

| 标识 | 含义 |
|------|------|
| `E` | 金恒平台（系统在线操作） |
| `C` | 异质系统（第三方/外部系统） |
| `M` | 人工作业（线下/手动操作） |

> 流程（模型）层级编码：`MP-01`（系统代码 + 流程编号）  
> 活动层级编码：在流程编码基础上追加操作类型和活动编号

---

## 八、视觉质量守则

### 8.1 间距与对齐

- **节点间竖向间距**：相邻节点 Y 坐标差 ≥ 20px（节点高 54px + 间隔 ≥ 20px，即步距 ≥ 74px，建议 80px）。
- **同列节点**：X 坐标严格对齐，同一泳道内的主流程节点居中。
- **节点不得重叠**：GROUP 边界与 GROUP 边界之间最小间距 10px。

### 8.2 连接线不压盖文字

- 线条在路由时必须绕开节点，通过 `mxPoint` 手动折点绕过障碍。
- 禁止使用对角线（始终使用直角折线）。
- 跨越多个泳道的连线必须先水平到边界，再垂直穿越，不得斜穿。

### 8.3 泳道宽度分配

- 单泳道最窄 200px，包含多列节点时按 `(节点数 × 节点宽 + 列间距)` 计算。
- 所有子泳道高度必须一致（等于主流程最深泳道高度）。
- 跨泳道连线若需绕行，可在空白处增加折点 `<mxPoint>`。

### 8.4 字体规范

| 位置 | 字号 | 字体 | 加粗 |
|------|------|------|------|
| 外层容器标题 | 22px | 默认 | 否（HTML 标签控制） |
| 子泳道标题 | 18px | 默认 | 否 |
| 活动名称（节点中层） | 14px | Helvetica | 否 |
| 活动编码（节点顶层） | 10px | 默认 | 否 |
| 岗位标签（节点底层） | 10px | 默认 | 否 |
| 数据标签（文档图形） | 8–10px | 默认 | 否 |

### 8.5 禁止事项

- ❌ 禁止节点与节点重叠
- ❌ 禁止连接线与节点文字重叠
- ❌ 禁止使用斜线（非直角折线）
- ❌ 禁止在同一 group 中混用不同模块的色标（颜色串色）
- ❌ 禁止开始/结束节点使用彩色填充（固定使用 `#76608a` 紫色）
- ❌ 禁止判定菱形不标注判定标签
- ❌ 禁止活动编码层为空（每个操作节点必须有编码）

---

## 九、子流程边界框（Boundary Box）

当多个活动节点属于同一子流程时，用虚线圆角矩形框住：

```xml
<mxCell value="" style="rounded=1;whiteSpace=wrap;html=1;
         dashed=1;dashPattern=8 8;
         fillColor=#dae8fc;strokeColor=#6c8ebf;fillColor=none;"
  vertex="1" parent="[泳道id]">
  <mxGeometry x="[x]" y="[y]" width="[w]" height="[h]" as="geometry" />
</mxCell>
```

> 边界框必须在节点之下（z-order 更低），不遮挡节点文字。填充色用模块透明或极浅色。

---

## 十、系统表单 / 数据节点

数据节点（单据、报表、文档）独立于操作节点，置于产生它的节点旁边，紧邻但不重叠：

```xml
<!-- 多份文档（multi-document） -->
<mxCell value="[文档名称]"
  style="html=1;shape=mxgraph.flowchart.multi-document;whiteSpace=wrap;
         fillColor=[模块色];strokeColor=#36393d;
         rounded=0;align=center;verticalAlign=middle;fontSize=8;"
  vertex="1" parent="[泳道id]">
  <mxGeometry x="[x]" y="[y]" width="50" height="22" as="geometry" />
</mxCell>
```

> 数据节点通常置于产生它的操作节点**右侧或下方偏右**，不加入主流程连接线。

---

## 十一、图例页（Tab 1 固定规范）

每个 drawio 文件的第一个 tab 必须是「流程标准定义」图例页，包含：

1. **各模块色标定义表**（色块 + 编号 + 模块名 + 负责部门）
2. **操作节点定义**（三层结构示意）
3. **节点串接定义**（各种连线类型示例）
4. **辅助活动定义**（图标含义说明：移动操作、警示提醒、检核点等）
5. **流程与活动编码定义**（编码格式说明）

---

## 十二、完整节点示例（销售订单节点）

```xml
<mxCell id="ex-g" value="" style="group" connectable="0" vertex="1" parent="[泳道id]">
  <mxGeometry x="160" y="422" width="76.82" height="54" as="geometry" />
</mxCell>
<mxCell id="ex-a" value="&lt;span style=&quot;font-size: 10px;&quot;&gt;SMSC-A-01-E&lt;/span&gt;"
  style="rounded=0;whiteSpace=wrap;html=1;"
  vertex="1" parent="ex-g">
  <mxGeometry width="76.82" height="12" as="geometry" />
</mxCell>
<mxCell id="ex-b" value="&lt;span style=&quot;font-size: 14px;&quot;&gt;销售订单&lt;/span&gt;"
  style="rounded=0;whiteSpace=wrap;html=1;
         fillColor=#ffcc99;strokeColor=#36393d;
         align=center;verticalAlign=middle;fontFamily=Helvetica;fontSize=12;"
  vertex="1" parent="ex-g">
  <mxGeometry y="12" width="76.82" height="30" as="geometry" />
</mxCell>
<mxCell id="ex-c" value="&lt;span style=&quot;font-size: 10px;&quot;&gt;行销部&lt;/span&gt;"
  style="rounded=0;whiteSpace=wrap;html=1;fontSize=15;
         fillColor=#eeeeee;strokeColor=#36393d;verticalAlign=middle;"
  vertex="1" parent="ex-g">
  <mxGeometry y="42" width="76.82" height="12" as="geometry" />
</mxCell>
```

---

## 十三、快速检查清单

绘制完成后逐项核查：

- [ ] 每个泳道都有标题（18px）
- [ ] 外层容器标题含流程名称和编码（22px）
- [ ] 每个操作节点都是 3 层 GROUP（编码/内容/岗位）
- [ ] 开始/结束节点颜色正确（紫色 `#76608a`）
- [ ] 所有菱形判定节点的分支线都有标注
- [ ] 连接线全部为直角折线，无斜线
- [ ] 无任何节点或线条相互压盖
- [ ] 颜色按模块色标使用，无串色
- [ ] 线下操作节点有虚线样式
- [ ] 数据/文档节点使用正确的 multi-document 形状
- [ ] 活动编码格式符合 `[系统]-[流程]-[类型]-[序号]` 规范
- [ ] Tab 1 已包含图例定义页
