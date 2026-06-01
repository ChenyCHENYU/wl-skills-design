---
mode: agent
description: 按 wl-skills-design 规范建立/维护术语字段词典（字段中英文名映射 + 枚举 + 编码注册）
tools:
  - read_file
  - create_file
  - replace_string_in_file
---

# 创建术语 / 字段词典（wl-skills-design 规范）

## 使用方式

```
/create-glossary
项目：烟台华新
来源：docs/spec/* / docs/db/* / docs/api/*（有哪个用哪个）
```

或：`帮我建订单模块的术语字段词典，把 spec/数据库/接口的字段统一起来`

---

## 第一步：加载规范

读取 `.github/standards/08-glossary.md`，作为生成基准：
- 四类词条（§一）+ 字段词条 9 列格式（§二）+ 枚举（§三）+ 编码注册（§四）
- 联动 G1~G5（§六）+ 验证清单 18 项（§七）

## 第二步：建骨架（Sub-01）

按 `skills/cross/glossary/sub/01-build-glossary.md`：
- 先登记编码注册表（领域码 / 子模块代码 / 系统简码），消重
- 对接 spec §2.3 登记业务术语，同义词指向标准名

## 第三步：登记字段 + 枚举（Sub-02，核心）

按 `sub/02-field-entry.md`：
- 从 spec IPO / DB 数据字典 / 接口报文抽取字段，去重
- 逐字段定标准中文名 + 英文名（camelCase）+ 逻辑类型
- **唯一性零容忍**：一名多义 / 一义多名 / 类型冲突当场修正
- 枚举字段建枚举组（UPPER_SNAKE，取值与 DB 一致）

## 第四步：写入词典

写入 `docs/glossary/GLOSSARY_{项目}.md`，按 `templates/glossary.md` 五节结构（编码注册 / 业务术语 / 字段词条 / 枚举 / 联动矩阵）。

## 第五步：后置输出

```
使用 Skill：cross-glossary
参考规范：standards/08-glossary.md
字段词条数：[N] | 枚举组数：[M] | 编码数：[K]
词典路径：docs/glossary/GLOSSARY_[项目].md
下一步：运行 validate-glossary 校验三方字段 ⊆ 词典
```
