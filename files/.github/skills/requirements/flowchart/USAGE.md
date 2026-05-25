# 流程图设计 Skill — 使用说明

> **Skill 路径**：`.github/skills/requirements/flowchart/`  
> **AI 触发文件**：`SKILL.md`（AI 读取）  
> **本文档**：人读版，说明此 Skill 的使用方式、适用场景和输出产物。

---

## 这个 Skill 解决什么问题

团队在绘制 draw.io 流程图时，存在：
- 色标不统一（不同人用不同颜色表示同一类业务）
- 节点结构不统一（有的有编码，有的没有）
- 泳道宽度/高度不统一
- 流程图缺少图例页

本 Skill 让 AI 按照团队统一的视觉规范生成 draw.io XML，解决手工绘图的规范一致性问题。

---

## 触发方式

直接在 AI 对话中描述流程需求，以下关键词会触发本 Skill：

> 流程图、泳道图、泳道、flowchart、draw.io、业务流程、生产流程、工作流

---

## 标准对话示例

```
用户：帮我画一个废钢入库检验流程图，
     涉及部门：采购部、质检部、仓储部，
     系统代码：FGPM

Pre-flight：
  ✅ 读取规范：.github/standards/01-flowchart.md
  ✅ 读取模板：.github/skills/requirements/flowchart/templates/skeleton.drawio
  🎯 开始生成 draw.io XML...
```

---

## 输出产物

| 产物 | 格式 | 说明 |
|------|------|------|
| draw.io XML | `.drawio` | 包含图例页 + 流程页，符合团队规范 |
| 节点编码列表 | 文本 | 可复制到流程说明文档 |

---

## 使用 VS Code Prompt（推荐）

- **创建新流程图**：使用 `.github/prompts/create-flowchart.prompt.md`
- **验证已有流程图**：使用 `.github/prompts/validate-flowchart.prompt.md`

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `.github/standards/01-flowchart.md` | 完整规范（15 章节） |
| `.github/skills/requirements/flowchart/templates/skeleton.drawio` | 骨架模板（图例页 + 空白泳道页） |
| `【01】流程图参考/` | 团队历史流程图参考样本 |
