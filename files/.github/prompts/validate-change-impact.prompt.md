---
mode: agent
description: '验证 CHANGE_IMPACT 影响分析报告是否覆盖所有设计域、任务是否可执行，并自动修复缺口'
tools:
  - read_file
  - replace_string_in_file
---

## 验证变更影响分析报告

### 第一步：加载规范

读取 `.github/standards/09-change-impact.md`。

### 第二步：读取目标报告

读取用户指定的 `CHANGE_IMPACT` 报告。

### 第三步：执行 CI-A/B/C/X 检查

逐项检查：

#### CI-A 输入完整性

- A01 变更对象明确
- A02 变更动作明确
- A03 目标描述明确
- A04 涉及模块或功能编码明确

#### CI-B 影响覆盖

- B01 spec 已判断
- B02 glossary 已判断
- B03 DB 已判断
- B04 API 已判断
- B05 prototype 已判断
- B06 review 已判断

#### CI-C 补丁可执行

- C01 每个 P0/P1 影响都有补丁任务
- C02 每个补丁任务有文件路径
- C03 每个补丁任务有责任 Skill
- C04 任务依赖顺序无循环
- C05 完成标准可验证

#### CI-X 跨文档一致性

- X01 字段变更使用 glossary 作命名锚点
- X02 状态变更同步 spec 状态机、DB 枚举、API 字段、prototype 显隐
- X03 接口变更回写 spec 内部接口和 DB 来源
- X04 原型新增字段不越过 spec/glossary 直接进入页面
- X05 最终建议包含对应 validate prompt 或 design-review 复验

### 第四步：自动修复

发现缺口时直接修复：

1. 补缺失影响域
2. 把笼统任务拆成可执行任务
3. 为 P0/P1 补文件、责任 Skill、完成标准
4. 补最终复验入口

### 第五步：输出验证报告

```markdown
## CHANGE_IMPACT 验证报告

总项数：20
通过：N
失败：M
暂挂：K

失败项：
- [编号] 问题：...
  修复：...

状态：✅ 通过 / ❌ 需修复 / ⛔ 阻断
```
