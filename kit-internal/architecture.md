# 架构决策记录

## ADR-014 · 原生 Skill、确定性路由与安全发布基线

**日期**：2026-07
**状态**：已采纳，取代此前冲突决策

### 背景

旧版本存在分类目录导致 Skill 名称发现不稳定、触发词包含匹配易误路由、validate 默认改文件、CLI 部分复制、旧编辑器路径、样例可能暴露业务背景等问题。规范还把某些技术选型当作无条件必选，容易产生误报。

### 决策

1. **原生目录**：已发布 Skill 统一位于 `.github/skills/<skill-name>/SKILL.md`，目录名等于 frontmatter `name`。
2. **渐进加载**：SKILL 只保留核心流程和相对资源入口；长说明移至 `.github/guides/skills/`。
3. **路由 v2**：按短语边界、intent、上下文、负向词、优先级和最小分差评分；低置信度只问一个澄清问题。
4. **只读边界**：validate、review、impact 默认只读；repair 必须明确授权；创建流程只能修正本轮新产物。
5. **设计画像**：数据库与接口先声明方言、租户、删除、审计、ID、并发、认证、响应、分页、版本、幂等和错误模型；未声明时询问或暂挂。
6. **安全 CLI**：安装前全量预检；写入使用事务回滚；状态记录文件哈希；更新保护本地修改；强制覆盖先备份；支持 dry-run、restore 和 safe uninstall。
7. **编辑器现行路径**：只生成九个显式 profile，删除 Cursor/Windsurf/Cline 旧版单文件。
8. **隐私基线**：模板零业务值，样例使用匿名合成标识；doctor 扫描客户标识、专有模块码、行业词和旧表述。
9. **单一设计模型**：可选 `docs/design-model.json` 使用 JSON Schema 2020-12，以稳定 ID 连接术语、字段、功能、流程、页面、表、接口与追溯关系。
10. **发布门禁**：Node 20/22/24、Windows/Linux、doctor、路由回归、CLI 测试、安装烟测、依赖审计和 npm 打包预检。

### 权衡

- 原生目录和短 SKILL 提高发现稳定性，但人读说明需要从 guides 进入。
- 确定性路由牺牲少量自由匹配，换取可回归、可解释的行为。
- 安全更新多了状态与备份目录，但避免静默覆盖用户文件。
- 设计画像要求更多前置信息，但显著降低技术栈误判。

## 当前组件关系

```text
package.json
├── bin/wl-skills-design.js         安全安装与更新 CLI
├── files/
│   ├── .github/skills/             原生 Skills、manifest、路由回归、设计模型
│   ├── .github/standards/          工具无关规范
│   ├── .github/prompts/            显式操作入口
│   └── editor adapters             九个可选 profile
├── scripts/
│   ├── check.js                    doctor
│   ├── sync-editors.js             适配器生成与漂移检查
│   └── package-smoke.js            npm 载荷安装烟测
└── tests/                          CLI、路由、结构与发布回归
```

路由链路：

```text
用户请求
  → 短语规范化与 intent 识别
  → exact / context / negative 评分
  → 阈值与分差判断
  → 选中一个 Skill 或提出一个澄清问题
  → 读取规范、模板、匿名样例
  → 创建或只读验证
```

CLI 状态链路：

```text
init/update
  → 解析 editor profile
  → 全量冲突预检
  → 备份将覆盖文件
  → 临时文件 + 原子替换
  → 失败回滚
  → 写入 .wl-skills-design/state.json
```

## 历史决策状态

| ADR | 主题 | 当前状态 |
|-----|------|----------|
| 001 / 013 | registry 与 manifest | manifest v2 为执行源，registry 仅人读 |
| 002 | 规范与工具分离 | 保留 |
| 003 | 多编辑器适配 | 升级为九个显式 profile |
| 004 / 005 | npm 的 `files/` 分层 | 保留 `files/` 分层 |
| 006–011 | 单域闭环与跨域联动 | 规则保留，默认修复行为已取消 |
| 012 | templates / examples 双层资料 | 保留，并增加匿名化门禁 |

若历史记录与 ADR-014 冲突，以 ADR-014 和当前自动化检查为准。
