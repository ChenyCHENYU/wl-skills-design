---
mode: agent
description: 验证接口设计是否符合 wl-skills-design 规范，输出结构化报告并自动修复不合格项
tools:
  - read_file
  - replace_string_in_file
---

# 验证接口设计（wl-skills-design 规范）

## 使用方式

```
/validate-if-design
目标文件：docs/api/01-order.md
```

或：`帮我验证 docs/api/01-order.md 是否符合规范`

---

## 第一步：加载规范

读取 `.github/standards/04-api-design.md`，作为验证基准。**唯一权威检查清单为 §十（38 项，IF-A/B/C/D/X 五组）**；IF-X 集合比对算法见 §十一。

> ⚠️ 本 prompt **不自行定义检查项**，所有检查项以 §十 为准，避免双源脱节。

## 第二步：读取目标文件

读取用户指定的 `.md` 文件全部内容（必要时读取关联的 spec / DB 文件用于 X 组比对）。

## 第三步：按内容确定适用检查组，执行 §十 的 38 项

> **IF-A02（编码唯一）与 IF-X（联动）对所有接口设计强制执行。**

| 内容特征 | 适用组 |
|---------|-------|
| 含接口编码/URL | IF-A 命名（A01~A06）|
| 含触发条件/报文 | IF-B 报文结构（B01~B08）|
| 含认证/签名/幂等 | IF-C 安全（C01~C05）|
| 含接口清单/错误码 | IF-D 文档完整性（D01~D08）|
| **所有接口设计** | **IF-X 联动（X01~X08）强制** |

### IF-X 集合比对（强制，按 §十一 执行）

```
SET_SPEC_FN = { spec 中标"需接口"的功能编码 }
SET_IF_FN   = { 接口清单"关联 spec 功能编码"列 }
SET_IF_FLD  = { 接口报文所有字段英文名 }
SET_DB_FLD  = { DB 数据字典所有字段英文名 }

X01：SET_SPEC_FN ⊆ SET_IF_FN（功能全覆盖）
X02：SET_IF_FN ⊆ SET_SPEC_FN（无凭空接口）
X03：SET_IF_FLD ⊆ SET_DB_FLD（字段英文名都能在 DB 找到）
X08：接口编码集合无重复（扫描所有编码，发现重复立即判失败）
```

> 对端文档（spec / DB）不在工作区时，标注对应 X 项为「跨文件暂挂」。

## 第四步：自动修复

按 §十二 优先级（IF-X → IF-A → IF-C → IF-B → IF-D）用 `replace_string_in_file` 修复，修复后复验全部 38 项。

## 第五步：输出验证报告

```
接口设计验证报告 — [模块/分册名]
验证时间：[时间] ｜ 覆盖接口数：N
总项数：35 | 通过：N | 失败：M | 暂挂：K
[✅ 全部通过 / ❌ 存在失败项 / ⚠️ 含暂挂项]

失败项：
  [A02] QM_PM_B_01 编码重复（应递增为 _02）
  [X03] aimPackWt 在 DB 数据字典中不存在
  [B05] 应答报文未采用统一包装
修复动作：
  [A02] 第 2 个接口改为 QM_PM_B_02
  [X03] 联动在 DB 补 aimPackWt
  [B05] 已补 {code,msg,data,traceId} 包装
复验：38/38 通过 → ✅ DONE
```

> 报告同时写入 `docs/api/reports/IF_REVIEW_{模块}_{日期}.md`。
