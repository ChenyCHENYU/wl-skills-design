# 架构说明（业务团队视角）

> 本文档面向**业务团队**，解释技能包的组织方式，帮助团队理解如何扩展和维护。

---

## 一、整体架构

```
wl-skills-design
│
├── AI 工具链（.github/）          ← AI 可以读取的部分
│   ├── copilot-instructions.md   ← AI 主入口（所有 AI 编辑器共用的内容源）
│   ├── standards/                ← 设计规范（工具无关）
│   ├── skills/                   ← AI 技能（触发层）
│   ├── prompts/                  ← VS Code 提示词
│   └── guides/                   ← 你正在读的文档
│
└── 维护者文档（kit-internal/）   ← AI 不读，仅维护者使用
    ├── architecture.md           ← 架构决策记录
    ├── CONTRIBUTING.md           ← 贡献指南
    └── skills/README.md          ← Skill 规划清单
```

---

## 二、核心设计理念

### 2.1 规范与工具分离

```
standards/01-flowchart.md    ← 规范：说"应该怎么画"（工具无关）
skills/requirements/flowchart/SKILL.md  ← 技能：说"如何在 draw.io 里画"
```

这样设计的好处：规范可以被多个工具的 Skill 复用，不和具体工具绑定。

### 2.2 单一数据源

Skill 的触发关键词只在 `skills/_registry.md` 中定义一次，避免分散维护造成不一致。

### 2.3 多编辑器适配

内容只维护在 `copilot-instructions.md`，通过 `skills/_compat/` 中的头部模板，适配 10 种 AI 编辑器。

---

## 三、扩展新能力

### 新增设计规范

1. 在 `standards/` 下创建编号文件（如 `06-xxx.md`）
2. 更新 `standards/index.md` 的规范表格

### 新增 AI 技能

1. 在对应类别目录创建 `SKILL.md` + `USAGE.md`
2. 在 `_registry.md` 中注册触发词

详细步骤：`kit-internal/CONTRIBUTING.md`
