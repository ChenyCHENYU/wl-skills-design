# 设备点检 数据库设计 · 分册总览

## 模块清单

| 序号 | 模块文件 | 模块名称 | 表数 |
|------|---------|---------|------|
| 1 | `01-inspection.md` | 设备点检 | 2 |

## spec → DB 联动矩阵

| spec 功能编码 | IPO 字段（中文）| DB 表 | DB 字段（英文）| 状态 |
|--------------|----------------|-------|---------------|------|
| EQIP001 | 点检单号 | eqm_inspection_main | `inspection_no` | ✅ |
| EQIP001 | 设备编码 | eqm_inspection_main | `device_code` | ✅ |
| EQIP001 | 点检日期 | eqm_inspection_main | `inspection_date` | ✅ |
| EQIP001 | 点检状态 | eqm_inspection_main | `inspection_status` | ✅ |
| EQIP001 | 点检结论 | eqm_inspection_main | `result` | ✅ |
| EQIP001 | 点检项目 | eqm_inspection_dtl | `item_name` | ✅ |
| EQIP001 | 标准值 | eqm_inspection_dtl | `standard_value` | ✅ |
| EQIP001 | 实测值 | eqm_inspection_dtl | `actual_value` | ✅ |
