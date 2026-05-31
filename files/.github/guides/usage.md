# 使用指南

> 本文档面向**业务团队成员**，说明如何在日常设计工作中使用 AI 技能包。

---

## 一、快速开始

### 1.1 触发 Skill

直接在 AI 对话中描述你的设计需求，AI 会自动识别并调用对应 Skill：

| 你说的话 | 触发的 Skill |
|---------|------------|
| "帮我画一个废钢采购流程图" | 流程图设计 ✅ |
| "生成泳道图，流程是..." | 流程图设计 ✅ |
| "帮我编写需求设计说明书 / IPO 表" | 需求设计说明书 ✅ |
| "帮我设计数据库表结构 / 数据字典" | 数据库设计 ✅ |
| "帮我设计接口 / 集成报文 / RESTful" | 接口设计 ✅ |
| "对这个模块做整体设计评审、打分" | 设计集成评审 ✅ |
| "帮我设计原型" | 原型设计（🔲 规划中） |

### 1.2 使用 Prompt 模板（VS Code Copilot）

在 VS Code Copilot 中，可以使用预置的 Prompt：

1. 打开命令面板 `Ctrl+Shift+P`
2. 输入 `Chat: Use Prompt` 或在聊天框输入 `/`
3. 选择：
   - `create-flowchart` — 引导式创建流程图
   - `validate-flowchart` — 验证流程图是否符合规范

---

## 二、流程图创建（完整流程）

### 2.1 新建流程图

**推荐方式**：使用 `create-flowchart.prompt.md`

```
1. 打开 VS Code Copilot 聊天
2. 选择 create-flowchart prompt
3. 按提示回答：流程名称、所属系统、涉及部门
4. AI 生成符合规范的 .drawio XML
5. 将 XML 保存为 .drawio 文件后用 draw.io 打开
```

**手动方式**：

```
"我需要画一个[流程名称]的流程图，
 涉及部门：[部门A、部门B...]，
 主要步骤是：..."
```

### 2.2 验证已有流程图

```
"帮我验证 [文件路径]/xxx.drawio 是否符合规范"
```

或使用 `validate-flowchart.prompt.md`。

---

## 三、注意事项

- AI 输出的是 **draw.io XML 代码**，需要粘贴到 draw.io 的 `Extras → Edit Diagram` 中使用
- 骨架模板位于：`.github/skills/requirements/flowchart/templates/skeleton.drawio`，可直接用 draw.io 打开作为起点
- 完整规范见：`.github/standards/01-flowchart.md`
- 有疑问或发现规范问题，请联系维护者更新 `standards/` 文件
