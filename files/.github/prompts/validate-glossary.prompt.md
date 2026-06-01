---
mode: agent
description: 以词典为锚点校验 spec/数据库/接口字段是否都在词典中，揪出词典外字段，自动修复后出报告
tools:
  - read_file
  - create_file
  - replace_string_in_file
---

# 校验术语 / 字段词典（wl-skills-design 规范）

## 使用方式

```
/validate-glossary
词典：docs/glossary/GLOSSARY_订单.md
对照：docs/spec/* / docs/db/* / docs/api/*
```

或：`检查一下 spec/数据库/接口的字段是不是都在词典里`

---

## 第一步：加载规范

读取 `.github/standards/08-glossary.md §七（18 项）/ §八（集合比对）`，作为校验基准。

## 第二步：执行校验（Sub-03）

按 `skills/cross/glossary/sub/03-glossary-review.md`：

1. 构建集合：词典字段英文名/中文名/枚举/编码 + DB/接口字段英文名 + spec 字段中文名
2. 执行 18 项（GL-A 完整性 / GL-B 唯一性 / GL-C 命名 / GL-X 三方联动）
3. 重点 GL-X：
   - X01 `DB 字段英文名 ⊆ 词典`
   - X02 `接口字段英文名 ⊆ 词典`
   - X03 `spec 字段中文名 ⊆ 词典`
   - X04 枚举取值 ⊆ 词典枚举组
   - X05 编码 ⊆ 编码注册表

## 第三步：修复（锚点原则）

| 发现 | 处置 |
|------|------|
| 文档有、词典无 | **优先补词典**（新概念），不删文档字段 |
| 文档与词典冲突 | **以词典为准**，修文档（用 `replace_string_in_file`）|
| 一名多义 / 一义多名 | 按 GL-B 修正，统一为单一映射 |

> 修复优先级（§九）：GL-B 唯一性 → GL-X 联动 → GL-C 命名 → GL-A 完整性。

## 第四步：出报告

更新词典末尾的联动矩阵，并落盘验证报告（§九格式）。

## 第五步：后置输出

```
使用 Skill：cross-glossary
参考规范：standards/08-glossary.md
总项数：18 | 通过：[N] | 失败：[M] | 暂挂：[K]
词典外字段：[列出或「无」]
状态：[✅ DONE / ❌ 需修复]
```
