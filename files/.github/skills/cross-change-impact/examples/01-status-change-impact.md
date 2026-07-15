# CHANGE_IMPACT — 设备点检新增退回状态

## 1. 变更登记

| 项 | 内容 |
|----|------|
| 变更编号 | CHG-20260615-01 |
| 变更来源 | 评审问题 |
| 变更对象 | 状态字段 `inspectionStatus` |
| 变更动作 | 新增枚举值 |
| 当前描述 | 状态机为 `DRAFT → SUBMITTED → CONFIRMED` |
| 目标描述 | 新增 `REJECTED=已退回`，确认人可退回，退回后提交人可重新提交 |
| 涉及模块 | 设备点检 `EQIP001` |
| 已知文档路径 | `docs/spec/equipment/4.1-inspection.md`、`docs/db/01-inspection.md`、`docs/api/01-inspection.md`、`docs/prototype/01-inspection-list.html` |

## 2. 影响矩阵

| 域 | 影响等级 | 原因 | 需改文件 | 责任 Skill | 复验入口 |
|----|----------|------|----------|------------|----------|
| glossary | P0 | 新状态必须登记枚举编码，否则 DB/API/原型状态口径会分裂 | `docs/glossary/equipment.md` | cross.glossary | validate-glossary |
| spec | P0 | 状态机、处理逻辑、按钮权限均需补退回路径 | `docs/spec/equipment/4.1-inspection.md` | requirements.spec | validate-spec-section |
| DB | P1 | `inspection_status` 枚举说明、默认值约束和数据字典需同步 | `docs/db/01-inspection.md` | data.database | validate-db-design |
| API | P1 | 确认接口需支持退回动作，列表响应需返回新状态 | `docs/api/01-inspection.md` | api.restful | validate-if-design |
| prototype | P1 | 列表状态标签、确认弹窗按钮、退回原因输入需补充 | `docs/prototype/01-inspection-list.html` | requirements.prototype | validate-prototype |
| review | P1 | 状态机变更后必须重跑 D4 追溯矩阵 | `docs/review/DESIGN_REVIEW_设备点检_20260602.md` | cross.designReview | design-review |

## 3. 补丁任务清单

| 优先级 | 任务 | 文件 | 责任 Skill | 前置依赖 | 完成标准 |
|--------|------|------|------------|----------|----------|
| P0 | 登记 `inspectionStatus.REJECTED` 枚举词条 | `docs/glossary/equipment.md` | cross.glossary | 无 | validate-glossary 通过 X01/X02 |
| P0 | 更新 spec 状态机和退回处理逻辑 | `docs/spec/equipment/4.1-inspection.md` | requirements.spec | 任务1 | validate-spec-section 通过状态机检查 |
| P1 | 更新 DB 数据字典和 DDL 枚举说明 | `docs/db/01-inspection.md` | data.database | 任务1 | validate-db-design 通过 DB-X |
| P1 | 更新 API 请求/响应和错误码 | `docs/api/01-inspection.md` | api.restful | 任务2/3 | validate-if-design 通过 IF-X |
| P1 | 更新原型按钮显隐和状态标签 | `docs/prototype/01-inspection-list.html` | requirements.prototype | 任务2/4 | validate-prototype 通过 PT-X |
| P1 | 重跑集成评审并刷新追溯矩阵 | `docs/review/DESIGN_REVIEW_设备点检_20260602.md` | cross.designReview | 任务1-5 | design-review 无 P0 |

## 4. 建议执行顺序

1. 先补 glossary 枚举锚点
2. 再改 spec 状态机和处理逻辑
3. 同步 DB 与 API
4. 最后改 prototype 显隐和文案
5. 重跑 design-review，确认 D4 无 P0/P1 断点

## 5. 阻断项 / 暂挂项

| 类型 | 说明 | 处理建议 |
|------|------|----------|
| 暂挂 | 当前未提供 glossary 文件路径 | 若项目尚无词典，先用 create-glossary 建设备点检词典 |

## 6. CI 验证报告

| 分组 | 总数 | 通过 | 失败 | 暂挂 |
|------|------|------|------|------|
| CI-A 输入完整性 | 4 | 4 | 0 | 0 |
| CI-B 影响覆盖 | 6 | 6 | 0 | 0 |
| CI-C 补丁可执行 | 5 | 5 | 0 | 0 |
| CI-X 跨文档一致性 | 5 | 4 | 0 | 1 |

状态：✅ 可执行（含 1 个 glossary 路径暂挂）

---

## 自检：本样例为何达标

- 覆盖 spec / glossary / DB / API / prototype / review 六个影响域
- P0/P1 均形成可执行补丁任务
- 每个任务均有文件、责任 Skill、前置依赖、完成标准
- 状态机变更按 glossary → spec → DB/API → prototype → review 顺序传播
- 最终包含 validate prompt 和 design-review 复验入口
