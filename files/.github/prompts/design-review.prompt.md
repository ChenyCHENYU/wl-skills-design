---
mode: agent
description: 对需求/数据库/接口三份设计产物做集成评审，输出带评分的评审报告（仪表盘 + P0 清单 + 追溯矩阵 + 修复任务）
tools:
  - read_file
  - create_file
  - replace_string_in_file
---

# 设计集成评审（wl-skills-design 规范）

## 使用方式

```
/design-review
评审模块：订单管理
产物：docs/spec/* / docs/db/* / docs/api/*
```

或：`帮我对订单模块做一次整体设计评审，给三份文档打分出报告`

---

## 第一步：加载规范

读取 `.github/standards/07-design-review.md`，作为评审基准：
- 评分模型（§二：维度得分公式 + 综合得分 + 4 等级 + P0 一票否决）
- 问题分级（§三：P0/P1/P2/P3 + 严重度映射）
- D4 跨文档联动 18 项（§四）+ 追溯矩阵（§五）
- 报告六部分结构（§六）+ 执行清单 RV 12 项（§八）+ 模板（§十）

> ⚠️ 本 prompt **不重新逐项检查** spec/DB/IF，只采集它们的 validate 结论再叠加 D4 与评分。

## 第二步：采集三维度结论（Sub-01）

按 `skills/cross/design-review/sub/01-collect.md`：
- D1 需求：spec 验证结论（或现场按 `06-spec-doc.md` 验证 / 标「未提供」）
- D2 数据库：`docs/db/reports/DB_REVIEW_*.md`（30 项；缺则现场触发 `data/database/sub/04`）
- D3 接口：`docs/api/reports/IF_REVIEW_*.md`（35 项；缺则现场触发 `api/restful/sub/04`）

抽取每维度 `{总项, 通过, 失败, 暂挂, 失败明细[]}`。

## 第三步：跨文档三角联动（Sub-02，核心）

按 `sub/02-cross-check.md` 构建九个集合，执行 §四 的 18 项（spec→DB / spec→IF / IF→DB / 命名口径 / 可追溯），并生成**追溯矩阵**（spec功能 → 接口 → 落库表，覆盖所有功能编码）。缺对端文档的项标「跨文件暂挂」。

## 第四步：评分 + 分级（Sub-03）

```
维度得分 = 通过 / (总项 − 暂挂) × 100%
综合得分 = Σ通过 / Σ(总 − 暂挂) × 100%
等级：≥90🟢 / 75-89🟡 / 60-74🟠 / <60🔴
P0 一票否决：有任何 P0 → 综合等级 ≤ 🟠
```

每条失败项按 §三 映射 P0/P1/P2/P3。

## 第五步：输出评审报告

写入 `docs/review/DESIGN_REVIEW_{模块}_{日期}.md`，按 §十 模板六部分：

```
1. 评审摘要（仪表盘：D1~D4 + 综合，得分/等级/P0/P1/P2）
2. P0 问题清单（必修）
3. 各维度详细分析
4. 追溯矩阵
5. 修复任务清单（P0→P1→P2，每条带修复建议）
6. 评审结论（可进入开发/修复后复评/重新设计）+ 下一步 + 待补充信息
```

出报告前过 RV 12 项自检（§八）。

## 第六步：后置输出

```
使用 Skill：cross-design-review
参考规范：standards/07-design-review.md
综合得分：[X%] [等级]（P0=[N]）
报告路径：docs/review/DESIGN_REVIEW_[模块]_[日期].md
评审结论：[结论] + 下一步
```
