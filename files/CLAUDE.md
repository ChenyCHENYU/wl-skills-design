<!-- Claude Code 规则文件。由 wl-skills-design 维护，请勿手动编辑正文内容。 -->
<!-- 源文件：.github/copilot-instructions.md，更新方式：手动同步正文内容 -->

---

# Claude Code 产品设计规范（CLAUDE.md）
# 源文件：.github/copilot-instructions.md

---

# wl-skills-design · 产品设计 AI 技能包

> 维护者：[@ChenyCHENYU](https://github.com/ChenyCHENYU)  
> 版本：v1.0.0  
> 更新此文件后，运行各编辑器对应的同步命令使其他配置文件生效。

---

## 一、包的用途

本包为产品设计阶段提供**结构化 AI 辅助能力**，覆盖：

| 域 | 说明 | 状态 |
|----|------|------|
| 系统需求设计 | 业务流程图（draw.io）、原型（规划中） | 🟢 / 🔲 |
| 数据设计 | 数据库 ER / 数据字典 / DDL 设计规范 | 🟢 可用 |
| 接口设计 | 系统集成报文 / RESTful / OpenAPI 规范 | 🟢 可用 |
| 代码设计 | 业务逻辑代码结构规范 | 🔲 规划中 |

---

## 二、AI 使用规则

### 2.1 规范读取原则（Standards Gate）

**不要主动加载所有规范**。按需读取对应领域的规范文件：

```
.github/standards/index.md   ← 先读此文件确认需要哪条规范
```

> 规范是工具无关的（draw.io / Axure / SQL / YAML 均适用），  
> Skill 是工具/编辑器相关的触发层。

### 2.2 Skill 触发路由（Skill Registry）

所有 Skill 的**触发关键词、路径、状态**统一由以下文件维护：

```
.github/skills/_registry.md   ← 唯一数据源，禁止在 SKILL.md 中重复定义触发规则
```

### 2.3 操作流程

当用户提出设计需求时：
1. 识别意图 → 查阅 `_registry.md` 找到对应 Skill
2. 读取该 Skill 的 `SKILL.md` 获取操作指令
3. 按需读取 `standards/` 中的规范文件
4. 执行操作，输出符合规范的设计产物

---

## 三、文件结构说明

> `★` = AI 高频读取的关键文件；`🔲` = 规划中，暂不可用；`kit-internal/` = AI 不读

```
.github/
│
├── copilot-instructions.md              ★ 你正在读的文件（AI 唯一主入口）
│
├── standards/                           ← 设计规范（工具无关，按域编号）
│   ├── index.md                         ★ 规范门控——AI 先读这里，按需加载
│   ├── 01-flowchart.md                  ★ draw.io 泳道流程图规范（15 章节）✅
│   ├── 02-prototype.md                  ← 原型设计规范 🔲
│   ├── 03-database.md                   ★ 数据库设计规范（30 项验证）✅
│   ├── 04-api-design.md                 ★ 接口设计规范（35 项验证）✅
│   └── 05-code-design.md                ← 代码设计规范 🔲
│
├── skills/
│   ├── _registry.md                     ★ Skill 触发词路由（唯一数据源）
│   ├── _compat/                         ← 多编辑器适配层（维护者使用，AI 不读）
│   │   ├── editors.json                 ← 10 个编辑器注册表
│   │   ├── README.md                    ← 适配层设计说明
│   │   └── headers/                     ← 各编辑器头部格式模板（10 个文件）
│   │
│   ├── requirements/                    ← 系统需求设计类 Skill
│   │   └── flowchart/                   ← draw.io 流程图 ✅
│   │       ├── SKILL.md                 ★ AI 触发文件
│   │       ├── USAGE.md                 ← 人读版使用说明
│   │       └── templates/
│   │           └── skeleton.drawio      ← 骨架模板（图例页 + 空白泳道）
│   │
│   ├── data/database/                ← 数据库设计 ✅（SKILL + USAGE + 4 sub + 3 templates）
│   ├── api/restful/                  ← 接口设计 ✅（SKILL + USAGE + 4 sub + 4 templates）
│   └── code/README.md                   ← 代码设计类 Skill 🔲（stub）
│
├── prompts/                             ← VS Code Copilot 提示词
│   ├── create-flowchart.prompt.md       ← 引导式创建流程图
│   ├── validate-flowchart.prompt.md     ← 验证流程图规范符合度
│   ├── create-spec-section.prompt.md    ← 生成需求说明书章节
│   ├── validate-spec-section.prompt.md  ← 验证需求说明书章节
│   ├── create-db-design.prompt.md       ← 生成数据库设计
│   ├── validate-db-design.prompt.md     ← 验证数据库设计
│   ├── create-if-design.prompt.md       ← 生成接口设计
│   └── validate-if-design.prompt.md     ← 验证接口设计
│
└── guides/                              ← 人读指南（非 AI 路由文件）
    ├── usage.md                         ← 业务团队：如何使用本包
    └── architecture.md                  ← 业务团队：架构说明
```

---

## 四、维护说明

- **新增规范**：在 `standards/` 下创建下一个编号文件，并更新 `index.md`
- **新增 Skill**：在对应类别目录创建 `SKILL.md` + `USAGE.md`，并在 `_registry.md` 注册
- **多编辑器同步**：修改本文件后，手动同步各编辑器的根配置文件（参见 `_compat/README.md`）
- **架构决策记录**：请在 `kit-internal/architecture.md` 中记录 ADR
